import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Search, ShoppingBag, ArrowUpRight, 
  Receipt, AlertOctagon, X
} from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';

export const Transactions = () => {
  const { formatCurrency, refreshTrigger, openModal } = useApp();
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/transactions?type=${typeFilter}&search=${encodeURIComponent(search)}&startDate=${startDate}&endDate=${endDate}`
      );
      setTransactions(res.data.data || []);
    } catch (e) {
      console.error('Error fetching transactions', e);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTrigger]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'PURCHASE':
        return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
      case 'SUPPLIER_PAYMENT':
        return <ArrowUpRight className="w-5 h-5 text-amber-600" />;
      case 'EXPENSE':
        return <Receipt className="w-5 h-5 text-rose-600" />;
      default:
        return <AlertOctagon className="w-5 h-5 text-gray-600" />;
    }
  };

  const filterTabs = [
    { key: 'ALL', label: 'All' },
    { key: 'PURCHASE', label: 'Purchases' },
    { key: 'SUPPLIER_PAYMENT', label: 'Vendor Payments' },
    { key: 'EXPENSE', label: 'Expenses' },
  ];

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-emerald-600" />
            Vendor Transactions Log
          </h2>
          <p className="text-xs text-gray-500">Searchable ledger history across purchases, vendor payments & expenses</p>
        </div>
      </div>

      {/* Mobile-Friendly Type Filter Pills (Horizontal Scroll Container) */}
      <div className="w-full max-w-full overflow-x-auto pb-1 scrollbar-none flex items-center gap-2">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setTypeFilter(tab.key)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all min-h-[44px] flex items-center justify-center shrink-0 ${
              typeFilter === tab.key
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Date Controls */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search Tx ID, Vendor name, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden min-h-[44px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2.5 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-700 min-h-[44px]"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2.5 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-700 min-h-[44px]"
          />
        </div>
      </div>

      {/* Transactions Feed List */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3">
        {loading ? (
          <p className="text-xs text-center text-gray-400 py-8">Loading transaction history...</p>
        ) : transactions.length === 0 ? (
          <p className="text-xs text-center text-gray-400 py-8">No matching transactions found</p>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50/50 border border-gray-200 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-xs shrink-0">
                  {getTypeIcon(tx.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-bold text-xs sm:text-sm text-gray-900 truncate max-w-[130px] sm:max-w-none">{tx.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 uppercase">
                      {tx.type.replace('SUPPLIER_', 'VENDOR ').replace('_', ' ')}
                    </span>
                    {tx.status && <StatusBadge status={tx.status} />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {tx.partyName ? `${tx.partyName} (${tx.partyCode})` : (tx.category || 'General')} • {tx.date}
                    {tx.billNumber ? ` • Bill #${tx.billNumber}` : ''}
                    {tx.totalWeightKg ? ` • ${tx.totalWeightKg} KG` : tx.thars ? ` • ${tx.thars} Thars` : ''}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm sm:text-base font-black text-gray-900 block">
                  {formatCurrency(tx.totalAmount)}
                </span>
                {tx.balanceAmount > 0 && (
                  <span className="text-[10px] text-rose-700 font-bold block">Due: {formatCurrency(tx.balanceAmount)}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-mono break-all">{selectedTx.id}</h3>
                <p className="text-xs text-gray-500">{selectedTx.type.replace('_', ' ')} Details</p>
              </div>
              <button onClick={() => setSelectedTx(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Date:</span>
                <span className="font-bold text-gray-900">{selectedTx.date}</span>
              </div>

              {selectedTx.billNumber && (
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Bill Number:</span>
                  <span className="font-bold text-emerald-800 font-mono text-sm">#{selectedTx.billNumber}</span>
                </div>
              )}

              {selectedTx.partyName && (
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Vendor:</span>
                  <span className="font-bold text-gray-900">{selectedTx.partyName} ({selectedTx.partyCode})</span>
                </div>
              )}

              {selectedTx.totalWeightKg ? (
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Total Weight:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {selectedTx.totalWeightKg} KG @ ₹{selectedTx.ratePerKg || selectedTx.unitPrice}/KG
                  </span>
                </div>
              ) : selectedTx.thars ? (
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Thars Count:</span>
                  <span className="font-bold text-emerald-700 text-sm">{selectedTx.thars} Thars @ ₹{selectedTx.unitPrice}</span>
                </div>
              ) : null}

              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Total Amount:</span>
                <span className="font-black text-gray-900 text-base">{formatCurrency(selectedTx.totalAmount)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Paid Amount:</span>
                <span className="font-bold text-emerald-700 text-sm">{formatCurrency(selectedTx.paidAmount)}</span>
              </div>

              {selectedTx.balanceAmount > 0 && (
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Remaining Balance Due:</span>
                  <span className="font-bold text-rose-700 text-sm">{formatCurrency(selectedTx.balanceAmount)}</span>
                </div>
              )}

              {selectedTx.notes && (
                <div className="py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Notes:</span>
                  <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded-xl">{selectedTx.notes}</p>
                </div>
              )}

              {/* Payment Allocations Breakdown */}
              {selectedTx.allocations && selectedTx.allocations.length > 0 && (
                <div className="pt-2">
                  <h4 className="font-bold text-gray-900 uppercase text-[11px] mb-2">Payment Allocation Breakdown</h4>
                  <div className="space-y-1.5">
                    {selectedTx.allocations.map((a, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex justify-between items-center text-emerald-950">
                        <span className="font-mono text-xs">{a.paymentCode || a.targetTxId || 'Allocation'}</span>
                        <span className="font-bold">{formatCurrency(a.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTx.attachmentUrl && (
                <div className="pt-2">
                  <span className="text-gray-500 block mb-1">Receipt Attachment:</span>
                  <img src={selectedTx.attachmentUrl} alt="Receipt" className="w-full h-40 object-cover rounded-2xl border border-gray-200" />
                </div>
              )}
            </div>

            {selectedTx.type === 'PURCHASE' && (
              <button
                onClick={() => {
                  const txToView = selectedTx;
                  setSelectedTx(null);
                  openModal('purchaseBill', { purchase: txToView });
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl min-h-[44px] flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Receipt className="w-4 h-4" />
                <span>View / Print Cash Bill</span>
              </button>
            )}

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-3 bg-gray-900 text-white font-bold text-sm rounded-xl min-h-[44px]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
