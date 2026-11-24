import { dashboardRepository } from '../repositories/dashboard.repository';
import { CategoryValueStat, DashboardStats, InventoryMovement, Product } from '../types';

export class DashboardService {
  async getStats(): Promise<DashboardStats> {
    return dashboardRepository.getStats();
  }

  async getLowStockProducts(): Promise<Product[]> {
    return dashboardRepository.getLowStockProducts(10);
  }

  async getRecentMovements(): Promise<InventoryMovement[]> {
    return dashboardRepository.getRecentMovements(10);
  }

  async getCategoryValue(): Promise<CategoryValueStat[]> {
    return dashboardRepository.getCategoryValue();
  }
}

export const dashboardService = new DashboardService();
