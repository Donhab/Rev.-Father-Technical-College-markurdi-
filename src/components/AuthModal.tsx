import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SchoolBadge } from './SchoolBadge';
import {
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  asPage?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, asPage = false }) => {
  const { loginWithCredentials } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await loginWithCredentials(identifier, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const cardContent = (
    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden mx-auto">
      {/* Header */}
      <div className="bg-[#0b4d2c] p-6 text-white text-center relative">
        <div className="mx-auto flex items-center justify-center mb-2">
          <SchoolBadge size="md" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">MOAUM USTC Makurdi Portal Login</h2>
        <p className="text-xs text-emerald-100 mt-0.5">
          Rev. Fr. Moses Orshio Adasu University Science &amp; Technical College, Makurdi
        </p>
        {!asPage && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        <p className="text-xs text-stone-600 leading-relaxed">
          Sign in with your Student Admission Number, Staff ID, or Administrator Username to access your dashboard, activate scratch cards, and view academic records.
        </p>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Admission Number, Staff ID, or Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="Enter your Admission No, Staff ID, or Username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#0b4d2c] hover:bg-[#07361e] text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition"
          >
            <span>{submitting ? 'Signing In...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="text-stone-600 hover:text-[#0b4d2c] font-semibold inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home Page</span>
          </button>
          <span className="text-[11px] text-stone-400">Secure Portal Authentication</span>
        </div>
      </div>
    </div>
  );

  if (asPage) {
    return (
      <div className="py-8 sm:py-12 px-4">
        {cardContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {cardContent}
    </div>
  );
};
