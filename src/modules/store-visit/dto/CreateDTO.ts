export interface CreateStoreVisitDto {
  user_id: string;

  visits: {
    customer_id: string;
    visit_date: Date;
  }[];
}