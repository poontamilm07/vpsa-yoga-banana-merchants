import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { MobileLayout } from './components/layout/MobileLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Suppliers } from './pages/Suppliers';
import { Transactions } from './pages/Transactions';
import { Outstanding } from './pages/Outstanding';
import { Expenses } from './pages/Expenses';
import { DailyClosing } from './pages/DailyClosing';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

import { AddPurchaseModal } from './components/modals/AddPurchaseModal';
import { AddSupplierPaymentModal } from './components/modals/AddSupplierPaymentModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { SearchModal } from './components/modals/SearchModal';
import { PurchaseBillModal } from './components/modals/PurchaseBillModal';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const GlobalModals = () => {
  const { activeModal, openModal, closeModal, modalParams } = useApp();

  return (
    <>
      <AddPurchaseModal
        isOpen={activeModal === 'purchase'}
        onClose={closeModal}
        defaultSupplierId={modalParams?.supplierId}
        onPurchaseSaved={(savedPurchase) => {
          openModal('purchaseBill', { purchase: savedPurchase });
        }}
      />
      <PurchaseBillModal
        isOpen={activeModal === 'purchaseBill'}
        onClose={closeModal}
        purchase={modalParams?.purchase}
      />
      <AddSupplierPaymentModal
        isOpen={activeModal === 'supplier-payment' || activeModal === 'addSupplierPayment'}
        onClose={closeModal}
        defaultSupplierId={modalParams?.supplierId}
      />
      <AddExpenseModal
        isOpen={activeModal === 'expense'}
        onClose={closeModal}
      />
      <SearchModal
        isOpen={activeModal === 'search'}
        onClose={closeModal}
      />
    </>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MobileLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="vendors" element={<Suppliers />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="outstanding" element={<Outstanding />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="daily-closing" element={<DailyClosing />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <GlobalModals />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
