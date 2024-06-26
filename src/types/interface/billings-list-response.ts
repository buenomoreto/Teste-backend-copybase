import { BillingDTO } from '../../dtos/billings-response';

export interface BillingsResponse {
  billings: BillingDTO[] | any[];
  currentPage: number;
  itemsPerPage: number;
  total: number;
  numberOfPages: number;
}
