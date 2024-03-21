import { Module } from '@nestjs/common';
import { BillingsModule } from './billings/billings.module';
import { PrismaService } from './database/prisma.service';
import { AppController } from './app.controller';

@Module({
  imports: [BillingsModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
