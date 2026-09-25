import React, { useState } from 'react';
import { 
  X, Lock, Mail, Ship, ShieldCheck, UserCheck, 
  ArrowRight, KeyRound, Building2, UserPlus, LogIn 
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { authService } from '../../services/db';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('admin@maritimlogistik.id');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      if (isRegisterMode) {
        if (!name.trim() || !email.trim()) {
          setError('Nama dan email wajib diisi.');
          setLoading(false);
          return;
        }
        const newUser = authService.register(name, email, role, companyName);
        onLoginSuccess(newUser);
        onClose();
      } else {
        if (!email.trim()) {
          setError('Email wajib diisi.');
          setLoading(false);
          return;
        }
        const result = authService.login(email, password);
        if (result.success && result.user) {
          onLoginSuccess(result.user);
          onClose();
        } else {
          setError(result.error || 'Login gagal, periksa email dan kata sandi.');
        }
      }
      setLoading(false);
    }, 400);
  };

  const handleQuickLogin = (quickEmail: string, quickRole: UserRole) => {
    setEmail(quickEmail);
    setPassword('demo12345');
    const result = authService.login(quickEmail);
    if (result.success && result.user) {
      onLoginSuccess(result.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 relative overflow-hidden">
        {/* Glowing backdrop circle */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Ship className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isRegisterMode ? 'Pendaftaran Akun Maritim' : 'Masuk ke Sistem NauticaLog'}
            </h2>
            <p className="text-xs text-slate-400">
              Sistem Manajemen Angkutan Laut & Pelacakan Armada Realtime
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Lengkap</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Capt. Ridwan Alamsyah"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Perusahaan / Shipper</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Contoh: PT Samudera Logistik / PT Indofood"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Peran / Hak Akses</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                >
                  <option value="admin">Super Admin / Direktur Operasional</option>
                  <option value="ops_manager">Fleet Ops Manager (Operasi Pelabuhan)</option>
                  <option value="finance">Finance Officer (Keuangan & Invoicing)</option>
                  <option value="customer">Pelanggan / Shipper (Tracking Portal)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email / Username</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="admin@maritimlogistik.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Kata Sandi</label>
              <span className="text-[11px] text-cyan-400">Default: admin123</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{isRegisterMode ? 'Daftarkan Akun Baru' : 'Masuk Sekarang'}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 mb-2.5">
            Pilihan Cepat Masuk Akun Demo:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@maritimlogistik.id', 'admin')}
              className="p-2 text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl transition-all"
            >
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
              </div>
              <div className="text-[10px] text-slate-400 truncate">Capt. Hendra Wijaya</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('ops@samudera.co.id', 'ops_manager')}
              className="p-2 text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 rounded-xl transition-all"
            >
              <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                <Ship className="w-3.5 h-3.5" /> Fleet Ops Manager
              </div>
              <div className="text-[10px] text-slate-400 truncate">Budi Santoso, S.T.</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('finance@samudera.co.id', 'finance')}
              className="p-2 text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 rounded-xl transition-all"
            >
              <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" /> Finance Officer
              </div>
              <div className="text-[10px] text-slate-400 truncate">Ratna Kusuma</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('logistik@indofood.co.id', 'customer')}
              className="p-2 text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 rounded-xl transition-all"
            >
              <div className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Shipper Pelanggan
              </div>
              <div className="text-[10px] text-slate-400 truncate">PT Indofood Tbk</div>
            </button>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError(null);
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors inline-flex items-center gap-1"
          >
            {isRegisterMode ? (
              'Sudah punya akun? Masuk di sini'
            ) : (
              'Belum punya akun? Registrasi akun baru'
            )}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
