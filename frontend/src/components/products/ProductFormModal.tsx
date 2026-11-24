'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Category, Product } from '@/types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  product?: Product | null;
  categories: Category[];
  isSubmitting?: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product = null,
  categories,
  isSubmitting = false,
}) => {
  const isEdit = Boolean(product);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    categoryId: '',
    description: '',
    unitPrice: '',
    initialStock: '',
    reorderLevel: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        categoryId: product.category_id || '',
        description: product.description || '',
        unitPrice: String(product.unit_price ?? ''),
        initialStock: String(product.stock_quantity ?? 0),
        reorderLevel: String(product.reorder_level ?? 0),
      });
    } else {
      setFormData({
        sku: '',
        name: '',
        categoryId: categories[0]?.id || '',
        description: '',
        unitPrice: '',
        initialStock: '0',
        reorderLevel: '5',
      });
    }
    setFormErrors({});
  }, [product, categories, isOpen]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.sku.trim()) errors.sku = 'SKU is required';
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.categoryId) errors.categoryId = 'Category is required';

    const price = parseFloat(formData.unitPrice);
    if (isNaN(price) || price < 0) errors.unitPrice = 'Price must be >= 0';

    if (!isEdit) {
      const stock = parseInt(formData.initialStock, 10);
      if (isNaN(stock) || stock < 0) errors.initialStock = 'Initial stock must be >= 0';
    }

    const reorder = parseInt(formData.reorderLevel, 10);
    if (isNaN(reorder) || reorder < 0) errors.reorderLevel = 'Reorder level must be >= 0';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: any = {
      sku: formData.sku.trim(),
      name: formData.name.trim(),
      categoryId: formData.categoryId,
      description: formData.description.trim() || null,
      unitPrice: parseFloat(formData.unitPrice),
      reorderLevel: parseInt(formData.reorderLevel, 10),
    };

    if (!isEdit) {
      payload.initialStock = parseInt(formData.initialStock, 10);
    }

    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Add New Product'}
      description={
        isEdit
          ? 'Modify catalog details. Stock quantities can only be modified through inventory movements.'
          : 'Create a new inventory item and assign its category and reorder threshold.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* SKU */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              SKU <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ELEC-MBP-14"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                formErrors.sku ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {formErrors.sku && <p className="text-[11px] text-rose-500 mt-1">{formErrors.sku}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                formErrors.categoryId ? 'border-rose-300' : 'border-slate-200'
              }`}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {formErrors.categoryId && <p className="text-[11px] text-rose-500 mt-1">{formErrors.categoryId}</p>}
          </div>
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Product Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. MacBook Pro 14 M3"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
              formErrors.name ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
            }`}
          />
          {formErrors.name && <p className="text-[11px] text-rose-500 mt-1">{formErrors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
          <textarea
            rows={2}
            placeholder="Optional specifications or product notes..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Unit Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unit Price ($) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                formErrors.unitPrice ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {formErrors.unitPrice && <p className="text-[11px] text-rose-500 mt-1">{formErrors.unitPrice}</p>}
          </div>

          {/* Initial Stock (Only for Add) */}
          {!isEdit ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Stock <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.initialStock}
                onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                  formErrors.initialStock ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
              {formErrors.initialStock && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.initialStock}</p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Current Stock (Immutable)
              </label>
              <div className="w-full px-3 py-2 text-xs bg-slate-100/70 border border-slate-200 rounded-xl font-mono text-slate-500 cursor-not-allowed">
                {product?.stock_quantity} units
              </div>
            </div>
          )}

          {/* Reorder Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reorder Level <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.reorderLevel}
              onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
              className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                formErrors.reorderLevel ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {formErrors.reorderLevel && (
              <p className="text-[11px] text-rose-500 mt-1">{formErrors.reorderLevel}</p>
            )}
          </div>
        </div>

        {isEdit && (
          <p className="text-[11px] text-slate-400 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            Note: Inventory quantities must be adjusted through Stock Movements to preserve ledger integrity.
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
