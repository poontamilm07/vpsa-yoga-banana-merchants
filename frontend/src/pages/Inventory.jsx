import React, { useState, useEffect, useCallback } from 'react';
import { Package, Plus, AlertOctagon, TrendingUp, TrendingDown, RefreshCw, Calculator, DollarSign } from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import { StockAdjustmentModal } from '../components/modals/StockAdjustmentModal';

export const Inventory = () => {
  const { formatCurrency, refreshTrigger } = useApp();
  const [stockInfo, setStockInfo] = useState({ 
    currentStock: 0, 
    lowStock: false,
    todayPurchased: 0,
    todaySold: 0,
    todayDamaged: 0,
    avgCostPerThar: 0,
    estimatedStockValue: 0
  });
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const [stockRes, moveRes] = await Promise.all([
        api.get('/inventory/stock'),
        api.get('/inventory/movements')
      ]);
      setStockInfo(stockRes.data.data || {});
      setMovements(moveRes.data.data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory, refreshTrigger]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-amber-600" />
            Inventory & Stock Valuation
          </h2>
          <p className="text-xs text-gray-500">Stock audit formula, movement history & estimated stock value</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdjustOpen(true)}
            className="px-4 py-3 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-2xl shadow-md flex items-center gap-2"
          >
            <AlertOctagon className="w-5 h-5 text-amber-400" />
            <span>Log Damage / Adjustment</span>
          </button>
        </div>
      </div>

      {/* Stock Formula Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase">Current Stock</span>
          <p className="text-3xl font-black text-amber-700 mt-1">{stockInfo.currentStock || 0} <span className="text-sm font-normal">Thars</span></p>
          <span className="text-[10px] text-gray-400 font-medium">Available in shop</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 shadow-xs">
          <span className="text-xs font-bold text-emerald-800 uppercase">Estimated Stock Value</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{formatCurrency(stockInfo.estimatedStockValue)}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Avg Cost: {formatCurrency(stockInfo.avgCostPerThar)} / Thar</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase">Today Purchased</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">+{stockInfo.todayPurchased || 0} <span className="text-sm font-normal">Thars</span></p>
          <span className="text-[10px] text-gray-400 font-medium">Stock added today</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase">Today Sold / Damaged</span>
          <p className="text-2xl font-black text-blue-700 mt-1">-{stockInfo.todaySold || 0} <span className="text-sm font-normal">Sold</span></p>
          <span className="text-[10px] text-rose-600 font-medium">-{stockInfo.todayDamaged || 0} Damaged Thars</span>
        </div>
      </div>

      {/* Stock Accounting Formula Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Calculator className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs font-semibold">
            <span className="font-bold">Inventory Formula: </span>
            <span className="bg-white px-2 py-1 rounded-lg border border-amber-200">Purchases (+)</span>
            <span className="mx-1">-</span>
            <span className="bg-white px-2 py-1 rounded-lg border border-amber-200">Sales (-)</span>
            <span className="mx-1">-</span>
            <span className="bg-white px-2 py-1 rounded-lg border border-amber-200">Damaged (-)</span>
            <span className="mx-1">=</span>
            <span className="font-bold text-amber-900 bg-amber-200/60 px-2 py-1 rounded-lg">Current Stock ({stockInfo.currentStock} Thars)</span>
          </div>
        </div>
      </div>

      {/* Stock Movement Feed */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-base font-extrabold text-gray-900">Traceable Stock Movement Feed</h3>
          <button
            onClick={fetchInventory}
            className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="space-y-3">
          {movements.length === 0 ? (
            <p className="text-xs text-center text-gray-400 py-8">No inventory movements recorded yet</p>
          ) : (
            movements.map((m) => {
              const isPositive = m.tharsChange > 0;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMovement(m)}
                  className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between hover:bg-gray-100/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{m.type}</span>
                        <span className="text-[10px] font-mono bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                          {m.referenceId || 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{m.notes} • {m.transactionDate}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-base font-black ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isPositive ? `+${m.tharsChange}` : m.tharsChange} Thars
                    </span>
                    <span className="text-[10px] text-gray-400 block">Resulting Stock: {m.resultingStock} Thars</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <StockAdjustmentModal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
      />
    </div>
  );
};
