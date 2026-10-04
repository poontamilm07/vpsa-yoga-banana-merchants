import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Ban, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'PAID':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          PAID
        </span>
      );
    case 'PARTIALLY_PAID':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          PARTIALLY PAID
        </span>
      );
    case 'UNPAID':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          UNPAID
        </span>
      );
    case 'VOID':
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">
          <Ban className="w-3.5 h-3.5 text-gray-400" />
          VOID
        </span>
      );
    case 'RECEIVABLE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
          <ArrowDownLeft className="w-3.5 h-3.5 text-blue-600" />
          RECEIVABLE
        </span>
      );
    case 'PAYABLE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
          <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
          PAYABLE
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
};
