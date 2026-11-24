'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { ProductDetailDrawer } from '@/components/products/ProductDetailDrawer';
import { StockBadge } from '@/components/ui/StockBadge';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { Product, Category, StockStatus } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Edit, 
  Trash2, 
  Package, 
  RefreshCw 
} from 'lucide-react';

export default function ProductsPage() {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & sorting
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StockStatus>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteBlockedReason, setDeleteBlockedReason] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProducts({
        search: search.trim() || undefined,
        categoryId: selectedCategory || undefined,
        stockStatus: selectedStatus,
        sortBy,
        sortOrder,
        page,
        limit: pageSize,
      });
      setProducts(data.products);
      setTotalProducts(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedStatus, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Save (Add / Edit)
  const handleSaveProduct = async (payload: any) => {
    setIsSaving(true);
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        toast.success(`Product '${payload.name}' updated successfully.`);
        setEditingProduct(null);
      } else {
        await api.createProduct(payload);
        toast.success(`Product '${payload.name}' created successfully.`);
        setIsAddModalOpen(false);
      }
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    setDeleteBlockedReason(null);

    try {
      await api.deleteProduct(deletingProduct.id);
      toast.success(`Product '${deletingProduct.name}' deleted successfully.`);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err: any) {
      // Backend returns explicit error if inventory movements exist
      setDeleteBlockedReason(err.message || 'Cannot delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen(true)} title="Products Catalog" />

        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Products</h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage your product master, SKUs, category assignments, and pricing
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {error && <ErrorState message={error} onRetry={fetchProducts} />}

          {/* Filters & Search Control Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by product name or SKU..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as any);
                    setSortOrder(order as any);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                >
                  <option value="createdAt-desc">Newest Added</option>
                  <option value="name-asc">Name (A &rarr; Z)</option>
                  <option value="name-desc">Name (Z &rarr; A)</option>
                  <option value="price-asc">Price (Low &rarr; High)</option>
                  <option value="price-desc">Price (High &rarr; Low)</option>
                  <option value="stock-asc">Stock (Low &rarr; High)</option>
                  <option value="stock-desc">Stock (High &rarr; Low)</option>
                </select>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Status:
              </span>
              {(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] as StockStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setSelectedStatus(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors whitespace-nowrap ${
                    selectedStatus === st
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {st === 'ALL'
                    ? 'All Items'
                    : st === 'IN_STOCK'
                    ? 'In Stock'
                    : st === 'LOW_STOCK'
                    ? 'Low Stock'
                    : 'Out of Stock'}
                </button>
              ))}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              {loading ? (
                <TableSkeleton rows={8} columns={7} />
              ) : products.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No products found"
                  description="No items match your search criteria or filter selections. Try clearing filters or adding a new product."
                  actionText="Add Product"
                  onAction={() => setIsAddModalOpen(true)}
                />
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-6">SKU</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Unit Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Reorder Level</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-6 font-mono font-medium text-slate-500">{p.sku}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{p.name}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px]">
                            {p.category_name || 'Unassigned'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                          {formatCurrency(p.unit_price)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {p.stock_quantity}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{p.reorder_level}</td>
                        <td className="py-3.5 px-4">
                          <StockBadge status={p.stock_status} />
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewingProduct(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingProduct(p);
                                setDeleteBlockedReason(null);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <Pagination
              currentPage={page}
              totalItems={totalProducts}
              pageSize={pageSize}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        </main>
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingProduct) && (
        <ProductFormModal
          isOpen={isAddModalOpen || Boolean(editingProduct)}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }}
          onSubmit={handleSaveProduct}
          product={editingProduct}
          categories={categories}
          isSubmitting={isSaving}
        />
      )}

      {/* Detail Drawer */}
      <ProductDetailDrawer
        isOpen={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
        product={viewingProduct}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        onClose={() => {
          setDeletingProduct(null);
          setDeleteBlockedReason(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to permanently delete '${deletingProduct?.name}' (${deletingProduct?.sku})? This action cannot be undone.`}
        confirmText="Delete Product"
        isLoading={isDeleting}
        blockedReason={deleteBlockedReason}
      />
    </div>
  );
}
