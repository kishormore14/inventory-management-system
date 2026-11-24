export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export type MovementType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';

export type StockStatus = 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  product_count?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  category_name?: string;
  description: string | null;
  unit_price: number;
  stock_quantity: number;
  reorder_level: number;
  created_at: string;
  updated_at: string;
  stock_status?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  product_name?: string;
  sku?: string;
  movement_type: MovementType;
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalInventoryUnits: number;
  totalInventoryValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export interface CategoryValueStat {
  categoryId: string;
  categoryName: string;
  productCount: number;
  totalUnits: number;
  totalValue: number;
}
