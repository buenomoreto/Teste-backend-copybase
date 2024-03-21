import { IsNotEmpty } from 'class-validator';
import { Status } from '../types/enum/status-billings';

export class BillingDTO {
  @IsNotEmpty()
  quantity: number;

  @IsNotEmpty()
  chargedIntervalDays: number;

  @IsNotEmpty()
  start: string | Date;

  @IsNotEmpty()
  status: Status;

  @IsNotEmpty()
  statusDate: string | Date;

  cancellationDate: string | Date | null;

  @IsNotEmpty()
  amount: number;

  nextCycle: string | Date | null;

  @IsNotEmpty()
  userId: string;
}
