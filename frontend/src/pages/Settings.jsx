import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Building, Lock, Save, QrCode, Building2 } from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';

export const Settings = () => {
  const { settings, setSettings } = useApp();

  const [businessName, setBusinessName] = useState(settings.businessName || 'VPSA YOGA BANANA MERCHANTS');
  const [businessAddress, setBusinessAddress] = useState(settings.businessAddress || 'Wholesale Banana Market, Namakkal, Tamil Nadu');
  const [phone1, setPhone1] = useState(settings.phone1 || '9876543210');
  const [phone2, setPhone2] = useState(settings.phone2 || '9443322110');
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || '₹');

  // UPI Settings
  const [upiName, setUpiName] = useState(settings.upiName || 'VPSA YOGA BANANA MERCHANTS');
  const [upiId, setUpiId] = useState(settings.upiId || 'vpsayoga@upi');
  const [upiPhone, setUpiPhone] = useState(settings.upiPhone || '9876543210');

  // Bank Settings
  const [bankAccountHolder, setBankAccountHolder] = useState(settings.bankAccountHolder || 'VPSA YOGA BANANA MERCHANTS');
  const [bankName, setBankName] = useState(settings.bankName || 'State Bank of India');
  const [bankBranch, setBankBranch] = useState(settings.bankBranch || 'Namakkal Main Branch');
  const [bankAccountNumber, setBankAccountNumber] = useState(settings.bankAccountNumber || '39876543210');
  const [bankIfsc, setBankIfsc] = useState(settings.bankIfsc || 'SBIN0001234');
  const [bankAccountType, setBankAccountType] = useState(settings.bankAccountType || 'Current Account');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (settings) {
      if (settings.businessName) setBusinessName(settings.businessName);
      if (settings.businessAddress) setBusinessAddress(settings.businessAddress);
      if (settings.phone1) setPhone1(settings.phone1);
      if (settings.phone2) setPhone2(settings.phone2);
      if (settings.currencySymbol) setCurrencySymbol(settings.currencySymbol);

      if (settings.upiName) setUpiName(settings.upiName);
      if (settings.upiId) setUpiId(settings.upiId);
      if (settings.upiPhone) setUpiPhone(settings.upiPhone);

      if (settings.bankAccountHolder) setBankAccountHolder(settings.bankAccountHolder);
      if (settings.bankName) setBankName(settings.bankName);
      if (settings.bankBranch) setBankBranch(settings.bankBranch);
      if (settings.bankAccountNumber) setBankAccountNumber(settings.bankAccountNumber);
      if (settings.bankIfsc) setBankIfsc(settings.bankIfsc);
      if (settings.bankAccountType) setBankAccountType(settings.bankAccountType);
    }
  }, [settings]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const newMap = {
        businessName,
        businessAddress,
        phone1,
        phone2,
        currencySymbol,
        upiName,
        upiId,
        upiPhone,
        bankAccountHolder,
        bankName,
        bankBranch,
        bankAccountNumber,
        bankIfsc,
        bankAccountType
      };
      await api.post('/settings', { settings: newMap });
      setSettings(prev => ({ ...prev, ...newMap }));
      alert('VPSA YOGA BANANA MERCHANTS settings saved successfully!');
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setPasswordMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordMsg(err.message || 'Failed to change password');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-emerald-700" />
          VPSA YOGA Business Settings
        </h2>
        <p className="text-xs text-gray-500">Configure business identity, print bill headers, UPI & bank payment details</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Business Identity */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600" /> Business Header Details (Print Bill)
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Business Name (Title)</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 font-black text-base text-emerald-950"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Business Address & Location</label>
            <input
              type="text"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 font-semibold text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Primary Phone / Cell</label>
              <input
                type="text"
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-bold text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Secondary Phone</label>
              <input
                type="text"
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-bold text-sm"
              />
            </div>
          </div>
        </div>

        {/* UPI Payment Config */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" /> UPI Payment Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">UPI Payee Name</label>
              <input
                type="text"
                value={upiName}
                onChange={(e) => setUpiName(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">UPI VPA / ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-bold text-sm text-blue-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">UPI Phone Number</label>
              <input
                type="text"
                value={upiPhone}
                onChange={(e) => setUpiPhone(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-bold text-sm"
              />
            </div>
          </div>
        </div>

        {/* Bank Account Config */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" /> Bank Account Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Account Holder Name</label>
              <input
                type="text"
                value={bankAccountHolder}
                onChange={(e) => setBankAccountHolder(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Branch</label>
              <input
                type="text"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Account Number</label>
              <input
                type="text"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-bold text-sm text-emerald-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">IFSC Code</label>
              <input
                type="text"
                value={bankIfsc}
                onChange={(e) => setBankIfsc(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-bold text-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Account Type</label>
              <input
                type="text"
                value={bankAccountType}
                onChange={(e) => setBankAccountType(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={savingSettings}
          className="w-full py-4 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Save className="w-5 h-5" />
          <span>{savingSettings ? 'Saving Business Settings...' : 'Save VPSA YOGA Business Configuration'}</span>
        </button>
      </form>

      {/* Admin Password Change Form */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-700" /> Admin Security Profile
        </h3>

        {passwordMsg && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
            {passwordMsg}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md"
          >
            Update Admin Password
          </button>
        </form>
      </div>
    </div>
  );
};
