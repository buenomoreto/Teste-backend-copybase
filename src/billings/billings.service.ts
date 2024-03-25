import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { BillingDTO } from '../dtos/billings-response';
import { BillingsResponse } from '../types/interface/billings-list-response';
import { MetricsResponse } from 'src/types/interface/billings-metrics-response';
import { Status } from '../types/enum/billings-status';
import * as xlsx from 'xlsx';
import * as path from 'path';
// Para que o Moment funcione localmente, é necessário importá-lo da seguinte forma:
// import * as moment from 'moment';
import moment from 'moment';
import 'moment/locale/pt-br';

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
    const billings: BillingDTO[] = data.map((item: any) =>
      this.parseBillingData(item),
    );

    return billings;
  }

  private parseBillingData(item: any): BillingDTO {
    return {
      quantity: parseInt(item['quantidade cobranças']),
      chargedIntervalDays: parseInt(item['cobrada a cada X dias']),
      start: this.parseDate(item['data início']),
      status: item.status,
      statusDate: this.parseDate(item['data status']),
      cancellationDate: item['data cancelamento']
        ? this.parseDate(item['data cancelamento'])
        : null,
      amount: parseFloat(item.valor),
      nextCycle: this.parseDate(item['próximo ciclo']),
      userId: item['ID assinante'],
    };
  }

  private parseDate(dateString: string): string {
    return moment(dateString, [
      'DD/MM/YYYY HH:mm',
      'YYYY-MM-DDTHH:mm:ss',
      'MM/DD/YYYYTHH:mm:ss',
    ]).toISOString();
  }

  async saveBillings(billings: BillingDTO[]) {
    for (const billing of billings) {
      await this.prisma.billing.create({ data: billing });
    }
  }

  async calculateMetrics(start: Date, end: Date): Promise<MetricsResponse> {
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

    const records = Object.keys(mrrByMonth).map((month) => {
      const monthIndex = parseInt(month);
      const mrrTotal = mrrByMonth[monthIndex] || 0;
      const churnTotal = churnByMonth[monthIndex] || 0;

      return {
        month: {
          value: monthIndex,
          label: moment().month(monthIndex).format('MMMM'),
        },
        mrr: {
          total: mrrTotal.toFixed(2),
        },
        churn: {
          total: churnTotal.toFixed(2),
        },
      };
    });

    const totalMRR =
      Object.values(mrrByMonth)
        .reduce((acc, curr) => acc + curr, 0)
        .toFixed(2) || 0;
    const totalChurn =
      Object.values(churnByMonth)
        .reduce((acc, curr) => acc + curr, 0)
        .toFixed(2) || 0;

    const response = {
      records,
      total: totalMRR,
      churn: { total: totalChurn },
    };

    return response;
  }

  async listBillings(page: number, status: Status): Promise<BillingsResponse> {
    const take = 15;
    const skip = (page - 1) * take;

    const where = {
      status: {
        equals: status,
      },
    };

    const [total, billings] = await Promise.all([
      this.prisma.billing.count({ where }),
      this.prisma.billing.findMany({ take, skip, where }),
    ]);

    const numberOfPages = Math.ceil(total / take);

    return {
      billings,
      currentPage: page,
      itemsPerPage: take,
      numberOfPages,
      total,
    };
  }
}
