import React, { useState, useEffect } from 'react';
import { X, Calculator, Plus, Trash2, Building2, QrCode, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';
import { PhotoUploader } from '../common/PhotoUploader';

export const AddPurchaseModal = ({ isOpen, onClose, defaultSupplierId = null, onPurchaseSaved }) => {
  const { settings, triggerRefresh, formatCurrency } = useApp();
  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState(defaultSupplierId || '');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  
  // KG-based & Bill fields
  const [billNumber, setBillNumber] = useState('');
  const [particulars, setParticulars] = useState('Banana Load');
  const [netWeightKg, setNetWeightKg] = useState('');
  const [lsWeightKg, setLsWeightKg] = useState('');
  const [totalWeightKg, setTotalWeightKg] = useState('');
  const [ratePerKg, setRatePerKg] = useState('');
  const [discountAmount, setDiscountAmount] = useState('0');
  
  // Recipient / Owner Payment fields
  const [referenceNo, setReferenceNo] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [upiPhone, setUpiPhone] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  // Multi-lot items
  const [items, setItems] = useState([
    { id: 1, lot: 'Lot 1', particulars: 'Banana', qty: 1, netKg: '', lsKg: '', kg: '', rate: '', amount: 0 }
  ]);

  const [paymentNow, setPaymentNow] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetFormState = () => {
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setBillNumber('');
    setParticulars('Banana Load');
    setNetWeightKg('');
    setLsWeightKg('');
    setTotalWeightKg('');
    setRatePerKg('');
    setDiscountAmount('0');
    setReferenceNo('');
    setUpiId('');
    setAccountName('');
    setUpiPhone('');
    setAccountNumber('');
    setBankName('');
    setBranchName('');
    setIfscCode('');
    setItems([{ id: 1, lot: 'Lot 1', particulars: 'Banana', qty: 1, netKg: '', lsKg: '', kg: '', rate: '', amount: 0 }]);
    setPaymentNow('');
    setPaymentMethod('CASH');
    setNotes('');
    setAttachmentUrl('');
    setError('');
  };

  useEffect(() => {
    if (isOpen) {
      resetFormState();
      api.get('/suppliers').then(res => {
        setSuppliers(res.data.data || []);
      }).catch(() => {});

      if (defaultSupplierId) {
        setSupplierId(defaultSupplierId.toString());
      }
    } else {
      resetFormState();
    }
  }, [isOpen, defaultSupplierId]);

  useEffect(() => {
    if (isOpen && supplierId) {
      api.get(`/suppliers/${supplierId}`)
        .then(res => {
          if (res.data?.data) {
            const s = res.data.data;
            setSelectedSupplier(s);
            if (s.name && !accountName) setAccountName(s.name);
            if (s.upiId) setUpiId(s.upiId);
            if (s.accountNumber) setAccountNumber(s.accountNumber);
            if (s.bankName) setBankName(s.bankName);
            if (s.ifscCode) setIfscCode(s.ifscCode);
          }
        })
        .catch(() => {
          setSelectedSupplier(null);
        });
    } else if (!supplierId) {
      setSelectedSupplier(null);
    }
  }, [isOpen, supplierId]);

  const preventNegativeInput = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  const handleNetOrLsChange = (net, ls) => {
    const cleanNet = net !== '' && Number(net) < 0 ? net.replace(/-/g, '') : net;
    const cleanLs = ls !== '' && Number(ls) < 0 ? ls.replace(/-/g, '') : ls;
    setNetWeightKg(cleanNet);
    setLsWeightKg(cleanLs);
    const n = Number(cleanNet || 0);
    const l = Number(cleanLs || 0);
    const tot = n - l;
    setTotalWeightKg(cleanNet !== '' || cleanLs !== '' ? tot.toString() : '');
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    const kg = Number(updated[index].kg || updated[index].netKg || 0);
    const rate = Number(updated[index].rate || ratePerKg || 0);
    updated[index].amount = kg * rate;
    setItems(updated);

    // Sum overall weight if multiple items
    const grandKg = updated.reduce((sum, item) => sum + Number(item.kg || item.netKg || 0), 0);
    if (grandKg > 0) {
      setTotalWeightKg(grandKg.toString());
    }
  };

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { id: prev.length + 1, lot: `Lot ${prev.length + 1}`, particulars: 'Banana', qty: 1, netKg: '', lsKg: '', kg: '', rate: ratePerKg || '', amount: 0 }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    const grandKg = updated.reduce((sum, item) => sum + Number(item.kg || item.netKg || 0), 0);
    setTotalWeightKg(grandKg > 0 ? grandKg.toString() : '');
  };

  if (!isOpen) return null;

  const netNum = Number(netWeightKg) || 0;
  const lsNum = Number(lsWeightKg) || 0;
  const weightNum = (netWeightKg !== '' || lsWeightKg !== '') ? (netNum - lsNum) : (Number(totalWeightKg) || 0);
  const rateNum = Number(ratePerKg) || 0;
  const grossPurchaseAmount = items.length > 1 && items.some(i => i.amount > 0)
    ? items.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    : (weightNum * rateNum);

  const discountNum = Number(discountAmount) || 0;
  const netPurchaseAmount = Math.max(0, grossPurchaseAmount - discountNum);

  const paidNum = paymentNow !== '' ? Number(paymentNow) : 0;
  const prevDue = selectedSupplier ? Number(selectedSupplier.outstandingBalance || 0) : 0;
  const totalDue = prevDue + netPurchaseAmount;
  const currentBalance = totalDue - paidNum;

  const isNegativeNetWeight = netWeightKg !== '' && Number(netWeightKg) < 0;
  const isNegativeLsWeight = lsWeightKg !== '' && Number(lsWeightKg) < 0;
  const isNegativeTotalWeight = totalWeightKg !== '' && Number(totalWeightKg) < 0;
  const isNegativeRate = ratePerKg !== '' && Number(ratePerKg) < 0;
  const isZeroRate = ratePerKg !== '' && Number(ratePerKg) === 0;
  const isNegativeDiscount = discountAmount !== '' && Number(discountAmount) < 0;
  const isDiscountExceeded = discountNum > grossPurchaseAmount;
  const isNegativePayment = paymentNow !== '' && Number(paymentNow) < 0;
  const isPaymentExceeded = paidNum > totalDue;

  let validationError = '';
  if (isNegativeNetWeight) {
    validationError = 'Net Weight cannot be negative.';
  } else if (isNegativeLsWeight) {
    validationError = 'L.S. Weight cannot be negative.';
  } else if (isNegativeTotalWeight) {
    validationError = 'Total Weight cannot be negative.';
  } else if (isNegativeRate) {
    validationError = 'Rate per KG cannot be negative.';
  } else if (isNegativeDiscount) {
    validationError = 'Discount cannot be negative.';
  } else if (isDiscountExceeded) {
    validationError = 'Discount cannot exceed gross purchase amount.';
  } else if (isNegativePayment) {
    validationError = 'Payment amount cannot be negative.';
  } else if (isPaymentExceeded) {
    validationError = `Payment cannot exceed total due of ${formatCurrency(totalDue)}`;
  }

  const isSaveDisabled = loading || !!validationError || weightNum <= 0 || (rateNum <= 0 && grossPurchaseAmount <= 0) || !supplierId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!supplierId) {
      setError('Please select a vendor.');
      return;
    }

    if (weightNum <= 0) {
      setError('Please enter a valid total weight in KG (> 0).');
      return;
    }

    if ((ratePerKg === '' || rateNum <= 0) && grossPurchaseAmount <= 0) {
      if (rateNum < 0) {
        setError('Rate per KG cannot be negative.');
      } else {
        setError('Please enter a valid Rate per KG (> 0).');
      }
      return;
    }

    if (isNegativeDiscount) {
      setError('Discount cannot be negative.');
      return;
    }

    if (isDiscountExceeded) {
      setError('Discount cannot exceed gross purchase amount.');
      return;
    }

    if (isNegativePayment) {
      setError('Payment amount cannot be negative.');
      return;
    }

    if (isPaymentExceeded) {
      setError(`Payment cannot exceed total due of ${formatCurrency(totalDue)}`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        supplierId: Number(supplierId),
        purchaseDate,
        billNumber: billNumber ? billNumber.trim() : null,
        particulars,
        totalWeightKg: weightNum,
        netWeightKg: Number(netWeightKg) || weightNum,
        lsWeightKg: Number(lsWeightKg) || 0,
        ratePerKg: rateNum,
        grossAmount: grossPurchaseAmount,
        discountAmount: discountNum,
        itemsJson: JSON.stringify(items),
        paymentNow: paidNum,
        paymentMethod,
        referenceNo,
        upiId,
        accountName,
        upiPhone,
        accountNumber,
        bankName,
        branchName,
        ifscCode,
        notes,
        attachmentUrl
      };

      const res = await api.post('/purchases', payload);
      triggerRefresh();
      
      const savedData = res.data?.data;
      onClose();

      if (onPurchaseSaved && savedData) {
        onPurchaseSaved({
          ...savedData,
          partyName: selectedSupplier?.name,
          supplier: selectedSupplier,
          billNumber: savedData.billNumber || billNumber || '1279',
          netWeightKg: Number(netWeightKg) || weightNum,
          lsWeightKg: Number(lsWeightKg) || 0,
          totalWeightKg: weightNum,
          ratePerKg: rateNum,
          grossAmount: grossPurchaseAmount,
          discountAmount: discountNum,
          totalAmount: netPurchaseAmount,
          previousOutstanding: prevDue,
          totalPayableDue: totalDue,
          paidAmount: paidNum,
          remainingOutstanding: currentBalance,
          paymentMethod,
          referenceNo,
          upiId,
          accountName,
          upiPhone,
          accountNumber,
          bankName,
          branchName,
          ifscCode,
          notes,
          itemsJson: JSON.stringify(items)
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to save purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 px-6 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 font-black flex items-center justify-center text-lg shadow-xs">
              🍌
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">New Banana Purchase</h3>
              <p className="text-xs text-emerald-200">VPSA YOGA BANANA MERCHANTS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Supplier Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-900 block text-xs uppercase tracking-wider">Select Owner / Vendor *</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-hidden min-h-[48px]"
              required
            >
              <option value="">-- Choose Owner / Vendor --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  M/s. {s.name} {s.village ? `- ${s.village}` : ''} [Outstanding: ₹{s.outstandingBalance}]
                </option>
              ))}
            </select>
          </div>

          {/* Bill Number & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-gray-900 block text-xs uppercase tracking-wider">Bill Number / No. (Manual)</label>
              <input
                type="text"
                placeholder="e.g. 1279"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-900 block text-xs uppercase tracking-wider">Purchase Date *</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                required
              />
            </div>
          </div>

          {/* KG Weight & Lots Calculation Card */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-600" />
                Weight (KG) & Rate (/KG) Calculation
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[10px] font-bold bg-emerald-200 hover:bg-emerald-300 text-emerald-900 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Lot</span>
              </button>
            </div>

            {/* Single Lot Weight Controls */}
            {items.length <= 1 ? (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block">Net Weight (KG)</label>
                  <input
                    type="number"
                    min="0"
                    onKeyDown={preventNegativeInput}
                    placeholder="e.g. 100"
                    value={netWeightKg}
                    onChange={(e) => handleNetOrLsChange(e.target.value, lsWeightKg)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-extrabold text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block">L.S. Weight (KG)</label>
                  <input
                    type="number"
                    min="0"
                    onKeyDown={preventNegativeInput}
                    placeholder="e.g. 10"
                    value={lsWeightKg}
                    onChange={(e) => handleNetOrLsChange(netWeightKg, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-extrabold text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block">Total Weight (KG) *</label>
                  <input
                    type="number"
                    min="0"
                    onKeyDown={preventNegativeInput}
                    placeholder="Total KG"
                    value={totalWeightKg}
                    onChange={(e) => setTotalWeightKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-400 bg-white font-black text-emerald-900 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    required
                  />
                </div>
              </div>
            ) : (
              /* Multi-Lot Table */
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-emerald-300 text-xs">
                    <input
                      type="text"
                      placeholder="Lot"
                      value={item.lot}
                      onChange={(e) => handleItemChange(idx, 'lot', e.target.value)}
                      className="w-16 px-1.5 py-1 border border-gray-200 rounded-md font-bold"
                    />
                    <input
                      type="number"
                      min="0"
                      onKeyDown={preventNegativeInput}
                      placeholder="Net KG"
                      value={item.netKg || ''}
                      onChange={(e) => {
                        const net = e.target.value;
                        const ls = item.lsKg || '';
                        const tot = (Number(net || 0) - Number(ls || 0));
                        const updated = [...items];
                        updated[idx].netKg = net;
                        updated[idx].kg = tot > 0 ? tot : net;
                        updated[idx].amount = (Number(updated[idx].kg || 0)) * (Number(updated[idx].rate || ratePerKg || 0));
                        setItems(updated);
                      }}
                      className="w-16 px-1.5 py-1 border border-gray-200 rounded-md font-bold text-right"
                    />
                    <input
                      type="number"
                      min="0"
                      onKeyDown={preventNegativeInput}
                      placeholder="L.S. KG"
                      value={item.lsKg || ''}
                      onChange={(e) => {
                        const ls = e.target.value;
                        const net = item.netKg || '';
                        const tot = (Number(net || 0) - Number(ls || 0));
                        const updated = [...items];
                        updated[idx].lsKg = ls;
                        updated[idx].kg = tot;
                        updated[idx].amount = (Number(updated[idx].kg || 0)) * (Number(updated[idx].rate || ratePerKg || 0));
                        setItems(updated);
                      }}
                      className="w-16 px-1.5 py-1 border border-gray-200 rounded-md font-bold text-right"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      onKeyDown={preventNegativeInput}
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                      className="w-14 px-1.5 py-1 border border-gray-200 rounded-md font-bold text-right"
                    />
                    <span className="w-20 text-right font-black text-emerald-900">
                      ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block">Rate per KG (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  onKeyDown={preventNegativeInput}
                  placeholder="e.g. 30"
                  value={ratePerKg}
                  onChange={(e) => setRatePerKg(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border font-black text-sm focus:ring-2 outline-hidden ${
                    isNegativeRate || isZeroRate
                      ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-rose-500'
                      : 'border-gray-200 text-gray-900 focus:ring-emerald-500'
                  }`}
                  required={items.length <= 1}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block">Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  onKeyDown={preventNegativeInput}
                  placeholder="₹0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border font-bold text-sm focus:ring-2 outline-hidden ${
                    isNegativeDiscount || isDiscountExceeded
                      ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-rose-500'
                      : 'border-gray-200 text-gray-900 focus:ring-emerald-500'
                  }`}
                />
              </div>

              <div className="bg-white p-2 rounded-xl border border-emerald-300 flex flex-col justify-center">
                <span className="text-[9px] font-bold text-gray-500 uppercase">Purchase Amount</span>
                <p className="text-base font-black text-emerald-800">
                  {formatCurrency(netPurchaseAmount)}
                </p>
                {discountNum > 0 && (
                  <span className="text-[9px] text-gray-400 font-semibold">Gross: {formatCurrency(grossPurchaseAmount)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Live Financial Calculation Summary */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
            <div className="flex justify-between text-xs text-gray-600 font-bold">
              <span>Gross Purchase ({totalWeightKg || 0} KG × ₹{ratePerKg || 0}):</span>
              <span className="text-gray-900">{formatCurrency(grossPurchaseAmount)}</span>
            </div>
            {discountNum > 0 && (
              <div className="flex justify-between text-xs text-amber-700 font-bold">
                <span>Discount Deduction:</span>
                <span>-{formatCurrency(discountNum)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-600 font-bold">
              <span>Previous Outstanding Balance:</span>
              <span className="text-gray-900">{formatCurrency(prevDue)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1.5 border-t border-gray-200">
              <span>Total Payable Due:</span>
              <span className="text-rose-700">{formatCurrency(totalDue)}</span>
            </div>
          </div>

          {/* Payment Section (Money Paid TO Owner) */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-gray-900 block text-xs uppercase tracking-wider">Payment Made Now to Owner (₹)</label>
                <input
                  type="number"
                  min="0"
                  onKeyDown={preventNegativeInput}
                  placeholder="₹0"
                  value={paymentNow}
                  onChange={(e) => setPaymentNow(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-2xl border font-black text-base outline-hidden ${
                    isPaymentExceeded || isNegativePayment 
                      ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-2 focus:ring-rose-500' 
                      : 'border-gray-200 font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-900 block text-xs uppercase tracking-wider">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-gray-200 font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                >
                  <option value="CASH">💵 Cash</option>
                  <option value="UPI">📱 UPI Payment to Owner</option>
                  <option value="BANK_TRANSFER">🏦 Bank Transfer to Owner</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Validation Warning Banner */}
            {validationError && (
              <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Dynamic Recipient Payment Fields */}
            {paymentMethod === 'UPI' && (
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center gap-2 font-extrabold text-blue-950">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>Owner / Vendor's UPI Recipient Details</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Owner's UPI ID *</label>
                    <input
                      type="text"
                      placeholder="e.g. kumar@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Owner Account Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Kumar"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-900 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">UPI Ref / Txn ID</label>
                    <input
                      type="text"
                      placeholder="e.g. TEST123456"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">UPI Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={upiPhone}
                      onChange={(e) => setUpiPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'BANK_TRANSFER' && (
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center gap-2 font-extrabold text-emerald-950">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Owner / Vendor's Bank Recipient Details</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Account Holder Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Kumar"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Account Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. 39876543210"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-900 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. SBI"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-gray-200 font-bold text-gray-900 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Branch</label>
                    <input
                      type="text"
                      placeholder="e.g. Namakkal"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-gray-200 font-bold text-gray-900 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SBIN0001234"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-gray-200 font-bold text-gray-900 bg-white text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">UTR / Bank Transaction Ref No.</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR12345678"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-900 bg-white"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between text-xs font-bold text-gray-700 bg-emerald-100/50 p-2.5 rounded-xl border border-emerald-200">
              <span>Remaining Owner Outstanding Balance:</span>
              <span className="text-rose-800 text-sm font-black">{formatCurrency(currentBalance)}</span>
            </div>
          </div>

          {/* Notes & Attachment */}
          <div className="space-y-3">
            <div>
              <label className="font-bold text-gray-900 block text-xs uppercase tracking-wider mb-1">Notes / Remarks</label>
              <input
                type="text"
                placeholder="e.g. Load quality checked"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <PhotoUploader
              label="Bill / Load Photo (Optional)"
              photoUrl={attachmentUrl}
              onPhotoChange={(url) => setAttachmentUrl(url)}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-200 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaveDisabled}
              className="flex-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-700/30 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              {loading ? (
                <span>Saving Purchase...</span>
              ) : (
                <span>Save Purchase & Generate Bill</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
