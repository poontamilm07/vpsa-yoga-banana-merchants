import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Users, BarChart3, Plus, Search, 
  Settings, LogOut, FileText, ChevronRight, Menu, X, ShieldAlert, MoreHorizontal, Receipt
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { QuickActionSheet } from '../common/QuickActionSheet';

export const MobileLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { settings, openModal } = useApp();
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const navItems = [
    { label: 'HOME', path: '/dashboard', icon: Home },
    { label: 'VENDORS', path: '/suppliers', icon: Users },
    { label: 'TRANSACTIONS', path: '/transactions', icon: FileText },
  ];

  const activePath = location.pathname;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pb-28 md:pb-0 overflow-x-hidden w-full max-w-full">
      {/* Desktop Sidebar (md+) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0 shrink-0">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 font-extrabold flex items-center justify-center text-xl shadow-xs">
            🍌
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-base leading-tight">
              {settings.businessName || 'Banana Ledger'}
            </h1>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Vendor Ledger Manager
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
              activePath === '/dashboard' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => navigate('/suppliers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
              activePath === '/suppliers' || activePath === '/vendors' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Vendors</span>
          </button>

          <button
            onClick={() => navigate('/transactions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
              activePath === '/transactions' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Transactions</span>
          </button>

          <button
            onClick={() => navigate('/outstanding')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
              activePath === '/outstanding' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Outstanding</span>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
              activePath === '/reports' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Reports</span>
          </button>

          <div className="pt-4 border-t border-gray-100 mt-4 space-y-1.5">
            <button
              onClick={() => navigate('/expenses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
                activePath === '/expenses' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Receipt className="w-5 h-5" />
              <span>Expenses</span>
            </button>
            <button
              onClick={() => navigate('/daily-closing')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
                activePath === '/daily-closing' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Daily Closing</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
                activePath === '/settings' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-900">{user?.fullName || 'Admin'}</p>
              <p className="text-[10px] text-gray-500">@{user?.username || 'admin'}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden">
        {/* Mobile Header (Mobile only) */}
        <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5" onClick={() => navigate('/dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 font-black flex items-center justify-center text-lg shadow-xs">
              🍌
            </div>
            <div>
              <h1 className="font-extrabold text-gray-900 text-sm leading-tight">
                {settings.businessName || 'Banana Ledger'}
              </h1>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-sm">Vendor Notebook</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => openModal('search')}
              className="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {isMoreMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Expanded Menu Overlay */}
        {isMoreMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[57px] z-40 bg-white p-5 space-y-3 animate-in fade-in overflow-y-auto pb-28">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-gray-900">{user?.fullName || 'Business Owner'}</p>
                <p className="text-xs text-gray-500">@{user?.username}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-1.5 min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => { setIsMoreMenuOpen(false); navigate('/outstanding'); }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-200 font-bold text-sm text-amber-950 min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <span>Outstanding Dues</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-500" />
              </button>

              <button
                onClick={() => { setIsMoreMenuOpen(false); navigate('/reports'); }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 font-semibold text-sm text-gray-800 min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <span>Vendor Reports</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => { setIsMoreMenuOpen(false); navigate('/expenses'); }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 font-semibold text-sm text-gray-800 min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-rose-600" />
                  <span>Business Expenses</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => { setIsMoreMenuOpen(false); navigate('/daily-closing'); }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 font-semibold text-sm text-gray-800 min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <span>Daily EOD Closing</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => { setIsMoreMenuOpen(false); navigate('/settings'); }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 font-semibold text-sm text-gray-800 min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span>Settings & Profile</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-2 flex items-center justify-around shadow-xl">
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all min-h-[44px] ${
            activePath === '/dashboard' ? 'text-emerald-700 font-bold' : 'text-gray-500 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 ${activePath === '/dashboard' ? 'text-emerald-600 scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 font-bold">HOME</span>
        </button>

        <button
          onClick={() => navigate('/suppliers')}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all min-h-[44px] ${
            activePath === '/suppliers' || activePath === '/vendors' ? 'text-emerald-700 font-bold' : 'text-gray-500 font-medium'
          }`}
        >
          <Users className={`w-5 h-5 ${activePath === '/suppliers' || activePath === '/vendors' ? 'text-emerald-600 scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 font-bold">VENDORS</span>
        </button>

        {/* Prominent Floating Center "ADD" Button */}
        <div className="relative -top-5">
          <button
            onClick={() => setIsQuickActionOpen(true)}
            className="w-14 h-14 rounded-full bg-emerald-600 text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-600/40 active:scale-90 transition-transform border-4 border-white"
            title="Add Transaction"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
            <span className="text-[9px] font-black uppercase tracking-tight -mt-0.5">ADD</span>
          </button>
        </div>

        <button
          onClick={() => navigate('/transactions')}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all min-h-[44px] ${
            activePath === '/transactions' ? 'text-emerald-700 font-bold' : 'text-gray-500 font-medium'
          }`}
        >
          <FileText className={`w-5 h-5 ${activePath === '/transactions' ? 'text-emerald-600 scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 font-bold">TRANSACTIONS</span>
        </button>

        <button
          onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all min-h-[44px] ${
            isMoreMenuOpen ? 'text-emerald-700 font-bold' : 'text-gray-500 font-medium'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">MORE</span>
        </button>
      </div>

      {/* Quick Action Sheet Modal */}
      <QuickActionSheet
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
      />
    </div>
  );
};
