import React, { useState } from 'react';
import { X, Receipt } from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';
import { PhotoUploader } from '../common/PhotoUploader';

export const AddExpenseModal = ({ isOpen, onClose }) => {
  const { triggerRefresh } = useApp();
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('TRANSPORT');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const categories = [
    { key: 'TRANSPORT', label: 'Transport' },
    { key: 'LOADING', label: 'Loading' },
    { key: 'UNLOADING', label: 'Unloading' },
    { key: 'LABOUR', label: 'Labour' },
    { key: 'RENT', label: 'Rent' },
    { key: 'ELECTRICITY', label: 'Electricity' },
    { key: 'PACKAGING', label: 'Packaging' },
    { key: 'FUEL', label: 'Fuel' },
    { key: 'FOOD', label: 'Food' },
    { key: 'OTHER', label: 'Other' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid expense amount (> 0)');
      return;
    }

    setLoading(true);
    try {
      await api.post('/expenses', {
        expenseDate,
        category,
        amount: Number(amount),
        description,
        receiptUrl
      });
      triggerRefresh();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="p-1 rounded-lg bg-rose-100 text-rose-800"><Receipt className="w-5 h-5" /></span>
              Record Business Expense
            </h3>
            <p className="text-xs text-gray-500">Track lorry, labour, food & operational costs</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Expense Date</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-black text-base text-rose-700"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`py-2 px-2 text-center text-xs font-bold rounded-xl border transition-all ${
                    category === cat.key
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description / Remarks</label>
            <input
              type="text"
              placeholder="e.g. Freight charges for Namakkal lorry"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 text-sm"
            />
          </div>

          <PhotoUploader
            value={receiptUrl}
            onChange={setReceiptUrl}
            label="Expense Receipt / Photo"
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-rose-600/30 disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving Expense...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
