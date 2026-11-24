'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Product } from '@/types';
import { RefreshCw } from 'lucide-react';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { productId: string; actualStock: number; referenceNumber?: string; notes: string }) => Promise<void>;
  products: Product[];
  isSubmitting?: boolean;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  products,
  isSubmitting = false,
}) => {
  const [productId, setProductId] = useState('');
  const [actualStock, setActualStock] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedProduct = products.find((p) => p.id === productId);

  const parsedActual = parseInt(actualStock, 10);
  const currentStock = selectedProduct ? selectedProduct.stock_quantity : 0;
  const difference = !isNaN(parsedActual) && selectedProduct ? parsedActual - currentStock : null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!productId) errs.productId = 'Product selection is required';
    if (isNaN(parsedActual) || parsedActual < 0) {
      errs.actualStock = 'Actual stock quantity cannot be negative';
    } else if (difference === 0) {
      errs.actualStock = 'Actual stock is identical to current stock. No adjustment needed.';
    }
    if (!notes.trim()) {
      errs.notes = 'Reason for adjustment is required for audit compliance';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      productId,
      actualStock: parsedActual,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Adjustment - Physical Audit"
      description="Reconcile recorded stock with physical count. The calculated delta will be recorded in the audit ledger."
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
            <option value="">Select product to adjust...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — Recorded: {p.stock_quantity}
              </option>
            ))}
          </select>
          {errors.productId && <p className="text-[11px] text-rose-500 mt-1">{errors.productId}</p>}
        </div>

        {selectedProduct && (
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-500 block">Recorded Stock:</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{currentStock}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Calculated Delta:</span>
              <span
                className={`font-mono font-bold text-sm ${
                  difference === null || difference === 0
                    ? 'text-slate-500'
                    : difference > 0
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                {difference === null
                  ? '-'
                  : difference > 0
                  ? `+${difference}`
                  : difference}
              </span>
            </div>
          </div>
        )}

        {/* Actual Stock */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Actual Physical Count <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            placeholder="Counted quantity on warehouse shelves..."
            value={actualStock}
            onChange={(e) => setActualStock(e.target.value)}
            className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
              errors.actualStock ? 'border-rose-300' : 'border-slate-200'
            }`}
          />
          {errors.actualStock && <p className="text-[11px] text-rose-500 mt-1">{errors.actualStock}</p>}
        </div>

        {/* Reference */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Audit Ticket / Reference (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. AUDIT-2024-Q3"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Notes (Required) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason for Adjustment <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="Explain reason for discrepancy (e.g. damaged goods, misplaced inventory, physical audit count)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
              errors.notes ? 'border-rose-300' : 'border-slate-200'
            }`}
          />
          {errors.notes && <p className="text-[11px] text-rose-500 mt-1">{errors.notes}</p>}
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {isSubmitting ? 'Adjusting...' : 'Confirm Adjustment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
