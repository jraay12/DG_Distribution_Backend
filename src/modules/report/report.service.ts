import { BadRequestError } from "../../utils/error/BadRequestError";
import { ReportRepository } from "./report.repository";

export class ReportService {
  constructor(private reportRepo: ReportRepository) {}

  private date(value?: string): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw new BadRequestError("Invalid report date");
    return date;
  }

  async sales(filters: { from?: string; to?: string; user_id?: string }) {
    const records = await this.reportRepo.getSales({
      from: this.date(filters.from), to: this.date(filters.to), user_id: filters.user_id,
    });
    return {
      summary: {
        transaction_count: records.length,
        gross_sales: records.reduce((sum, row) => sum + (row.subtotal_amount?.toNumber() ?? 0), 0),
        discounts: records.reduce((sum, row) => sum + (row.discount_amount?.toNumber() ?? 0), 0),
        net_sales: records.reduce((sum, row) => sum + (row.total_amount?.toNumber() ?? 0), 0),
      },
      records,
    };
  }

  async inventory() {
    const records = await this.reportRepo.getInventory();
    return {
      summary: {
        product_count: records.length,
        warehouse_units: records.reduce((sum, row) => sum + (row.inventory?.quantity ?? 0), 0),
        low_stock_count: records.filter(row => row.inventory?.reorder_level != null && row.inventory.quantity <= row.inventory.reorder_level).length,
        out_of_stock_count: records.filter(row => (row.inventory?.quantity ?? 0) === 0).length,
      },
      records,
    };
  }

  async agents(filters: { from?: string; to?: string; user_id?: string }) {
    const records = await this.reportRepo.getAgentPerformance({
      from: this.date(filters.from), to: this.date(filters.to), user_id: filters.user_id,
    });
    return records.map(agent => {
      const visits = agent.storeVisit;
      const sales = visits.flatMap(visit => visit.transaction);
      return {
        id: agent.id, name: agent.name, email: agent.email, isActive: agent.isActive,
        assigned_stores: visits.length,
        visited_stores: visits.filter(visit => visit.time_in && visit.time_out).length,
        unvisited_stores: visits.filter(visit => !visit.time_in && !visit.time_out).length,
        reports_created: visits.reduce((sum, visit) => sum + visit.deliveryReports.length, 0),
        sales_count: sales.length,
        total_sales: sales.reduce((sum, sale) => sum + (sale.total_amount?.toNumber() ?? 0), 0),
      };
    });
  }
}
