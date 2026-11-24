import { ApiResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data: ApiResponse<T> = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.message || (data.errors && data.errors[0]) || 'Network request failed';
        throw new Error(errorMessage);
      }

      return data.data as T;
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Dashboard APIs
  async getDashboardStats() {
    return this.request<any>('/dashboard/stats');
  }

  async getLowStockProducts() {
    return this.request<any[]>('/dashboard/low-stock');
  }

  async getRecentMovements() {
    return this.request<any[]>('/dashboard/recent-movements');
  }

  async getCategoryValues() {
    return this.request<any[]>('/dashboard/category-value');
  }

  // Product APIs
  async getProducts(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'ALL') {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ products: any[]; total: number }>(`/products${queryString}`);
  }

  async getProductById(id: string) {
    return this.request<any>(`/products/${id}`);
  }

  async createProduct(data: any) {
    return this.request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any) {
    return this.request<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request<any>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Category APIs
  async getCategories() {
    return this.request<any[]>('/categories');
  }

  async createCategory(data: { name: string; description?: string | null }) {
    return this.request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: { name: string; description?: string | null }) {
    return this.request<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request<any>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Inventory APIs
  async stockIn(data: { productId: string; quantity: number; referenceNumber?: string; notes?: string }) {
    return this.request<any>('/inventory/stock-in', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async stockOut(data: { productId: string; quantity: number; referenceNumber?: string; notes?: string }) {
    return this.request<any>('/inventory/stock-out', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async stockAdjustment(data: { productId: string; actualStock: number; referenceNumber?: string; notes: string }) {
    return this.request<any>('/inventory/adjustment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMovements(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ movements: any[]; total: number }>(`/inventory/movements${queryString}`);
  }
}

export const api = new ApiClient();
