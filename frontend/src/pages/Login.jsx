import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, User, KeyRound } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-banana-100 via-gray-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full border border-gray-100 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-banana-400 text-banana-950 font-black text-4xl flex items-center justify-center mx-auto shadow-lg shadow-banana-400/30">
            🍌
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Banana Ledger</h1>
          <p className="text-xs text-gray-500 font-medium">Banana Trading & Business Management System</p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Username</label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 font-medium text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 font-medium text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            <span>{loading ? 'Signing In...' : 'Sign In to Ledger'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-2">Default Demo Admin Account:</p>
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-mono flex items-center justify-between">
            <span>user: <b>admin</b> | pass: <b>admin123</b></span>
            <button
              type="button"
              onClick={() => { setUsername('admin'); setPassword('admin123'); }}
              className="text-emerald-700 font-bold hover:underline"
            >
              Pre-fill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
