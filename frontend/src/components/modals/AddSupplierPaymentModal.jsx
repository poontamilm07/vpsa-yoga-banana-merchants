import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, QrCode, Building2 } from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

export const AddSupplierPaymentModal = ({ isOpen, onClose, defaultSupplierId = null }) => {
  const { settings, triggerRefresh, formatCurrency } = useApp();
  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState(defaultSupplierId || '');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      api.get('/suppliers').then(res => setSuppliers(res.data.data || [])).catch(() => {});
      if (defaultSupplierId) setSupplierId(defaultSupplierId.toString());
    }
  }, [isOpen, defaultSupplierId]);

  useEffect(() => {
    if (isOpen && supplierId) {
      api.get(`/suppliers/${supplierId}`)
        .then(res => {
          if (res.data?.data) {
            setSelectedSupplier(res.data.data);
          }
        })
        .catch(() => {
          setSelectedSupplier(null);
        });
    } else if (!supplierId) {
      setSelectedSupplier(null);
    }
  }, [isOpen, supplierId]);

  if (!isOpen) return null;

  const currentOutstanding = selectedSupplier ? Number(selectedSupplier.outstandingBalance || 0) : 0;
  const amountNum = amount !== '' ? Number(amount) : 0;
  const isInvalidAmount = amount !== '' && (isNaN(amountNum) || amountNum <= 0);
  const isExceededAmount = amount !== '' && amountNum > currentOutstanding;

  const paymentErrorMessage = isInvalidAmount
    ? 'Payment amount must be greater than zero.'
    : isExceededAmount
      ? `Payment amount ${formatCurrency(amountNum)} cannot exceed the outstanding amount ${formatCurrency(currentOutstanding)}.`
      : '';

  const isSaveDisabled = loading || isInvalidAmount || isExceededAmount || amount === '' || !supplierId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!supplierId) {
      setError('Please select a supplier');
      return;
    }
    if (isInvalidAmount || amount === '') {
      setError('Payment amount must be greater than zero.');
      return;
    }
    if (isExceededAmount) {
      setError(`Payment amount ${formatCurrency(amountNum)} cannot exceed the outstanding amount ${formatCurrency(currentOutstanding)}.`);
      return;
    }

    setLoading(true);
    try {
      await api.post('/supplier-payments', {
        supplierId: Number(supplierId),
        paymentDate,
        amount: amountNum,
        paymentMethod,
        referenceNo,
        notes
      });
      triggerRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to process payment');
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
              <span className="p-1 rounded-lg bg-amber-100 text-amber-800"><ArrowUpRight className="w-5 h-5" /></span>
              Pay Vendor
            </h3>
            <p className="text-xs text-gray-500">Record cash/UPI/Bank payment to vendor</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {(error || paymentErrorMessage) && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error || paymentErrorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Vendor</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="">-- Select Vendor --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.supplierCode}) - Outstanding: {formatCurrency(s.outstandingBalance)}
                </option>
              ))}
            </select>
          </div>

          {selectedSupplier && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-amber-900">Current Outstanding Due:</span>
              <span className="font-black text-amber-900 text-sm">{formatCurrency(selectedSupplier.outstandingBalance)}</span>
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
                placeholder="e.g. 10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full p-3 rounded-xl border font-black text-base transition-colors ${
                  isExceededAmount || isInvalidAmount 
                    ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-2 focus:ring-rose-500' 
                    : 'border-gray-300 text-amber-800 focus:ring-2 focus:ring-amber-500'
                }`}
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
                  className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition-all min-h-[44px] flex items-center justify-center ${
                    paymentMethod === method
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {method.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Configurable UPI details */}
          {paymentMethod === 'UPI' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-950">
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>UPI Business Payment Info:</span>
              </div>
              <p className="text-gray-700">UPI Name: <b>{settings.upiName || 'VPSA YOGA BANANA MERCHANTS'}</b></p>
              <p className="text-gray-700">UPI ID: <b className="text-blue-700">{settings.upiId || 'vpsayoga@upi'}</b></p>
            </div>
          )}

          {/* Configurable Bank details */}
          {paymentMethod === 'BANK_TRANSFER' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Bank Account Info:</span>
              </div>
              <p className="text-gray-700">Holder: <b>{settings.bankAccountHolder || 'VPSA YOGA BANANA MERCHANTS'}</b></p>
              <p className="text-gray-700">Bank: <b>{settings.bankName || 'State Bank of India'}</b> ({settings.bankBranch || 'Namakkal'})</p>
              <p className="text-gray-700">A/C: <b className="text-emerald-800">{settings.bankAccountNumber || '39876543210'}</b> | IFSC: <b>{settings.bankIfsc || 'SBIN0001234'}</b></p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Reference / UTR No (Optional)</label>
            <input
              type="text"
              placeholder="UPI Txn ID or UTR No"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="Payment remarks"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaveDisabled}
              className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-amber-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Processing Payment...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
