import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, Plus, Search, Phone, MessageSquare, ShoppingBag, ArrowUpRight, 
  FileSpreadsheet, FileText, Share2, MapPin, Calendar, Edit, ChevronLeft,
  Star, CheckCircle2, XCircle, Filter
} from 'lucide-react';
import api, { vendorApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { PhotoUploader } from '../components/common/PhotoUploader';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const Suppliers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedIdFromUrl = searchParams.get('id');
  const { openModal, refreshTrigger, formatCurrency, triggerRefresh } = useApp();

  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'favorites' | 'active' | 'inactive'
  const [selectedSupplierId, setSelectedSupplierId] = useState(selectedIdFromUrl ? Number(selectedIdFromUrl) : null);
  const [supplierSummary, setSupplierSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Modal State
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formVillage, setFormVillage] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formActive, setFormActive] = useState(true);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vendorApi.getAll(search);
      const list = res.data.data || [];
      setSuppliers(list);
      if (selectedSupplierId && !list.some(s => s.id === selectedSupplierId)) {
        // Keep selection if valid
      } else if (!selectedSupplierId && list.length > 0 && window.innerWidth >= 768) {
        setSelectedSupplierId(list[0].id);
      }
    } catch (e) {
      console.error('Failed to fetch suppliers', e);
    } finally {
      setLoading(false);
    }
  }, [search, selectedSupplierId]);

  const fetchSupplierDetails = useCallback(async (id) => {
    if (!id) return;
    try {
      const [sumRes, ledRes] = await Promise.all([
        vendorApi.getById(id),
        vendorApi.getLedger(id)
      ]);
      setSupplierSummary(sumRes.data.data);
      setLedger(ledRes.data.data || []);
    } catch (e) {
      console.error('Failed to fetch supplier details', e);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers, refreshTrigger]);

  useEffect(() => {
    if (selectedSupplierId) {
      fetchSupplierDetails(selectedSupplierId);
    }
  }, [selectedSupplierId, fetchSupplierDetails, refreshTrigger]);

  const handleToggleFavorite = async (e, id) => {
    e?.stopPropagation();
    try {
      const res = await vendorApi.toggleFavorite(id);
      const isFav = res.data?.data;
      setSuppliers(prev => prev.map(s => s.id === id ? { ...s, favorite: isFav } : s));
      if (supplierSummary && supplierSummary.id === id) {
        setSupplierSummary(prev => ({ ...prev, favorite: isFav }));
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setFormName('');
    setFormPhone('');
    setFormWhatsapp('');
    setFormVillage('');
    setFormArea('');
    setFormAddress('');
    setFormNotes('');
    setFormPhotoUrl('');
    setFormActive(true);
    setIsAddEditOpen(true);
  };

  const handleOpenEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setFormName(supplier.name || '');
    setFormPhone(supplier.phone || '');
    setFormWhatsapp(supplier.whatsappNumber || supplier.phone || '');
    setFormVillage(supplier.village || '');
    setFormArea(supplier.area || '');
    setFormAddress(supplier.address || '');
    setFormNotes(supplier.notes || '');
    setFormPhotoUrl(supplier.photoUrl || '');
    setFormActive(supplier.active !== false);
    setIsAddEditOpen(true);
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formName,
        phone: formPhone,
        whatsappNumber: formWhatsapp,
        village: formVillage,
        area: formArea,
        address: formAddress,
        notes: formNotes,
        photoUrl: formPhotoUrl,
        active: formActive
      };
      if (editingSupplier) {
        await vendorApi.update(editingSupplier.id, payload);
      } else {
        const res = await vendorApi.create(payload);
        setSelectedSupplierId(res.data.data.id);
      }
      setIsAddEditOpen(false);
      triggerRefresh();
      fetchSuppliers();
    } catch (err) {
      alert(err.message || 'Failed to save vendor');
    }
  };

  const handleShareWhatsApp = () => {
    if (!supplierSummary) return;
    const totalKg = supplierSummary.totalKgPurchased || (supplierSummary.totalTharsPurchased ? supplierSummary.totalTharsPurchased * 15 : 0);
    const text = `*VPSA YOGA BANANA MERCHANTS - VENDOR STATEMENT*%0A` +
      `Vendor: *${supplierSummary.name}* (${supplierSummary.supplierCode})%0A` +
      `Total KG Purchased: ${totalKg} KG%0A` +
      `Total Purchases: ₹${supplierSummary.totalPurchaseAmount}%0A` +
      `Total Paid: ₹${supplierSummary.totalPaidAmount}%0A` +
      `*Outstanding Balance Due: ₹${supplierSummary.outstandingBalance}*%0A` +
      `Date: ${new Date().toLocaleDateString('en-IN')}`;
    
    const targetPhone = supplierSummary.whatsappNumber || supplierSummary.phone;
    window.open(`https://wa.me/${targetPhone ? targetPhone.replace(/[^0-9]/g, '') : ''}?text=${text}`, '_blank');
  };

  const exportPDF = () => {
    if (!supplierSummary || ledger.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Supplier Ledger: ${supplierSummary.name} (${supplierSummary.supplierCode})`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Phone: ${supplierSummary.phone || 'N/A'} | Village: ${supplierSummary.village || 'N/A'}`, 14, 28);
    doc.text(`Outstanding Balance: Rs. ${supplierSummary.outstandingBalance}`, 14, 34);

    const tableData = ledger.map(entry => [
      entry.date,
      entry.transactionId,
      entry.description,
      entry.debit > 0 ? `Rs. ${entry.debit}` : '-',
      entry.credit > 0 ? `Rs. ${entry.credit}` : '-',
      `Rs. ${entry.runningBalance}`
    ]);

    doc.autoTable({
      startY: 40,
      head: [['Date', 'Tx ID', 'Description', 'Purchase (Debit)', 'Payment (Credit)', 'Balance']],
      body: tableData,
    });

    doc.save(`Supplier_Ledger_${supplierSummary.name}.pdf`);
  };

  const exportExcel = () => {
    if (!supplierSummary || ledger.length === 0) return;
    const exportData = ledger.map(e => ({
      Date: e.date,
      TransactionID: e.transactionId,
      Description: e.description,
      Thars: e.thars || '-',
      UnitPrice: e.unitPrice || '-',
      Debit: e.debit,
      Credit: e.credit,
      RunningBalance: e.runningBalance
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Supplier Ledger");
    XLSX.writeFile(wb, `Supplier_Ledger_${supplierSummary.name}.xlsx`);
  };

  // Client-side search and tab filtering
  const filteredSuppliers = suppliers.filter(s => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      (s.supplierCode && s.supplierCode.toLowerCase().includes(q)) ||
      (s.village && s.village.toLowerCase().includes(q)) ||
      (s.area && s.area.toLowerCase().includes(q))
    );

    if (!matchesSearch) return false;

    if (filterTab === 'favorites') return s.favorite;
    if (filterTab === 'active') return s.active !== false;
    if (filterTab === 'inactive') return s.active === false;

    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No transactions';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-600" />
            Vendor Management & Ledger
          </h2>
          <p className="text-xs text-gray-500">Manage banana vendors, purchases, payments & balances</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto min-h-[44px] px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Vendor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Vendor Search, Filters & Cards List */}
        <div className={`lg:col-span-4 space-y-3 ${selectedSupplierId && 'hidden md:block'}`}>
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by vendor name, phone, ID, village..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          {/* Filter Tabs: All, Favorites, Active, Inactive */}
          <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-2xl text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-1.5 px-2.5 rounded-xl transition-all text-center whitespace-nowrap min-h-[36px] ${
                filterTab === 'all' 
                  ? 'bg-white text-emerald-800 shadow-xs' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({suppliers.length})
            </button>
            <button
              onClick={() => setFilterTab('favorites')}
              className={`flex-1 py-1.5 px-2.5 rounded-xl transition-all text-center flex items-center justify-center gap-1 whitespace-nowrap min-h-[36px] ${
                filterTab === 'favorites' 
                  ? 'bg-white text-amber-800 shadow-xs' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              Favs ({suppliers.filter(s => s.favorite).length})
            </button>
            <button
              onClick={() => setFilterTab('active')}
              className={`flex-1 py-1.5 px-2.5 rounded-xl transition-all text-center whitespace-nowrap min-h-[36px] ${
                filterTab === 'active' 
                  ? 'bg-white text-emerald-800 shadow-xs' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterTab('inactive')}
              className={`flex-1 py-1.5 px-2.5 rounded-xl transition-all text-center whitespace-nowrap min-h-[36px] ${
                filterTab === 'inactive' 
                  ? 'bg-white text-gray-800 shadow-xs' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Inactive
            </button>
          </div>

          {/* Vendor Cards List */}
          <div className="space-y-2 max-h-[68vh] overflow-y-auto pr-1">
            {filteredSuppliers.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-semibold">No vendors match your search</p>
              </div>
            ) : (
              filteredSuppliers.map(s => {
                const isSelected = selectedSupplierId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => { setSelectedSupplierId(s.id); setSearchParams({ id: s.id }); }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-500 shadow-sm'
                        : 'bg-white border-gray-100 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {s.photoUrl ? (
                            <img src={s.photoUrl} alt={s.name} className="w-12 h-12 rounded-2xl object-cover border border-emerald-200" />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-base shadow-xs">
                              {s.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          {s.favorite && (
                            <div className="absolute -top-1 -right-1 bg-amber-400 p-0.5 rounded-full border border-white">
                              <Star className="w-2.5 h-2.5 fill-white text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-gray-900">{s.name}</h4>
                            {s.active === false && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-gray-200 text-gray-600">
                                Inactive
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 block">
                            ID: {s.supplierCode}
                          </span>
                          <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {s.village || s.area || 'No Location'}
                            {s.phone && <span>• 📞 {s.phone}</span>}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col justify-between items-end">
                        <button
                          onClick={(e) => handleToggleFavorite(e, s.id)}
                          className="p-1 hover:bg-amber-50 rounded-lg transition-colors text-amber-500 mb-1"
                          title={s.favorite ? 'Remove from favorites' : 'Mark as favorite'}
                        >
                          <Star className={`w-4 h-4 ${s.favorite ? 'fill-amber-400 text-amber-500' : 'text-gray-300'}`} />
                        </button>

                        <div>
                          <span className="font-black text-rose-700 text-sm block">{formatCurrency(s.outstandingBalance)}</span>
                          <span className="text-[10px] text-gray-400 font-medium block">
                            Last: {formatDate(s.lastTransactionDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Vendor Profile Details & Ledger View */}
        <div className={`lg:col-span-8 space-y-6 ${!selectedSupplierId && 'hidden md:block'}`}>
          {selectedSupplierId && (
            <button
              onClick={() => setSelectedSupplierId(null)}
              className="md:hidden flex items-center gap-1 text-xs font-bold text-emerald-700 mb-2 min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Vendors List
            </button>
          )}

          {!supplierSummary ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-100 shadow-xs">
              <Users className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
              <p className="font-semibold text-sm">Select a vendor from the left list to view transactions & ledger</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Vendor Profile Card */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {supplierSummary.photoUrl ? (
                        <img src={supplierSummary.photoUrl} alt={supplierSummary.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-200 shadow-xs" />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-2xl shadow-md shadow-emerald-600/20">
                          {supplierSummary.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <button
                        onClick={(e) => handleToggleFavorite(e, supplierSummary.id)}
                        className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full shadow-md border border-gray-100 text-amber-500"
                        title={supplierSummary.favorite ? 'Unstar Vendor' : 'Star Vendor'}
                      >
                        <Star className={`w-4 h-4 ${supplierSummary.favorite ? 'fill-amber-400 text-amber-500' : 'text-gray-300'}`} />
                      </button>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black text-gray-900">{supplierSummary.name}</h3>
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {supplierSummary.supplierCode}
                        </span>
                        {supplierSummary.active !== false ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-gray-400" /> Inactive
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 flex flex-wrap items-center gap-3 mt-1.5 font-medium">
                        {supplierSummary.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-600" /> {supplierSummary.phone}</span>}
                        {supplierSummary.village && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> {supplierSummary.village}</span>}
                        {supplierSummary.area && <span>({supplierSummary.area})</span>}
                        <span className="flex items-center gap-1 text-gray-400">
                          <Calendar className="w-3.5 h-3.5" /> Last activity: {formatDate(supplierSummary.lastTransactionDate)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Contact & Edit Buttons */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {supplierSummary.phone && (
                      <>
                        <a
                          href={`tel:${supplierSummary.phone}`}
                          className="flex-1 sm:flex-none min-h-[44px] px-3.5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Call</span>
                        </a>
                        <button
                          onClick={handleShareWhatsApp}
                          className="flex-1 sm:flex-none min-h-[44px] px-3.5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(supplierSummary)}
                      className="min-h-[44px] px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      title="Edit Vendor"
                    >
                      <Edit className="w-4 h-4 text-emerald-700" />
                      <span>Edit Vendor</span>
                    </button>
                  </div>
                </div>

                {/* Aggregated Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Total KG Purchased</span>
                    <p className="text-lg font-black text-gray-900">
                      {(supplierSummary.totalKgPurchased || (supplierSummary.totalTharsPurchased ? supplierSummary.totalTharsPurchased * 15 : 0)).toLocaleString('en-IN')} KG
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Total Purchased</span>
                    <p className="text-lg font-black text-emerald-700">{formatCurrency(supplierSummary.totalPurchaseAmount)}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Total Paid</span>
                    <p className="text-lg font-black text-blue-700">{formatCurrency(supplierSummary.totalPaidAmount)}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                    <span className="text-[10px] font-bold text-rose-600 uppercase">Outstanding Due</span>
                    <p className="text-lg font-black text-rose-700">{formatCurrency(supplierSummary.outstandingBalance)}</p>
                  </div>
                </div>

                {/* Action Buttons: New Purchase / Pay Supplier */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => openModal('purchase', { supplierId: supplierSummary.id })}
                    className="flex-1 min-h-[48px] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>New Purchase</span>
                  </button>
                  <button
                    onClick={() => openModal('supplier-payment', { supplierId: supplierSummary.id })}
                    className="flex-1 min-h-[48px] py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
                  >
                    <ArrowUpRight className="w-5 h-5" />
                    <span>Pay Supplier</span>
                  </button>
                </div>
              </div>

              {/* Chronological Ledger Table Section */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <h4 className="font-bold text-base text-gray-900">Chronological Ledger Statement</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportPDF}
                      className="px-3 py-1.5 min-h-[36px] bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-rose-600" />
                      PDF
                    </button>
                    <button
                      onClick={exportExcel}
                      className="px-3 py-1.5 min-h-[36px] bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      Excel
                    </button>
                    <button
                      onClick={handleShareWhatsApp}
                      className="px-3 py-1.5 min-h-[36px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-100">
                        <th className="p-3">Date</th>
                        <th className="p-3">Tx ID</th>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Purchase</th>
                        <th className="p-3 text-right">Payment</th>
                        <th className="p-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {ledger.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-6 text-gray-400 font-semibold">No ledger transactions found</td>
                        </tr>
                      ) : (
                        ledger.map((entry, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/80">
                            <td className="p-3 whitespace-nowrap">{entry.date}</td>
                            <td className="p-3 whitespace-nowrap font-mono font-bold text-gray-900">{entry.transactionId}</td>
                            <td className="p-3 max-w-xs truncate">{entry.description}</td>
                            <td className="p-3 text-right font-bold text-rose-700">
                              {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                            </td>
                            <td className="p-3 text-right font-bold text-emerald-700">
                              {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                            </td>
                            <td className="p-3 text-right font-black text-gray-900">
                              {formatCurrency(entry.runningBalance)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Vendor Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              {editingSupplier ? `Edit Vendor: ${editingSupplier.name}` : 'Add New Banana Vendor'}
            </h3>
            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Vendor Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Kumar"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Village</label>
                  <input
                    type="text"
                    placeholder="Namakkal"
                    value={formVillage}
                    onChange={(e) => setFormVillage(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Area / Landmark</label>
                  <input
                    type="text"
                    placeholder="East Area"
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Address (Optional)</label>
                <input
                  type="text"
                  placeholder="Full street address..."
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Grower details, variety preference..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="vendorActiveCheck"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm border-gray-300 focus:ring-emerald-500"
                />
                <label htmlFor="vendorActiveCheck" className="text-xs font-bold text-gray-800 cursor-pointer">
                  Active Vendor (unchecked = Inactive)
                </label>
              </div>

              <PhotoUploader
                value={formPhotoUrl}
                onChange={setFormPhotoUrl}
                label="Vendor Photo (Camera / Gallery)"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md min-h-[44px]"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
