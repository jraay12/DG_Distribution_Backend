import { ProductRepository } from "../product/product.repository";

export class StatsService {
  constructor(private productRepo: ProductRepository) {}

  async getDashboardStats(): Promise<{ productCount: number }> {
    const productCount = await this.productRepo.productCount();

    return { productCount };
  }
}
