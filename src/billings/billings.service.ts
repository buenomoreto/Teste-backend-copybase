import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { BillingDTO } from '../dtos/billings-response';
import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as path from 'path';
import 'moment/locale/pt-br';
moment.locale('pt-br');

@Injectable()
export class BillingsService {
  constructor(private readonly prisma: PrismaService) {}

  async parseBillings(file: Express.Multer.File): Promise<BillingDTO[]> {
    const allowedExtensions = ['.xlsx', '.csv'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        'Formato de arquivo inválido. Apenas arquivos .xlsx ou .csv são permitidos.',
      );
    }

    const workbook = xlsx.read(file.buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet, { raw: false });

    const billings: BillingDTO[] = data.map((item: any) => {
      const billing: BillingDTO = {
        quantity: parseInt(item['quantidade cobranças']),
        chargedIntervalDays: parseInt(item['cobrada a cada X dias']),
        start: moment(item['data início'], [
          'DD/MM/YYYY HH:mm',
          'YYYY-MM-DDTHH:mm:ss',
          'MM/DD/YYYYTHH:mm:ss',
        ]).toISOString(),
        status: item.status,
        statusDate: moment(item['data status'], [
          'DD/MM/YYYY HH:mm',
          'YYYY-MM-DDTHH:mm:ss',
          'MM/DD/YYYYTHH:mm:ss',
        ]).toISOString(),
        cancellationDate: item['data cancelamento']
          ? moment(item['data cancelamento'], [
              'DD/MM/YYYY HH:mm',
              'YYYY-MM-DDTHH:mm:ss',
              'MM/DD/YYYYTHH:mm:ss',
            ]).toISOString()
          : null,
        amount: parseFloat(item.valor),
        nextCycle: moment(item['próximo ciclo'], [
          'DD/MM/YYYY HH:mm',
          'YYYY-MM-DDTHH:mm:ss',
          'MM/DD/YYYYTHH:mm:ss',
        ]).toISOString(),
        userId: item['ID assinante'],
      };
      return billing;
    });

    return billings;
  }

  async saveBillings(billings: BillingDTO[]) {
    for (const billing of billings) {
      await this.prisma.billing.create({ data: billing });
    }
  }

  async calculateMetrics(start: Date, end: Date): Promise<any> {
    const startDate = moment(start, moment.ISO_8601, true);
    const endDate = moment(end, moment.ISO_8601, true);

    if (
      !startDate.isValid() ||
      !endDate.isValid() ||
      startDate.isAfter(endDate)
    ) {
      throw new BadRequestException('Datas de início e fim inválidas.');
    }

    const billings = await this.prisma.billing.findMany({
      where: {
        status: {
          in: ['Ativa', 'Cancelada', 'Trial cancelado'],
        },
        AND: [{ start: { gte: start, lte: end } }],
      },
      select: {
        amount: true,
        start: true,
        status: true,
        userId: true,
      },
    });

    const mrrByMonth: { [key: number]: number } = {};
    const churnByMonth: { [key: number]: number } = {};

    billings.forEach((billing) => {
      const month = moment(billing.start).month();
      if (billing.status === 'Ativa') {
        mrrByMonth[month] = (mrrByMonth[month] || 0) + billing.amount;
      } else if (
        billing.status === 'Cancelada' ||
        billing.status === 'Trial cancelado'
      ) {
        churnByMonth[month] = (churnByMonth[month] || 0) + billing.amount;
      }
    });

    const records = Object.keys(mrrByMonth).map((month) => ({
      month: {
        value: parseInt(month),
        label: moment().month(parseInt(month)).format('MMMM'),
      },
      mrr: {
        total: mrrByMonth[parseInt(month)].toFixed(2) || 0,
      },
      churn: {
        total: churnByMonth[parseInt(month)] || 0,
      },
    }));

    const totalMRR = Object.values(mrrByMonth)
      .reduce((acc, curr) => acc + curr, 0)
      .toFixed(2);
    const totalChurn =
      Object.values(churnByMonth)
        .reduce((acc, curr) => acc + curr, 0)
        .toFixed(2) || '0';

    const response = {
      records,
      total: totalMRR,
      churn: { total: totalChurn },
    };

    return response;
  }

  async listBillings(page: number): Promise<Object> {
    const take = 15;
    
    const skip = (page - 1) * take;

    const total = await this.prisma.billing.count({});

    const billings = await this.prisma.billing.findMany({
      take, 
      skip,
    });

    return {
      billings, 
      currentPage: page, 
      itemsPerPage: take, 
      total,
    };
}

}
