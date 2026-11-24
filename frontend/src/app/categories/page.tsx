'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CategoryModal } from '@/components/categories/CategoryModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { Category } from '@/types';
import { formatDate } from '@/lib/utils';
import { Plus, Tags, Edit, Trash2, Layers } from 'lucide-react';

export default function CategoriesPage() {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleteBlockedReason, setDeleteBlockedReason] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSaveCategory = async (payload: { name: string; description?: string }) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, payload);
        toast.success(`Category '${payload.name}' updated successfully.`);
        setEditingCategory(null);
      } else {
        await api.createCategory(payload);
        toast.success(`Category '${payload.name}' created successfully.`);
        setIsCreateOpen(false);
      }
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    setDeleteBlockedReason(null);

    try {
      await api.deleteCategory(deletingCategory.id);
      toast.success(`Category '${deletingCategory.name}' deleted successfully.`);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err: any) {
      // Backend validates that no products are assigned
      setDeleteBlockedReason(err.message || 'Cannot delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen(true)} title="Categories Management" />

        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Categories</h2>
              <p className="text-xs text-slate-500 mt-1">
                Organize catalog items, manage taxonomy groupings, and track product distribution
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              New Category
            </button>
          </div>

          {error && <ErrorState message={error} onRetry={fetchCategories} />}

          {/* Categories Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              {loading ? (
                <TableSkeleton rows={6} columns={5} />
              ) : categories.length === 0 ? (
                <EmptyState
                  icon={Tags}
                  title="No categories found"
                  description="No categories have been established. Create your first category above to begin organizing items."
                  actionText="Create Category"
                  onAction={() => setIsCreateOpen(true)}
                />
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-6">Category Name</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Assigned Products</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-6 font-semibold text-slate-800">{c.name}</td>
                        <td className="py-3.5 px-4 text-slate-500 max-w-sm truncate" title={c.description || ''}>
                          {c.description || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                            <Layers className="w-3 h-3 text-slate-400" />
                            {c.product_count || 0} product{(c.product_count || 0) === 1 ? '' : 's'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{formatDate(c.created_at)}</td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingCategory(c)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Edit Category"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingCategory(c);
                                setDeleteBlockedReason(null);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Category"
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
          </div>
        </main>
      </div>

      {/* Create / Edit Modal */}
      {(isCreateOpen || editingCategory) && (
        <CategoryModal
          isOpen={isCreateOpen || Boolean(editingCategory)}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingCategory(null);
          }}
          onSubmit={handleSaveCategory}
          category={editingCategory}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingCategory)}
        onClose={() => {
          setDeletingCategory(null);
          setDeleteBlockedReason(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete category '${deletingCategory?.name}'?`}
        confirmText="Delete Category"
        isLoading={isDeleting}
        blockedReason={deleteBlockedReason}
      />
    </div>
  );
}
