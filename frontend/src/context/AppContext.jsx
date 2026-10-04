import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    businessName: 'VPSA YOGA BANANA MERCHANTS',
    currencySymbol: '₹',
    businessAddress: 'Wholesale Banana Market, Namakkal, Tamil Nadu',
    phone1: '9876543210',
    phone2: '9443322110',
    upiName: 'VPSA YOGA BANANA MERCHANTS',
    upiId: 'vpsayoga@upi',
    upiPhone: '9876543210',
    bankAccountHolder: 'VPSA YOGA BANANA MERCHANTS',
    bankName: 'State Bank of India',
    bankBranch: 'Namakkal Main Branch',
    bankAccountNumber: '39876543210',
    bankIfsc: 'SBIN0001234',
    bankAccountType: 'Current Account'
  });
  
  const [activeModal, setActiveModal] = useState(null); // 'purchase' | 'supplier-payment' | 'sale' | 'customer-payment' | 'expense' | 'search' | 'stock-adjust'
  const [modalParams, setModalParams] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.data) {
        setSettings(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (e) {
      // Use defaults
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const openModal = (modalName, params = {}) => {
    setModalParams(params);
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalParams({});
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const formatCurrency = (amount) => {
    const val = Number(amount || 0);
    return `${settings.currencySymbol || '₹'}${val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <AppContext.Provider value={{
      settings,
      setSettings,
      activeModal,
      modalParams,
      openModal,
      closeModal,
      refreshTrigger,
      triggerRefresh,
      formatCurrency
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
