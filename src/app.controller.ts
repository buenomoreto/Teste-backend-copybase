import { Body, Controller, Get } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getInit(@Body() body: any) {
    return { message: 'Conectado com sucesso!' };
  }
}
