import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, ArrowUpRight, 
  Users, RefreshCw, ShieldAlert, Plus, Phone, MessageSquare
} from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { openModal, refreshTrigger, formatCurrency, settings = {} } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/dashboard');
      setData(res.data.data);
    } catch (e) {
      console.error('Error fetching dashboard data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard, refreshTrigger]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-gray-500">Loading Vendor Business Overview...</p>
      </div>
    );
  }

  const todayDateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="space-y-5 max-w-full overflow-x-hidden">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-3xl p-5 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Official Merchant System</span>
          <h2 className="text-2xl font-black tracking-tight mt-0.5">{settings.businessName || 'VPSA YOGA BANANA MERCHANTS'}</h2>
          <p className="text-xs text-emerald-200 mt-1">{todayDateStr} — Daily KG Purchasing, Payments & Cash Bills</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-emerald-700/80 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-emerald-600/50 min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Primary Outstanding Due Banner Card */}
      <div className="bg-gradient-to-br from-amber-600 via-amber-500 to-banana-500 p-6 rounded-3xl text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-white/20 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-100" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-amber-100">Total Vendor Outstanding</h3>
          </div>
          <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
            Active Payables Audit
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-bold text-amber-100">Total Vendor Dues</span>
            <p className="text-3xl font-black text-white mt-1">{formatCurrency(data?.totalSupplierPayable)}</p>
          </div>
          <div>
            <span className="text-xs font-bold text-amber-100">Today's Vendor Payments</span>
            <p className="text-3xl font-black text-emerald-200 mt-1">{formatCurrency(data?.todayPaymentsValue ?? 0)}</p>
          </div>
        </div>
      </div>

      {/* Key Vendor Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Today KG Purchased</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">
            {data?.todayKgPurchased ?? (data?.todayTharsPurchased ? data.todayTharsPurchased * 15 : 0)} <span className="text-xs font-normal">KG</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">{formatCurrency(data?.todayPurchaseValue ?? 0)}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Today Vendor Payments</span>
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700">{formatCurrency(data?.todayPaymentsValue ?? 0)}</p>
          <span className="text-[11px] text-gray-400 font-medium block mt-0.5">Paid to suppliers</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Vendor Payables</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-700">{formatCurrency(data?.totalSupplierPayable)}</p>
          <span className="text-[11px] text-gray-400 font-medium block mt-0.5">Total Dues Owed</span>
        </div>
      </div>

      {/* Quick Action Touch Buttons */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Vendor Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => openModal('purchase')}
            className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 flex items-center justify-start gap-3 font-bold text-xs transition-all active:scale-95 min-h-[48px]"
          >
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span>+ Purchase</span>
          </button>

          <button
            onClick={() => openModal('supplier-payment')}
            className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 flex items-center justify-start gap-3 font-bold text-xs transition-all active:scale-95 min-h-[48px]"
          >
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span>Pay Vendor</span>
          </button>

          <button
            onClick={() => navigate('/suppliers')}
            className="p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 flex items-center justify-start gap-3 font-bold text-xs transition-all active:scale-95 min-h-[48px]"
          >
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <span>Vendors List</span>
          </button>

          <button
            onClick={() => navigate('/outstanding')}
            className="p-3.5 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-950 flex items-center justify-start gap-3 font-bold text-xs transition-all active:scale-95 min-h-[48px]"
          >
            <div className="p-2 rounded-xl bg-orange-600 text-white shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span>Outstanding</span>
          </button>
        </div>
      </div>

      {/* Vendors With Outstanding Balances */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-gray-900">Vendors With Outstanding Dues</h3>
          <button onClick={() => navigate('/outstanding')} className="text-xs font-bold text-emerald-600 hover:underline min-h-[44px] flex items-center">View All</button>
        </div>
        
        <div className="space-y-2">
          {data?.topOutstandingSuppliers?.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center font-semibold">No vendors with pending outstanding balances!</p>
          ) : (
            data?.topOutstandingSuppliers?.map(s => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-gray-50 hover:bg-emerald-50/50 border border-gray-200 flex items-center justify-between transition-colors"
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => navigate(`/suppliers?id=${s.id}`)}
                >
                  {s.photoUrl ? (
                    <img src={s.photoUrl} alt={s.name} className="w-10 h-10 rounded-2xl object-cover border border-emerald-200 shadow-xs" />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-xs border border-amber-200 shadow-xs">
                      {s.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{s.name}</h4>
                    <p className="text-[11px] text-gray-500">{s.village || 'Namakkal'} • {s.supplierCode}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="font-black text-rose-700 text-sm block">{formatCurrency(s.outstandingBalance)}</span>
                    <span className="text-[10px] text-gray-400 font-medium">Pending Due</span>
                  </div>
                  <button
                    onClick={() => openModal('supplier-payment', { supplierId: s.id })}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs min-h-[36px] flex items-center gap-1"
                  >
                    <span>Pay</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
