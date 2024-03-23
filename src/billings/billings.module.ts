import { Module } from '@nestjs/common';
import { BillingsController } from './billings.controller';
import { BillingsService } from './billings.service';
import { PrismaService } from '../database/prisma.service';
import moment from 'moment';

@Module({
  imports: [],
  controllers: [BillingsController],
  providers: [BillingsService, PrismaService, 
    {
      provide: 'MomentWrapper',
      useValue: moment
    },
  ],
})
export class BillingsModule {}
