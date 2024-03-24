export interface MetricsResponse {
  records: {
    month: { value: number; label: string };
    mrr: { total: string | number };
    churn: { total: string | number };
  }[];
  total: string | number;
  churn: { total: string | number };
}
