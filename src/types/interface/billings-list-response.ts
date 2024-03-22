import { BillingDTO } from '../../dtos/billings-response';

export interface Response {
  billings: BillingDTO[] | any[];
  currentPage: number;
  itemsPerPage: number;
  total: number;
}
