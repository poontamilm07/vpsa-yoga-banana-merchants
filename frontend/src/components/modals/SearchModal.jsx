import React, { useState, useEffect } from 'react';
import { X, Search, User, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

export const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { formatCurrency } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ suppliers: [], customers: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ suppliers: [], customers: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.data || { suppliers: [], customers: [] });
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-16 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search Supplier, Customer, Phone, ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 text-base font-medium outline-hidden placeholder:text-gray-400"
          />
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading && <p className="text-xs text-center text-gray-400 py-4">Searching database...</p>}

          {!loading && query && results.suppliers.length === 0 && results.customers.length === 0 && (
            <p className="text-xs text-center text-gray-400 py-6">No matching supplier or customer found</p>
          )}

          {results.suppliers.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Suppliers ({results.suppliers.length})</h4>
              <div className="space-y-2">
                {results.suppliers.map(s => (
                  <div
                    key={s.id}
                    onClick={() => { onClose(); navigate(`/suppliers?id=${s.id}`); }}
                    className="p-3 rounded-2xl bg-gray-50 hover:bg-emerald-50 border border-gray-100 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {s.photoUrl ? (
                        <img src={s.photoUrl} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                          {s.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h5 className="font-bold text-sm text-gray-900">{s.name} <span className="text-xs text-gray-400 font-normal">({s.supplierCode})</span></h5>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {s.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {s.phone}</span>}
                          {s.village && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.village}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-700 block">{formatCurrency(s.outstandingBalance)}</span>
                      <span className="text-[10px] text-gray-400">Due Balance</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.customers.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customers ({results.customers.length})</h4>
              <div className="space-y-2">
                {results.customers.map(c => (
                  <div
                    key={c.id}
                    onClick={() => { onClose(); navigate(`/customers?id=${c.id}`); }}
                    className="p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 border border-gray-100 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {c.photoUrl ? (
                        <img src={c.photoUrl} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm">
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h5 className="font-bold text-sm text-gray-900">{c.name} <span className="text-xs text-gray-400 font-normal">({c.customerCode})</span></h5>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>}
                          {c.village && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.village}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-700 block">{formatCurrency(c.outstandingBalance)}</span>
                      <span className="text-[10px] text-gray-400">Receivable</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
