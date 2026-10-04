import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Download, Share2, Edit3, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const PurchaseBillModal = ({ isOpen, onClose, purchase, onSaveEdit }) => {
  const { settings, formatCurrency } = useApp();
  const printRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [billNo, setBillNo] = useState('');
  const [billDate, setBillDate] = useState('');
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [partyVillage, setPartyVillage] = useState('');
  const [particulars, setParticulars] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [netWeightKg, setNetWeightKg] = useState('');
  const [lsWeightKg, setLsWeightKg] = useState('');
  const [totalWeightKg, setTotalWeightKg] = useState('');
  const [ratePerKg, setRatePerKg] = useState('');
  const [grossAmount, setGrossAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [previousOutstanding, setPreviousOutstanding] = useState(0);
  const [totalPayableDue, setTotalPayableDue] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [remainingOutstanding, setRemainingOutstanding] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);

  // Recipient / Owner Payment fields
  const [referenceNo, setReferenceNo] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [upiPhone, setUpiPhone] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  useEffect(() => {
    if (purchase) {
      setBillNo(purchase.billNumber || purchase.id || '1568');
      setBillDate(purchase.date || new Date().toISOString().split('T')[0]);
      setPartyName(purchase.partyName || purchase.supplier?.name || '');
      setPartyPhone(purchase.supplier?.phone || '');
      setPartyVillage(purchase.supplier?.village || '');
      setParticulars(purchase.particulars || 'Banana Lot');
      setLotNumber(purchase.lotNumber || 'Lot 1');
      setQuantity(purchase.quantity || 1);
      
      const net = purchase.netWeightKg !== undefined ? purchase.netWeightKg : (purchase.totalWeightKg || (purchase.thars ? purchase.thars * 15 : 0));
      const ls = purchase.lsWeightKg !== undefined ? purchase.lsWeightKg : 0;
      const tot = purchase.totalWeightKg !== undefined ? purchase.totalWeightKg : (Number(net) - Number(ls));
      const rate = purchase.ratePerKg || purchase.unitPrice || 0;
      const gross = purchase.grossAmount || (Number(tot) * Number(rate));
      const disc = purchase.discountAmount || 0;
      const netAmt = purchase.totalAmount || (gross - disc);
      const prevDue = purchase.previousOutstanding || 0;
      const totPay = purchase.totalPayableDue || (prevDue + netAmt);
      const paid = purchase.paidAmount || 0;
      const remBal = purchase.remainingOutstanding !== undefined ? purchase.remainingOutstanding : (totPay - paid);

      setNetWeightKg(net);
      setLsWeightKg(ls);
      setTotalWeightKg(tot);
      setRatePerKg(rate);
      setGrossAmount(gross);
      setDiscountAmount(disc);
      setTotalAmount(netAmt);
      setPreviousOutstanding(prevDue);
      setTotalPayableDue(totPay);
      setPaidAmount(paid);
      setRemainingOutstanding(remBal);
      setPaymentMethod(purchase.paymentMethod || 'CASH');
      setNotes(purchase.notes || '');

      setReferenceNo(purchase.referenceNo || '');
      setUpiId(purchase.upiId || purchase.supplier?.upiId || '');
      setAccountName(purchase.accountName || purchase.supplier?.accountName || purchase.partyName || purchase.supplier?.name || '');
      setUpiPhone(purchase.upiPhone || purchase.supplier?.upiPhone || purchase.supplier?.phone || '');
      setAccountNumber(purchase.accountNumber || purchase.supplier?.accountNumber || '');
      setBankName(purchase.bankName || purchase.supplier?.bankName || '');
      setBranchName(purchase.branchName || purchase.supplier?.branchName || '');
      setIfscCode(purchase.ifscCode || purchase.supplier?.ifscCode || '');

      if (purchase.itemsJson) {
        try {
          const parsed = JSON.parse(purchase.itemsJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
          } else {
            setItems([{ id: 1, lot: 'Lot 1', particulars: 'Banana', qty: 1, kg: tot, rate: rate, amount: gross }]);
          }
        } catch(e) {
          setItems([{ id: 1, lot: 'Lot 1', particulars: 'Banana', qty: 1, kg: tot, rate: rate, amount: gross }]);
        }
      } else {
        setItems([{ id: 1, lot: 'Lot 1', particulars: 'Banana', qty: 1, kg: tot, rate: rate, amount: gross }]);
      }
    }
  }, [purchase]);

  if (!isOpen || !purchase) return null;

  const handleRecalculateRow = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    const kgVal = Number(updated[index].kg || 0);
    const rateVal = Number(updated[index].rate || 0);
    updated[index].amount = kgVal * rateVal;
    setItems(updated);

    // Sum overall totals
    const grandKg = updated.reduce((sum, item) => sum + Number(item.kg || 0), 0);
    const grandGross = updated.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const netAmt = Math.max(0, grandGross - Number(discountAmount || 0));
    const totPay = Number(previousOutstanding || 0) + netAmt;
    const remBal = totPay - Number(paidAmount || 0);

    setTotalWeightKg(grandKg);
    setGrossAmount(grandGross);
    setTotalAmount(netAmt);
    setTotalPayableDue(totPay);
    setRemainingOutstanding(remBal);
  };

  const handleAddItemRow = () => {
    setItems(prev => [
      ...prev,
      { id: prev.length + 1, lot: `Lot ${prev.length + 1}`, particulars: 'Banana', qty: 1, kg: 0, rate: ratePerKg || 0, amount: 0 }
    ]);
  };

  const numberToWords = (num) => {
    const n = Math.round(Number(num || 0));
    if (n === 0) return 'Zero Rupees Only';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(n) {
      if ((n = n.toString()).length > 9) return 'overflow';
      let n_array = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n_array) return '';
      let str = '';
      str += (n_array[1] != 0) ? (a[Number(n_array[1])] || b[n_array[1][0]] + ' ' + a[n_array[1][1]]) + 'Crore ' : '';
      str += (n_array[2] != 0) ? (a[Number(n_array[2])] || b[n_array[2][0]] + ' ' + a[n_array[2][1]]) + 'Lakh ' : '';
      str += (n_array[3] != 0) ? (a[Number(n_array[3])] || b[n_array[3][0]] + ' ' + a[n_array[3][1]]) + 'Thousand ' : '';
      str += (n_array[4] != 0) ? (a[Number(n_array[4])] || b[n_array[4][0]] + ' ' + a[n_array[4][1]]) + 'Hundred ' : '';
      str += (n_array[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_array[5])] || b[n_array[5][0]] + ' ' + a[n_array[5][1]]) : '';
      return str;
    }
    return inWords(n) + 'Rupees Only';
  };

  const formatDateString = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateStr;
    } catch(e) {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`VPSA_Bill_${billNo}_${partyName.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error('PDF generation failed', e);
      alert('Failed to generate PDF');
    }
  };

  const handleShareWhatsApp = () => {
    const text = `*VPSA YOGA BANANA MERCHANTS*%0A` +
      `CASH BILL No: *${billNo}*%0A` +
      `Date: ${formatDateString(billDate)}%0A` +
      `Party: *${partyName}*%0A` +
      `Total Weight: ${totalWeightKg} KG%0A` +
      `Rate: ₹${ratePerKg}/KG%0A` +
      `Gross Amount: ₹${grossAmount}%0A` +
      `Discount: ₹${discountAmount}%0A` +
      `*Net Amount: ₹${totalAmount}*%0A` +
      `Previous Due: ₹${previousOutstanding}%0A` +
      `Total Payable: ₹${totalPayableDue}%0A` +
      `Payment Made: ₹${paidAmount}%0A` +
      `Remaining Balance: ₹${remainingOutstanding}`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-emerald-900 text-white px-5 py-3.5 flex items-center justify-between shadow-md print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍌</span>
            <div>
              <h3 className="font-extrabold text-base leading-tight">VPSA YOGA BANANA MERCHANTS</h3>
              <p className="text-[11px] text-emerald-200">Official Cash Bill & Invoice</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all min-h-[36px] ${
                isEditing ? 'bg-amber-400 text-amber-950 shadow-xs' : 'bg-emerald-800 text-emerald-100 hover:bg-emerald-700'
              }`}
            >
              {isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              <span>{isEditing ? 'Done Editing' : 'Edit Bill'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all min-h-[36px]"
              title="Print Bill"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all min-h-[36px]"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all min-h-[36px]"
              title="Share on WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-emerald-800 text-emerald-200 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bill Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-gray-50 print:bg-white print:p-0 print:overflow-visible">
          
          <div 
            ref={printRef}
            className="printable-bill bg-white p-6 sm:p-8 rounded-2xl border-4 border-rose-900 shadow-md max-w-2xl mx-auto font-sans relative text-gray-900 print:shadow-none print:border-4 print:border-rose-900 print:w-full print:max-w-none"
          >
            {/* Header Section */}
            <div className="text-center border-b-2 border-rose-900 pb-3 mb-4">
              <span className="text-[10px] font-bold text-rose-900 tracking-widest uppercase block mb-1">
                || SRI MUNIAYPAN SWAMI PRASANNA ||
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-rose-950 uppercase tracking-tight">
                {settings.businessName || 'VPSA YOGA BANANA MERCHANTS'}
              </h1>
              <p className="text-xs font-bold text-gray-700 mt-1">
                {settings.businessAddress || 'Commission Agent & Wholesale Banana Merchants, Namakkal'}
              </p>
              <p className="text-xs font-semibold text-gray-600">
                Cell: {settings.phone1 || '9876543210'}, {settings.phone2 || '9443322110'}
              </p>
              
              <div className="inline-block mt-3 px-6 py-1 bg-rose-900 text-white font-black text-sm uppercase tracking-wider rounded-sm">
                CASH BILL
              </div>
            </div>

            {/* Bill Info & Party Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-300 pb-3 mb-4 text-xs font-bold">
              <div className="space-y-1 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-rose-900 uppercase">No.:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={billNo}
                      onChange={(e) => setBillNo(e.target.value)}
                      className="px-2 py-0.5 border border-rose-400 rounded text-xs font-bold"
                    />
                  ) : (
                    <span className="text-gray-900 text-sm font-extrabold">{billNo}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-rose-900 uppercase">To Party / Vendor:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={partyName}
                      onChange={(e) => setPartyName(e.target.value)}
                      className="px-2 py-0.5 border border-rose-400 rounded text-xs font-bold"
                    />
                  ) : (
                    <span className="text-gray-900 text-sm font-extrabold">{partyName}</span>
                  )}
                  {partyVillage && <span className="text-gray-500 font-medium">({partyVillage})</span>}
                </div>
              </div>

              <div className="space-y-1 w-full sm:w-auto text-left sm:text-right">
                <div className="flex items-center sm:justify-end gap-2">
                  <span className="text-rose-900 uppercase">Date:</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={billDate}
                      onChange={(e) => setBillDate(e.target.value)}
                      className="px-2 py-0.5 border border-rose-400 rounded text-xs font-bold"
                    />
                  ) : (
                    <span className="text-gray-900 text-sm font-extrabold">{formatDateString(billDate)}</span>
                  )}
                </div>
                {partyPhone && <p className="text-gray-600 font-medium">📞 {partyPhone}</p>}
              </div>
            </div>

            {/* Main Particulars & Weight Table */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left border-collapse border-2 border-rose-900 text-xs">
                <thead>
                  <tr className="bg-rose-900 text-white font-bold uppercase text-[11px]">
                    <th className="p-2 border border-rose-900 text-center w-10">S.No</th>
                    <th className="p-2 border border-rose-900">Particulars / Lot</th>
                    <th className="p-2 border border-rose-900 text-center w-14">Qty</th>
                    <th className="p-2 border border-rose-900 text-right w-24">Weight (KG)</th>
                    <th className="p-2 border border-rose-900 text-right w-24">Rate (₹/KG)</th>
                    <th className="p-2 border border-rose-900 text-right w-28">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 font-medium">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-rose-50/50">
                      <td className="p-2 border border-gray-300 text-center font-bold">{idx + 1}</td>
                      <td className="p-2 border border-gray-300">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.particulars}
                            onChange={(e) => handleRecalculateRow(idx, 'particulars', e.target.value)}
                            className="w-full px-1.5 py-0.5 border rounded text-xs"
                          />
                        ) : (
                          <span>{item.particulars || 'Banana Load'} ({item.lot || 'Lot 1'})</span>
                        )}
                      </td>
                      <td className="p-2 border border-gray-300 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleRecalculateRow(idx, 'qty', e.target.value)}
                            className="w-12 px-1 py-0.5 border rounded text-xs text-center"
                          />
                        ) : (
                          <span>{item.qty || 1}</span>
                        )}
                      </td>
                      <td className="p-2 border border-gray-300 text-right font-bold">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.kg}
                            onChange={(e) => handleRecalculateRow(idx, 'kg', e.target.value)}
                            className="w-20 px-1 py-0.5 border rounded text-xs text-right font-bold"
                          />
                        ) : (
                          <span>{item.kg} KG</span>
                        )}
                      </td>
                      <td className="p-2 border border-gray-300 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleRecalculateRow(idx, 'rate', e.target.value)}
                            className="w-16 px-1 py-0.5 border rounded text-xs text-right"
                          />
                        ) : (
                          <span>₹{item.rate}</span>
                        )}
                      </td>
                      <td className="p-2 border border-gray-300 text-right font-extrabold text-rose-950">
                        ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}

                  {/* Net Weight + L.S. Weight Summary rows */}
                  {(netWeightKg || lsWeightKg) && (
                    <tr className="bg-gray-50 text-[11px] font-semibold text-gray-600">
                      <td colSpan="3" className="p-2 border border-gray-300 text-right">
                        Net Wt: <span className="font-bold text-gray-900">{netWeightKg || 0} KG</span> | L.S. Wt: <span className="font-bold text-gray-900">{lsWeightKg || 0} KG</span>
                      </td>
                      <td colSpan="3" className="p-2 border border-gray-300 text-right">
                        Total Wt: <span className="font-bold text-rose-950">{totalWeightKg} KG</span>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 text-gray-900 font-bold text-xs border-t border-gray-300">
                    <td colSpan="3" className="p-2 border border-gray-300 text-right uppercase">Gross Amount:</td>
                    <td className="p-2 border border-gray-300 text-right font-bold">{totalWeightKg} KG</td>
                    <td className="p-2 border border-gray-300 text-right">₹{ratePerKg}/KG</td>
                    <td className="p-2 border border-gray-300 text-right font-bold text-gray-900">
                      ₹{Number(grossAmount || totalAmount).toLocaleString('en-IN')}
                    </td>
                  </tr>

                  {Number(discountAmount) > 0 && (
                    <tr className="bg-amber-50 text-amber-900 font-bold text-xs border-t border-gray-300">
                      <td colSpan="5" className="p-2 border border-gray-300 text-right uppercase">Discount Deduction:</td>
                      <td className="p-2 border border-gray-300 text-right font-bold text-amber-900">
                        -₹{Number(discountAmount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}

                  <tr className="bg-rose-100/80 text-rose-950 font-black text-sm border-t-2 border-rose-900">
                    <td colSpan="5" className="p-2.5 border border-rose-900 text-right uppercase">NET PURCHASE AMOUNT:</td>
                    <td className="p-2.5 border border-rose-900 text-right text-base font-black text-rose-950">
                      ₹{Number(totalAmount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Financial Ledger Calculation Breakdown */}
            <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-300 text-xs font-bold space-y-1 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Previous Outstanding Balance:</span>
                <span>₹{Number(previousOutstanding).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-800">
                <span>+ Net Purchase Amount:</span>
                <span>+₹{Number(totalAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-900 font-black border-t border-gray-300 pt-1">
                <span>Total Payable Due:</span>
                <span className="text-rose-900">₹{Number(totalPayableDue || (Number(previousOutstanding) + Number(totalAmount))).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-extrabold">
                <span>- Payment Made Now ({paymentMethod}):</span>
                <span>-₹{Number(paidAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-rose-950 font-black text-sm border-t border-gray-300 pt-1">
                <span>Remaining Outstanding Balance:</span>
                <span>₹{Number(remainingOutstanding !== undefined ? remainingOutstanding : (Number(totalPayableDue || (Number(previousOutstanding) + Number(totalAmount))) - Number(paidAmount))).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Owner / Vendor Recipient UPI & Bank details display inside Bill */}
            {paymentMethod === 'UPI' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs mb-4">
                <span className="font-extrabold text-blue-900 block mb-1">Payment Method: UPI Transfer to Owner Recipient</span>
                <div className="text-gray-700 space-y-0.5">
                  <p>
                    Owner UPI ID: <b className="text-blue-800">{upiId || settings.upiId || 'vpsayoga@upi'}</b>
                    {accountName && <> | Recipient Name: <b>{accountName}</b></>}
                    {upiPhone && <> | Phone: <b>{upiPhone}</b></>}
                  </p>
                  {referenceNo && (
                    <p className="text-gray-600">
                      UPI Ref / Txn ID: <b className="text-blue-950 font-mono">{referenceNo}</b>
                    </p>
                  )}
                </div>
              </div>
            )}

            {paymentMethod === 'BANK_TRANSFER' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs mb-4">
                <span className="font-extrabold text-emerald-900 block mb-1">Payment Method: Bank Transfer to Owner Recipient</span>
                <div className="text-gray-700 space-y-0.5">
                  <p>
                    Recipient Holder: <b>{accountName || partyName}</b> | Bank: <b>{bankName || settings.bankName || 'SBI'}</b>
                    {branchName && <> ({branchName})</>}
                  </p>
                  <p>
                    Account No: <b className="text-emerald-900 font-mono">{accountNumber || settings.bankAccountNumber || '39876543210'}</b>
                    {(ifscCode || settings.bankIfsc) && <> | IFSC: <b className="font-mono">{ifscCode || settings.bankIfsc}</b></>}
                  </p>
                  {referenceNo && (
                    <p className="text-gray-600">
                      UTR / Bank Txn Ref: <b className="text-emerald-950 font-mono">{referenceNo}</b>
                    </p>
                  )}
                </div>
              </div>
            )}

            {isEditing && (
              <button
                onClick={handleAddItemRow}
                className="mb-4 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
              >
                + Add Row / Particular
              </button>
            )}

            {/* Rupees in Words & Signature Area */}
            <div className="space-y-4 pt-2 border-t border-gray-200">
              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200">
                <span className="text-xs font-bold text-rose-900 uppercase block">Amount in Words:</span>
                <p className="text-sm font-extrabold text-rose-950 italic mt-0.5">
                  {numberToWords(totalAmount)}
                </p>
              </div>

              <div className="flex items-end justify-between pt-6 text-xs font-bold">
                <div className="space-y-1">
                  <p className="text-gray-500 font-medium">Terms & Conditions:</p>
                  <p className="text-[10px] text-gray-400">1. Goods once sold/received cannot be taken back.</p>
                  <p className="text-[10px] text-gray-400">2. Subject to Namakkal jurisdiction.</p>
                </div>

                <div className="text-center space-y-8 pr-2">
                  <p className="text-rose-900 uppercase font-extrabold">For VPSA YOGA BANANA MERCHANTS</p>
                  <div className="border-t border-gray-400 pt-1 text-[11px] font-bold text-gray-700">
                    Authorized Signature / Proprietor
                  </div>
                </div>
              </div>
          </div>

        </div>

        </div>

        {/* Footer Quick Action Buttons (Hidden on Print) */}
        <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600">
              Status: <span className="text-emerald-700 uppercase">SAVED & VERIFIED</span>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none min-h-[44px] px-5 py-2.5 bg-rose-900 hover:bg-rose-950 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Cash Bill</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
