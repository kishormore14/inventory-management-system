'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Product } from '@/types';
import { StockBadge } from '../ui/StockBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Layers, Calendar, DollarSign, AlertCircle, FileText } from 'lucide-react';

interface ProductDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductDetailDrawer: React.FC<ProductDetailDrawerProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Details"
      description={`Catalog record for SKU: ${product.sku}`}
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Name and Status Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <h4 className="text-base font-bold text-slate-900">{product.name}</h4>
            <span className="text-xs font-mono text-slate-500">{product.sku}</span>
          </div>
          <StockBadge status={product.stock_status} />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Unit Price</span>
            </div>
            <div className="text-sm font-bold text-slate-900 font-mono">
              {formatCurrency(product.unit_price)}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Current Stock</span>
            </div>
            <div className="text-sm font-bold text-slate-900 font-mono">
              {product.stock_quantity} units
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Reorder Level</span>
            </div>
            <div className="text-sm font-bold text-slate-900 font-mono">
              {product.reorder_level} units
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Total Value</span>
            </div>
            <div className="text-sm font-bold text-slate-900 font-mono">
              {formatCurrency(product.unit_price * product.stock_quantity)}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Description</span>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
            {product.description || 'No description provided.'}
          </p>
        </div>

        {/* Audit Meta */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Created At
            </span>
            <span className="font-mono text-slate-600">{formatDate(product.created_at)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Last Updated
            </span>
            <span className="font-mono text-slate-600">{formatDate(product.updated_at)}</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
};
