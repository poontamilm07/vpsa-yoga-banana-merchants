import React, { useState } from 'react';
import { X, PackagePlus, AlertOctagon } from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

export const StockAdjustmentModal = ({ isOpen, onClose }) => {
  const { triggerRefresh } = useApp();
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('DAMAGE'); // DAMAGE or ADJUSTMENT
  const [tharsChange, setTharsChange] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const changeVal = Number(tharsChange);
    if (!changeVal || changeVal === 0) {
      setError('Please enter a non-zero number of Thars');
      return;
    }

    // For DAMAGE type, make sure tharsChange is negative
    let finalChange = changeVal;
    if (type === 'DAMAGE' && changeVal > 0) {
      finalChange = -changeVal;
    }

    setLoading(true);
    try {
      await api.post('/inventory/adjust', {
        transactionDate,
        type,
        tharsChange: finalChange,
        notes
      });
      triggerRefresh();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record stock adjustment');
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
              <span className="p-1 rounded-lg bg-orange-100 text-orange-800"><AlertOctagon className="w-5 h-5" /></span>
              Stock Adjustment / Damage
            </h3>
            <p className="text-xs text-gray-500">Log damaged, expired, or manual stock count changes</p>
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
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('DAMAGE')}
              className={`py-2 text-center text-xs font-bold rounded-xl transition-all ${
                type === 'DAMAGE' ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-600'
              }`}
            >
              Damaged / Expired (-)
            </button>
            <button
              type="button"
              onClick={() => setType('ADJUSTMENT')}
              className={`py-2 text-center text-xs font-bold rounded-xl transition-all ${
                type === 'ADJUSTMENT' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600'
              }`}
            >
              Stock Audit (+ / -)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Date</label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Thars Quantity</label>
              <input
                type="number"
                placeholder={type === 'DAMAGE' ? 'e.g. 2' : 'e.g. +5 or -3'}
                value={tharsChange}
                onChange={(e) => setTharsChange(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-bold text-base text-gray-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Reason / Notes</label>
            <input
              type="text"
              placeholder="e.g. 2 Thars spoiled during transit"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 text-sm"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gray-900 hover:bg-black text-white font-bold text-base rounded-2xl shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving Adjustment...' : 'Record Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
