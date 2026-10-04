import React, { useState, useEffect } from 'react';
import { vendorApi } from '../services/api';
import { Phone, MessageSquare, ArrowUpRight, Search, ShieldAlert, Filter, ChevronRight, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Outstanding = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('highest');
  const { openModal } = useApp();

  useEffect(() => {
    fetchOutstandingVendors();
  }, []);

  const fetchOutstandingVendors = async () => {
    setLoading(true);
    try {
      const res = await vendorApi.getAll();
      if (res.data?.success) {
        const list = (res.data.data || []).filter(v => Number(v.outstandingBalance) > 0);
        setVendors(list);
      }
    } catch (err) {
      console.error('Failed to load outstanding vendors', err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'VE';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const sortedVendors = [...vendors]
    .filter(v => 
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      (v.village && v.village.toLowerCase().includes(search.toLowerCase())) ||
      (v.phone && v.phone.includes(search))
    )
    .sort((a, b) => {
      if (sortBy === 'highest') return Number(b.outstandingBalance) - Number(a.outstandingBalance);
      if (sortBy === 'lowest') return Number(a.outstandingBalance) - Number(b.outstandingBalance);
      if (sortBy === 'oldest') {
        const dateA = a.oldestPendingDate ? new Date(a.oldestPendingDate) : new Date();
        const dateB = b.oldestPendingDate ? new Date(b.oldestPendingDate) : new Date();
        return dateA - dateB;
      }
      return 0;
    });

  const totalOutstanding = vendors.reduce((sum, v) => sum + Number(v.outstandingBalance || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-banana-500 rounded-3xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full">
            Vendor Payables Audit
          </span>
          <ShieldAlert className="w-6 h-6 text-amber-100" />
        </div>
        <p className="text-xs text-amber-100 font-medium">Total Pending Supplier Debt</p>
        <h2 className="text-3xl font-black mt-1">₹{totalOutstanding.toLocaleString('en-IN')}</h2>
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-100">
          <span className="font-bold bg-amber-700/40 px-2 py-0.5 rounded-md">{vendors.length} Vendors</span>
          <span>with outstanding dues to settle</span>
        </div>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vendor name, village, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
          >
            <option value="highest">Highest Due First</option>
            <option value="lowest">Lowest Due First</option>
            <option value="oldest">Oldest Pending Date</option>
          </select>
        </div>
      </div>

      {/* Vendor Cards List */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 font-medium">Loading outstanding vendors...</div>
      ) : sortedVendors.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <h3 className="font-bold text-gray-900 text-base">No Outstanding Balances!</h3>
          <p className="text-xs text-gray-500">All vendor purchases are fully settled.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedVendors.map((vendor) => {
            const due = Number(vendor.outstandingBalance || 0);
            const isHighDue = due > 10000;
            const waPhone = vendor.whatsappNumber || vendor.phone;
            const waMessage = encodeURIComponent(`Hello ${vendor.name}, your current outstanding balance is ₹${due.toLocaleString('en-IN')}.`);

            return (
              <div
                key={vendor.id}
                className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs hover:border-amber-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {vendor.photoUrl ? (
                      <img
                        src={vendor.photoUrl}
                        alt={vendor.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-gray-200 shadow-xs"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 font-black flex items-center justify-center text-base shadow-xs">
                        {getInitials(vendor.name)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900 text-base leading-tight">{vendor.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{vendor.supplierCode || 'VEN'} • {vendor.village || 'Namakkal'}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-black ${
                      isHighDue ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      ₹{due.toLocaleString('en-IN')} Due
                    </span>
                    {vendor.oldestPendingDate && (
                      <p className="text-[11px] text-gray-500 font-medium mt-1">
                        Oldest: {vendor.oldestPendingDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {vendor.phone && (
                      <a
                        href={`tel:${vendor.phone}`}
                        className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call
                      </a>
                    )}
                    {waPhone && (
                      <a
                        href={`https://wa.me/91${waPhone.replace(/\D/g, '')}?text=${waMessage}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-200 flex items-center gap-1.5 hover:bg-green-100 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => openModal('addSupplierPayment', { supplierId: vendor.id, supplierName: vendor.name, outstandingBalance: vendor.outstandingBalance })}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <span>Pay</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
