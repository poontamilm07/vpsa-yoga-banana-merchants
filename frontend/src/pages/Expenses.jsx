import React, { useState, useEffect, useCallback } from 'react';
import { Receipt, Plus, Calendar, Tag } from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import { AddExpenseModal } from '../components/modals/AddExpenseModal';

export const Expenses = () => {
  const { refreshTrigger, formatCurrency } = useApp();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data.data || []);
    } catch (e) {
      console.error('Error fetching expenses', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, refreshTrigger]);

  const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-rose-600" />
            Business Expense Tracking
          </h2>
          <p className="text-xs text-gray-500">Track transport, freight, labour, loading & food costs</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[44px]"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase text-gray-400">Total Expenses Recorded</span>
          <h3 className="text-3xl font-black text-rose-700 mt-1">{formatCurrency(totalExpense)}</h3>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0">
          <Receipt className="w-6 h-6" />
        </div>
      </div>

      {/* Main Expenses Container */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3">Expense History Log</h3>

        {loading ? (
          <p className="text-xs text-center text-gray-400 py-8">Loading expenses log...</p>
        ) : expenses.length === 0 ? (
          <p className="text-xs text-center text-gray-400 py-8">No expenses recorded yet</p>
        ) : (
          <>
            {/* Mobile View: Responsive Expense Cards (< md) */}
            <div className="space-y-3 md:hidden">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-2xl bg-gray-50 border border-gray-200 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                      {exp.category}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {exp.expenseDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="font-mono text-xs font-bold text-gray-900 block">{exp.expenseCode}</span>
                      <p className="text-xs font-medium text-gray-700 mt-0.5">{exp.description || 'General expense'}</p>
                    </div>
                    <span className="text-base font-black text-rose-700 shrink-0 ml-2">
                      {formatCurrency(exp.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Full Data Table (≥ md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-100">
                    <th className="p-3">Date</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-gray-50/80">
                      <td className="p-3 whitespace-nowrap">{exp.expenseDate}</td>
                      <td className="p-3 whitespace-nowrap font-mono font-bold text-gray-900">{exp.expenseCode}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs truncate">{exp.description || 'N/A'}</td>
                      <td className="p-3 text-right font-black text-rose-700 text-sm">
                        {formatCurrency(exp.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
