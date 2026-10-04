import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, Package, Calendar, Users, 
  Receipt, ArrowUpRight, ShieldAlert, Sparkles 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  Legend, AreaChart, Area, CartesianGrid 
} from 'recharts';
import api, { vendorApi } from '../services/api';
import { useApp } from '../context/AppContext';

export const Reports = () => {
  const { formatCurrency } = useApp();
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  
  const [report, setReport] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const [repRes, vendRes] = await Promise.all([
        api.get(`/reports/monthly?year=${year}&month=${month}`),
        vendorApi.getAll()
      ]);
      setReport(repRes.data.data);
      setVendors(vendRes.data.data || []);
    } catch (e) {
      console.error('Error fetching reports data', e);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const monthsList = [
    { v: 1, name: 'January' }, { v: 2, name: 'February' }, { v: 3, name: 'March' },
    { v: 4, name: 'April' }, { v: 5, name: 'May' }, { v: 6, name: 'June' },
    { v: 7, name: 'July' }, { v: 8, name: 'August' }, { v: 9, name: 'September' },
    { v: 10, name: 'October' }, { v: 11, name: 'November' }, { v: 12, name: 'December' },
  ];

  const reportTabs = [
    { key: 'OVERVIEW', label: 'Overview' },
    { key: 'PURCHASES', label: 'Vendor Purchases' },
    { key: 'PAYMENTS', label: 'Vendor Payments' },
    { key: 'OUTSTANDING', label: 'Outstanding' },
    { key: 'RATE_HISTORY', label: 'Rate History' },
  ];

  const totalOutstanding = vendors.reduce((sum, v) => sum + Number(v.outstandingBalance || 0), 0);
  const totalThars = vendors.reduce((sum, v) => sum + Number(v.totalTharsPurchased || 0), 0);

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-emerald-600" />
            Vendor Business Reports
          </h2>
          <p className="text-xs text-gray-500">Monthly vendor purchases, payment ledger & rate analytics</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="p-2 bg-transparent text-xs font-bold text-gray-900 outline-hidden min-h-[40px]"
          >
            {monthsList.map(m => (
              <option key={m.v} value={m.v}>{m.name}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="p-2 bg-transparent text-xs font-bold text-gray-900 outline-hidden min-h-[40px]"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-Tabs (Horizontal Scroll Container) */}
      <div className="w-full max-w-full overflow-x-auto pb-1 scrollbar-none flex items-center gap-2">
        {reportTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all min-h-[44px] flex items-center justify-center shrink-0 ${
              activeTab === tab.key
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Purchases Value</span>
              <p className="text-xl font-black text-emerald-700 mt-1">{formatCurrency(report?.totalPurchases)}</p>
              <span className="text-xs text-gray-500">{report?.totalTharsPurchased || 0} Thars</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Payments Made</span>
              <p className="text-xl font-black text-amber-700 mt-1">{formatCurrency(report?.totalExpenses || report?.totalPurchases)}</p>
              <span className="text-xs text-gray-500">To suppliers</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-amber-200 bg-amber-50/50 shadow-xs">
              <span className="text-[11px] font-bold text-amber-800 uppercase">Total Outstanding</span>
              <p className="text-xl font-black text-rose-700 mt-1">{formatCurrency(totalOutstanding)}</p>
              <span className="text-xs text-amber-700 font-medium">{vendors.filter(v => Number(v.outstandingBalance) > 0).length} Vendors Due</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Avg Thar Rate</span>
              <p className="text-xl font-black text-gray-900 mt-1">{formatCurrency(report?.avgPurchasePrice || 500)}</p>
              <span className="text-xs text-gray-500">Per Thar Rate</span>
            </div>
          </div>

          {/* Responsive Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900">Daily Purchases Trend (₹)</h3>
              <div className="h-56 w-full max-w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report?.dailySalesData || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} width={45} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="purchases" name="Purchases (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900">Monthly Purchase Volume (Thars)</h3>
              <div className="h-56 w-full max-w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report?.dailyProfitData || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} width={45} />
                    <Tooltip formatter={(value) => `${value} Thars`} />
                    <Area type="monotone" dataKey="profit" name="Thars" stroke="#059669" fill="#ecfdf5" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PURCHASES' && (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3">
          <h3 className="text-base font-extrabold text-gray-900">Vendor Purchase Report Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-100">
                  <th className="p-3">Code</th>
                  <th className="p-3">Vendor Name</th>
                  <th className="p-3">Village</th>
                  <th className="p-3 text-right">Total Thars</th>
                  <th className="p-3 text-right">Total Purchases</th>
                  <th className="p-3 text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {vendors.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-bold text-gray-900">{v.supplierCode}</td>
                    <td className="p-3 font-bold text-gray-900">{v.name}</td>
                    <td className="p-3">{v.village || '-'}</td>
                    <td className="p-3 text-right font-bold text-emerald-800">{v.totalTharsPurchased} Thars</td>
                    <td className="p-3 text-right font-bold text-emerald-700">{formatCurrency(v.totalPurchaseAmount)}</td>
                    <td className="p-3 text-right font-black text-rose-700">{formatCurrency(v.outstandingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PAYMENTS' && (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3">
          <h3 className="text-base font-extrabold text-gray-900">Vendor Payment Ledger Report</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-100">
                  <th className="p-3">Code</th>
                  <th className="p-3">Vendor Name</th>
                  <th className="p-3 text-right">Total Purchases</th>
                  <th className="p-3 text-right">Total Paid</th>
                  <th className="p-3 text-right">Remaining Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {vendors.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-bold text-gray-900">{v.supplierCode}</td>
                    <td className="p-3 font-bold text-gray-900">{v.name}</td>
                    <td className="p-3 text-right font-bold text-gray-900">{formatCurrency(v.totalPurchaseAmount)}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">{formatCurrency(v.totalPaidAmount)}</td>
                    <td className="p-3 text-right font-black text-rose-700">{formatCurrency(v.outstandingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'OUTSTANDING' && (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3">
          <h3 className="text-base font-extrabold text-gray-900">Outstanding Vendor Payables Audit</h3>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex justify-between items-center text-xs">
            <span className="font-bold text-amber-950">Total Pending Supplier Dues:</span>
            <span className="text-lg font-black text-amber-950">{formatCurrency(totalOutstanding)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-100">
                  <th className="p-3">Vendor</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Oldest Pending</th>
                  <th className="p-3 text-right">Outstanding Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {vendors.filter(v => Number(v.outstandingBalance) > 0).map(v => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-900">{v.name} ({v.supplierCode})</td>
                    <td className="p-3">{v.phone || '-'}</td>
                    <td className="p-3 font-medium text-amber-900">{v.oldestPendingDate || 'Recent'}</td>
                    <td className="p-3 text-right font-black text-rose-700">{formatCurrency(v.outstandingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'RATE_HISTORY' && (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-gray-900">Vendor Thar Rate Analytics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-100">
                  <th className="p-3">Vendor</th>
                  <th className="p-3 text-right">Last Rate</th>
                  <th className="p-3 text-right">Average Rate</th>
                  <th className="p-3 text-right">Highest Rate</th>
                  <th className="p-3 text-right">Lowest Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {vendors.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-900">{v.name} ({v.supplierCode})</td>
                    <td className="p-3 text-right font-bold text-emerald-700">{v.lastRate ? formatCurrency(v.lastRate) : '-'}</td>
                    <td className="p-3 text-right font-bold text-gray-900">{v.avgRate ? formatCurrency(v.avgRate) : '-'}</td>
                    <td className="p-3 text-right font-bold text-rose-700">{v.highestRate ? formatCurrency(v.highestRate) : '-'}</td>
                    <td className="p-3 text-right font-bold text-blue-700">{v.lowestRate ? formatCurrency(v.lowestRate) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
