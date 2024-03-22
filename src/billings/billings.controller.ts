import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BillingsService } from './billings.service';

@Controller('api')
export class BillingsController {
  constructor(private readonly billingsService: BillingsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const billings = await this.billingsService.parseBillings(file);

    await this.billingsService.saveBillings(billings);

    return { message: 'Arquivo carregado com sucesso!' };
  }

  @Get('metrics')
  async getMMR(
    @Query('start') start: Date,
    @Query('end') end: Date,
  ): Promise<Object> {
    return await this.billingsService.calculateMetrics(start, end);
  }

  @Get('listing')
  async getBillings(@Query('page') page: number): Promise<Object> {
    return await this.billingsService.listBillings(page);
  }
}
