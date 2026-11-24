'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Product } from '@/types';
import { ArrowDownLeft } from 'lucide-react';

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { productId: string; quantity: number; referenceNumber?: string; notes?: string }) => Promise<void>;
  products: Product[];
  isSubmitting?: boolean;
}

export const StockInModal: React.FC<StockInModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  products,
  isSubmitting = false,
}) => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedProduct = products.find((p) => p.id === productId);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!productId) errs.productId = 'Product selection is required';
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) errs.quantity = 'Quantity must be greater than zero';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      productId,
      quantity: parseInt(quantity, 10),
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock In - Inventory Intake"
      description="Record incoming purchase orders, supplier shipments, or restock batches."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Target Product <span className="text-rose-500">*</span>
          </label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
              errors.productId ? 'border-rose-300' : 'border-slate-200'
            }`}
          >
            <option value="">Select a product to restock...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — Current Stock: {p.stock_quantity}
              </option>
            ))}
          </select>
          {errors.productId && <p className="text-[11px] text-rose-500 mt-1">{errors.productId}</p>}
        </div>

        {selectedProduct && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Current Stock in Warehouse:</span>
            <span className="font-mono font-bold text-slate-800">{selectedProduct.stock_quantity} units</span>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Intake Quantity <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 50"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
              errors.quantity ? 'border-rose-300' : 'border-slate-200'
            }`}
          />
          {errors.quantity && <p className="text-[11px] text-rose-500 mt-1">{errors.quantity}</p>}
        </div>

        {/* Reference Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reference / PO Number (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. PO-2024-904"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
          <textarea
            rows={2}
            placeholder="Supplier details, carrier tracking, or batch notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <ArrowDownLeft className="w-4 h-4" />
            {isSubmitting ? 'Recording...' : 'Confirm Stock In'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
