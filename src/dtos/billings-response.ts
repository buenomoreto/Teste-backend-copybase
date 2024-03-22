import { IsNotEmpty } from 'class-validator';
import { Status } from '../types/enum/billings-status';

export class BillingDTO {
  @IsNotEmpty()
  quantity: number;

  @IsNotEmpty()
  chargedIntervalDays: number;

  @IsNotEmpty()
  start: Date | string;

  @IsNotEmpty()
  status: Status;

  @IsNotEmpty()
  statusDate: Date | string;

  cancellationDate: Date | string | null;

  @IsNotEmpty()
  amount: number;

  nextCycle: Date | string | null;

  @IsNotEmpty()
  userId: string;
}
