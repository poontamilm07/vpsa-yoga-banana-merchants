import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  UserCheck, Plus, Search, Phone, MessageSquare, ShoppingCart, ArrowDownLeft, 
  FileSpreadsheet, FileText, Share2, MapPin, Edit, ChevronLeft 
} from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { PhotoUploader } from '../components/common/PhotoUploader';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const Customers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedIdFromUrl = searchParams.get('id');
  const { openModal, refreshTrigger, formatCurrency } = useApp();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(selectedIdFromUrl ? Number(selectedIdFromUrl) : null);
  const [customerSummary, setCustomerSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Modal
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formVillage, setFormVillage] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?search=${encodeURIComponent(search)}`);
      const list = res.data.data || [];
      setCustomers(list);
      if (!selectedCustomerId && list.length > 0 && window.innerWidth >= 768) {
        setSelectedCustomerId(list[0].id);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [search, selectedCustomerId]);

  const fetchCustomerDetails = useCallback(async (id) => {
    if (!id) return;
    try {
      const [sumRes, ledRes] = await Promise.all([
        api.get(`/customers/${id}`),
        api.get(`/customers/${id}/ledger`)
      ]);
      setCustomerSummary(sumRes.data.data);
      setLedger(ledRes.data.data || []);
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers, refreshTrigger]);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomerDetails(selectedCustomerId);
    }
  }, [selectedCustomerId, fetchCustomerDetails]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormVillage('');
    setFormArea('');
    setFormNotes('');
    setFormPhotoUrl('');
    setIsAddEditOpen(true);
  };

  const handleOpenEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormName(customer.name || '');
    setFormPhone(customer.phone || '');
    setFormVillage(customer.village || '');
    setFormArea(customer.area || '');
    setFormNotes(customer.notes || '');
    setFormPhotoUrl(customer.photoUrl || '');
    setIsAddEditOpen(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formName,
        phone: formPhone,
        village: formVillage,
        area: formArea,
        notes: formNotes,
        photoUrl: formPhotoUrl
      };
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, payload);
      } else {
        const res = await api.post('/customers', payload);
        setSelectedCustomerId(res.data.data.id);
      }
      setIsAddEditOpen(false);
      fetchCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleShareWhatsApp = () => {
    if (!customerSummary) return;
    const text = `*BANANA BUSINESS CUSTOMER STATEMENT*%0A` +
      `Customer: *${customerSummary.name}* (${customerSummary.customerCode})%0A` +
      `Total Thars Purchased: ${customerSummary.totalTharsSold}%0A` +
      `Total Sales Amount: ₹${customerSummary.totalSalesAmount}%0A` +
      `Total Paid: ₹${customerSummary.totalReceivedAmount}%0A` +
      `*Outstanding Balance Due: ₹${customerSummary.outstandingBalance}*%0A` +
      `Date: ${new Date().toLocaleDateString('en-IN')}`;
    
    window.open(`https://wa.me/${customerSummary.phone ? customerSummary.phone.replace(/[^0-9]/g, '') : ''}?text=${text}`, '_blank');
  };

  const exportPDF = () => {
    if (!customerSummary || ledger.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Customer Ledger: ${customerSummary.name} (${customerSummary.customerCode})`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Phone: ${customerSummary.phone || 'N/A'} | Village: ${customerSummary.village || 'N/A'}`, 14, 28);
    doc.text(`Outstanding Balance: Rs. ${customerSummary.outstandingBalance}`, 14, 34);

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
      head: [['Date', 'Tx ID', 'Description', 'Sale (Debit)', 'Receipt (Credit)', 'Balance']],
      body: tableData,
    });

    doc.save(`Customer_Ledger_${customerSummary.name}.pdf`);
  };

  const exportExcel = () => {
    if (!customerSummary || ledger.length === 0) return;
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
    XLSX.utils.book_append_sheet(wb, ws, "Customer Ledger");
    XLSX.writeFile(wb, `Customer_Ledger_${customerSummary.name}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-blue-600" />
            Customer Management & Ledger
          </h2>
          <p className="text-xs text-gray-500">Track buyers, sales, credit balances & receipts</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center gap-2 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Customer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`lg:col-span-4 space-y-3 ${selectedCustomerId && 'hidden md:block'}`}>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search customer, phone, village..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {customers.length === 0 ? (
              <p className="text-xs text-center text-gray-400 py-8">No customers found</p>
            ) : (
              customers.map(c => {
                const isSelected = selectedCustomerId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => { setSelectedCustomerId(c.id); setSearchParams({ id: c.id }); }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 shadow-sm'
                        : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {c.photoUrl ? (
                          <img src={c.photoUrl} alt={c.name} className="w-11 h-11 rounded-full object-cover border border-blue-200" />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-base">
                            {c.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{c.name}</h4>
                          <span className="text-[11px] text-gray-500 block">{c.customerCode} • {c.village || 'No Village'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-indigo-900 text-sm block">{formatCurrency(c.outstandingBalance)}</span>
                        <span className="text-[10px] text-gray-400">Due</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={`lg:col-span-8 space-y-6 ${!selectedCustomerId && 'hidden md:block'}`}>
          {selectedCustomerId && (
            <button
              onClick={() => setSelectedCustomerId(null)}
              className="md:hidden flex items-center gap-1 text-xs font-bold text-blue-700 mb-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Customers List
            </button>
          )}

          {!customerSummary ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-100">
              Select a customer to view complete transaction ledger and profile
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    {customerSummary.photoUrl ? (
                      <img src={customerSummary.photoUrl} alt={customerSummary.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-2xl shadow-md shadow-blue-600/20">
                        {customerSummary.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-900">{customerSummary.name}</h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {customerSummary.customerCode}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        {customerSummary.phone && <span>📞 {customerSummary.phone}</span>}
                        {customerSummary.village && <span>📍 {customerSummary.village}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {customerSummary.phone && (
                      <>
                        <a
                          href={`tel:${customerSummary.phone}`}
                          className="p-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Call</span>
                        </a>
                        <button
                          onClick={handleShareWhatsApp}
                          className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(customerSummary)}
                      className="p-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold"
                      title="Edit Customer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Total Thars</span>
                    <p className="text-lg font-black text-gray-900">{customerSummary.totalTharsSold} Thars</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Total Sales</span>
                    <p className="text-lg font-black text-blue-700">{formatCurrency(customerSummary.totalSalesAmount)}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Total Received</span>
                    <p className="text-lg font-black text-emerald-700">{formatCurrency(customerSummary.totalReceivedAmount)}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">Receivable Due</span>
                    <p className="text-lg font-black text-indigo-900">{formatCurrency(customerSummary.outstandingBalance)}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => openModal('sale', { customerId: customerSummary.id })}
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>New Sale</span>
                  </button>
                  <button
                    onClick={() => openModal('customer-payment', { customerId: customerSummary.id })}
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs"
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Receive Payment</span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <h4 className="font-bold text-base text-gray-900">Chronological Customer Statement</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportPDF}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-rose-600" />
                      PDF
                    </button>
                    <button
                      onClick={exportExcel}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      Excel
                    </button>
                    <button
                      onClick={handleShareWhatsApp}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl flex items-center gap-1.5"
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
                        <th className="p-3 text-right">Sale</th>
                        <th className="p-3 text-right">Receipt</th>
                        <th className="p-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {ledger.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-6 text-gray-400">No customer transactions found</td>
                        </tr>
                      ) : (
                        ledger.map((entry, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/80">
                            <td className="p-3 whitespace-nowrap">{entry.date}</td>
                            <td className="p-3 whitespace-nowrap font-mono font-bold text-gray-900">{entry.transactionId}</td>
                            <td className="p-3 max-w-xs truncate">{entry.description}</td>
                            <td className="p-3 text-right font-bold text-blue-700">
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

      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">
              {editingCustomer ? 'Edit Customer Details' : 'Add New Customer'}
            </h3>
            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ravi"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="9123456789"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Village</label>
                  <input
                    type="text"
                    placeholder="Salem"
                    value={formVillage}
                    onChange={(e) => setFormVillage(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Retail vendor details..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 text-sm"
                />
              </div>
              <PhotoUploader
                value={formPhotoUrl}
                onChange={setFormPhotoUrl}
                label="Customer Photo (Optional)"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
