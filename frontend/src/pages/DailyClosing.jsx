import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Calendar, Lock } from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';

export const DailyClosing = () => {
  const { formatCurrency, triggerRefresh } = useApp();
  const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState(null);
  const [isClosed, setIsClosed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [closingLocking, setClosingLocking] = useState(false);

  const fetchDailyData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, statusRes] = await Promise.all([
        api.get(`/daily-closing/summary?date=${closingDate}`),
        api.get(`/daily-closing/status?date=${closingDate}`)
      ]);
      setSummary(sumRes.data.data);
      setIsClosed(statusRes.data.data?.isClosed || false);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [closingDate]);

  useEffect(() => {
    fetchDailyData();
  }, [fetchDailyData]);

  const handleConfirmCloseDay = async () => {
    if (!window.confirm(`Are you sure you want to close the business day for ${closingDate}?`)) {
      return;
    }

    setClosingLocking(true);
    try {
      await api.post('/daily-closing/close', { closingDate });
      setIsClosed(true);
      triggerRefresh();
      alert('Day closed successfully!');
    } catch (err) {
      alert(err.message || 'Failed to close day');
    } finally {
      setClosingLocking(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-amber-600" />
            End of Day (EOD) Daily Closing
          </h2>
          <p className="text-xs text-gray-500">Reconcile cash flow, stock count & freeze daily report</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={closingDate}
            onChange={(e) => setClosingDate(e.target.value)}
            className="p-2.5 rounded-xl border border-gray-300 font-bold text-sm bg-white"
          />
        </div>
      </div>

      {isClosed ? (
        <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm">Business Day Closed</h4>
              <p className="text-xs text-emerald-700">The day {closingDate} has been confirmed & locked into history.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-full">CLOSED</span>
        </div>
      ) : (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <h4 className="font-extrabold text-sm">Day Pending Closing</h4>
            <p className="text-xs text-amber-800">Please audit cash received/paid and confirm day closing below.</p>
          </div>
        </div>
      )}

      {/* Summary Audit Grid */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
        <h3 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3">
          Daily Reconciliation Summary — {closingDate}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase">Thars Purchased</span>
            <p className="text-2xl font-black text-emerald-700">{summary?.tharsPurchased || 0} Thars</p>
            <span className="text-xs text-gray-500">{formatCurrency(summary?.purchaseValue)}</span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase">Thars Sold</span>
            <p className="text-2xl font-black text-blue-700">{summary?.tharsSold || 0} Thars</p>
            <span className="text-xs text-gray-500">{formatCurrency(summary?.salesValue)}</span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase">EOD Closing Stock</span>
            <p className="text-2xl font-black text-amber-700">{summary?.closingStock || 0} Thars</p>
            <span className="text-xs text-gray-500">In shop inventory</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 uppercase">Est. Day Profit</span>
            <p className="text-2xl font-black text-emerald-700">{formatCurrency(summary?.estimatedProfit)}</p>
            <span className="text-xs text-emerald-600">Net after COGS & Expenses</span>
          </div>
        </div>

        {/* Cash Audit Breakdown */}
        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
          <h4 className="font-bold text-sm text-gray-900 uppercase">Cash & Bank Audit</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-200">
              <span className="text-gray-600">Total Customer Money Received:</span>
              <span className="font-bold text-emerald-700 text-sm">{formatCurrency(summary?.customerReceived)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-200">
              <span className="text-gray-600">Total Supplier Payments Made:</span>
              <span className="font-bold text-rose-700 text-sm">{formatCurrency(summary?.supplierPayments)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-200">
              <span className="text-gray-600">Total Expenses Paid:</span>
              <span className="font-bold text-rose-700 text-sm">{formatCurrency(summary?.expenses)}</span>
            </div>
          </div>
        </div>

        {!isClosed && (
          <div className="pt-2">
            <button
              onClick={handleConfirmCloseDay}
              disabled={closingLocking}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              <Lock className="w-5 h-5" />
              <span>{closingLocking ? 'Closing Day...' : 'Confirm & Close Day'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
