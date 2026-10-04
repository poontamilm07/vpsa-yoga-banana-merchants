import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, AlertTriangle, Repeat } from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

export const AddSaleModal = ({ isOpen, onClose, defaultCustomerId = null }) => {
  const { settings, triggerRefresh, formatCurrency } = useApp();
  const [customers, setCustomers] = useState([]);
  const [currentStock, setCurrentStock] = useState(0);
  const [customerId, setCustomerId] = useState(defaultCustomerId || '');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [thars, setThars] = useState('');
  const [pricePerThar, setPricePerThar] = useState(settings.defaultSellingPrice || '700');
  const [paymentReceived, setPaymentReceived] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/customers').then(res => setCustomers(res.data.data || [])).catch(() => {});
      api.get('/inventory/stock').then(res => setCurrentStock(res.data.data?.currentStock || 0)).catch(() => {});
      if (defaultCustomerId) setCustomerId(defaultCustomerId);
    }
  }, [isOpen, defaultCustomerId]);

  if (!isOpen) return null;

  const tharsNum = Number(thars) || 0;
  const priceNum = Number(pricePerThar) || 0;
  const totalAmount = tharsNum * priceNum;
  const receivedNum = Number(paymentReceived) || 0;
  const balanceAmount = Math.max(0, totalAmount - receivedNum);

  const handleRepeatLastSale = async () => {
    if (!customerId) return;
    try {
      const res = await api.get(`/sales/last-customer-sale/${customerId}`);
      const lastSale = res.data.data;
      if (lastSale) {
        setThars(lastSale.thars.toString());
        setPricePerThar(lastSale.pricePerThar.toString());
        setPaymentReceived(lastSale.receivedAmount.toString());
        if (lastSale.paymentMethod) setPaymentMethod(lastSale.paymentMethod);
      }
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerId) {
      setError('Please select a customer');
      return;
    }
    if (tharsNum <= 0) {
      setError('Please enter a valid number of Thars (> 0)');
      return;
    }

    setLoading(true);
    try {
      await api.post('/sales', {
        customerId: Number(customerId),
        saleDate,
        thars: tharsNum,
        pricePerThar: priceNum,
        paymentReceived: receivedNum,
        paymentMethod,
        notes
      });
      triggerRefresh();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save sale');
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
              <span className="p-1 rounded-lg bg-blue-100 text-blue-800"><ShoppingCart className="w-5 h-5" /></span>
              Add Customer Sale
            </h3>
            <p className="text-xs text-gray-500">Sell Thars to Customer</p>
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

        {tharsNum > currentStock && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Warning: Selling quantity ({tharsNum} Thars) exceeds current stock ({currentStock} Thars)</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-700 uppercase">Customer</label>
              {customerId && (
                <button
                  type="button"
                  onClick={handleRepeatLastSale}
                  className="text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
                >
                  <Repeat className="w-3 h-3" />
                  Repeat Last Sale
                </button>
              )}
            </div>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.customerCode}) - Bal: {formatCurrency(c.outstandingBalance)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Sale Date</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Thars Count</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 5"
                value={thars}
                onChange={(e) => setThars(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-bold text-base text-blue-700"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Selling Price per Thar (₹)</label>
            <input
              type="number"
              step="0.01"
              value={pricePerThar}
              onChange={(e) => setPricePerThar(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm"
              required
            />
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-blue-950">
              <span>Total Bill Amount:</span>
              <span className="text-lg font-extrabold">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-medium text-blue-800 pt-1 border-t border-blue-200">
              <span>Customer Balance Outstanding:</span>
              <span className="font-bold text-rose-700">{formatCurrency(balanceAmount)}</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-700 uppercase">Payment Received (₹)</label>
              <button
                type="button"
                onClick={() => setPaymentReceived(totalAmount.toString())}
                className="text-[11px] font-bold text-blue-700 underline"
              >
                Received Full ({formatCurrency(totalAmount)})
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              placeholder="0 (or partial payment amount)"
              value={paymentReceived}
              onChange={(e) => setPaymentReceived(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 font-semibold text-sm"
            />
          </div>

          {receivedNum > 0 && (
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
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {method.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="Sale notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-600/30 disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving Sale...' : 'Save Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
