import React from 'react';
import { ShoppingBag, ArrowUpRight, UserPlus, Receipt, X, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const QuickActionSheet = ({ isOpen, onClose }) => {
  const { openModal } = useApp();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAction = (modalName) => {
    onClose();
    openModal(modalName);
  };

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Quick Vendor Action</h3>
            <p className="text-xs text-gray-500">Record purchases & payments</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleAction('purchase')}
            className="flex flex-col items-start p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/80 transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-emerald-950">+ Purchase</span>
            <span className="text-xs text-emerald-700">Buy Thars from Vendor</span>
          </button>

          <button
            onClick={() => handleAction('addSupplierPayment')}
            className="flex flex-col items-start p-4 rounded-2xl bg-amber-50 border border-amber-100 hover:bg-amber-100/80 transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-amber-500 text-white mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-amber-950">Make Payment</span>
            <span className="text-xs text-amber-700">Pay Vendor Debt</span>
          </button>

          <button
            onClick={() => handleAction('addSupplier')}
            className="flex flex-col items-start p-4 rounded-2xl bg-blue-50 border border-blue-100 hover:bg-blue-100/80 transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-blue-600 text-white mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-blue-950">Add Vendor</span>
            <span className="text-xs text-blue-700">New Supplier Account</span>
          </button>

          <button
            onClick={() => handleNavigate('/outstanding')}
            className="flex flex-col items-start p-4 rounded-2xl bg-orange-50 border border-orange-100 hover:bg-orange-100/80 transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-orange-600 text-white mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-orange-950">Outstanding</span>
            <span className="text-xs text-orange-700">View Pending Dues</span>
          </button>
        </div>

        <button
          onClick={() => handleAction('expense')}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-rose-50 border border-rose-100 hover:bg-rose-100/80 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-xs group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-rose-950 block">Record Expense</span>
              <span className="text-xs text-rose-700">Freight, Labour, Transport</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
