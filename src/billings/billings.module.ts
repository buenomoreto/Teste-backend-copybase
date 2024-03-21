import { Module } from '@nestjs/common';
import { BillingsController } from './billings.controller';
import { BillingsService } from './billings.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [],
  controllers: [BillingsController],
  providers: [BillingsService, PrismaService],
})
export class BillingsModule {}
