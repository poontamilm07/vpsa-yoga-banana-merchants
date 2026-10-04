import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft } from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

export const AddCustomerPaymentModal = ({ isOpen, onClose, defaultCustomerId = null }) => {
  const { triggerRefresh, formatCurrency } = useApp();
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState(defaultCustomerId || '');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/customers').then(res => setCustomers(res.data.data || [])).catch(() => {});
      if (defaultCustomerId) setCustomerId(defaultCustomerId);
    }
  }, [isOpen, defaultCustomerId]);

  if (!isOpen) return null;

  const selectedCustomer = customers.find(c => c.id === Number(customerId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerId) {
      setError('Please select a customer');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid payment amount (> 0)');
      return;
    }

    setLoading(true);
    try {
      await api.post('/customer-payments', {
        customerId: Number(customerId),
        paymentDate,
        amount: Number(amount),
        paymentMethod,
        referenceNo,
        notes
      });
      triggerRefresh();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process customer payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-100 text-indigo-800"><ArrowDownLeft className="w-5 h-5" /></span>
              Receive Customer Payment
            </h3>
            <p className="text-xs text-gray-500">Collect cash/online payment</p>
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
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.customerCode}) - Outstanding: {formatCurrency(c.outstandingBalance)}
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-indigo-900">Current Outstanding Receivable:</span>
              <span className="font-black text-indigo-900 text-sm">{formatCurrency(selectedCustomer.outstandingBalance)}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-black text-base text-indigo-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Payment Method</label>
            <div className="grid grid-cols-4 gap-2">
              {['CASH', 'UPI', 'BANK_TRANSFER', 'OTHER'].map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition-all ${
                    paymentMethod === method
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {method.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Reference No (Optional)</label>
            <input
              type="text"
              placeholder="UPI Txn ID or reference"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="Receipt notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all"
            >
              {loading ? 'Processing Receipt...' : 'Record Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
