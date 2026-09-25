import React, { useState } from 'react';
import { 
  Ship, Lock, Mail, UserCheck, Building2, Phone, 
  ArrowRight, ShieldCheck, Compass, Eye, EyeOff, 
  CheckCircle2, Sparkles, Database, Search, Waves, 
  Radio, Anchor, FileText, Globe, KeyRound, AlertCircle
} from 'lucide-react';
import { User, UserRole, Booking } from '../../types';
import { authService, bookingService } from '../../services/db';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onOpenDbConfig: () => void;
  onQuickTrack?: (blNumber: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenDbConfig,
  onQuickTrack
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'quick_track'>('login');
  
  // Login Form States
  const [email, setEmail] = useState('admin@maritimlogistik.id');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('admin');
  const [regCompany, setRegCompany] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Quick Tracking Form States
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState<Booking | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  // General Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      if (!email.trim()) {
        setErrorMessage('Silakan masukkan email atau username Anda.');
        setLoading(false);
        return;
      }

      const result = authService.login(email, password);
      if (result.success && result.user) {
        setSuccessMessage(`Selamat datang kembali, ${result.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(result.user!);
        }, 300);
      } else {
        setErrorMessage(result.error || 'Autentikasi gagal. Silakan periksa kembali email dan password.');
      }
      setLoading(false);
    }, 450);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      if (!regName.trim() || !regEmail.trim()) {
        setErrorMessage('Nama lengkap dan email wajib diisi.');
        setLoading(false);
        return;
      }

      const newUser = authService.register(
        regName,
        regEmail,
        regRole,
        regCompany || 'PT Samudera Logistik Nusantara'
      );
      if (regPhone) {
        newUser.phone = regPhone;
        authService.setCurrentUser(newUser);
      }
      setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke sistem...');
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 400);
      setLoading(false);
    }, 450);
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      const result = authService.login(demoEmail, demoPass);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      }
      setLoading(false);
    }, 300);
  };

  const handleSearchQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError(null);
    setTrackResult(null);

    if (!trackQuery.trim()) {
      setTrackError('Masukkan nomor Resi B/L atau Nomor Booking (contoh: BL-SML-26-0091)');
      return;
    }

    const bookings = bookingService.getAll();
    const cleanQ = trackQuery.trim().toLowerCase();
    const found = bookings.find(
      b => b.blNumber.toLowerCase().includes(cleanQ) || b.bookingNumber.toLowerCase().includes(cleanQ)
    );

    if (found) {
      setTrackResult(found);
    } else {
      setTrackError(`Nomor resi/booking "${trackQuery}" tidak ditemukan dalam database.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-x-hidden font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Decorative Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/2" />
      <div className="fixed top-1/2 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 lg:px-12 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Ship className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base lg:text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                NAUTICALOG
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Enterprise v2.6
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Sistem Informasi Angkutan Laut & Pelacakan Armada Realtime
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDbConfig}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-cyan-400 transition-all shadow-sm"
            title="Konfigurasi Koneksi Database (Supabase / Neon / Local)"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Status Real Database</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Maritime Branding & Overview */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-5">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Live Maritime AIS Radar & Cargo ERP</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug mb-3">
                Ekosistem Angkutan Laut & Manajemen Logistik Terpadu
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Platform komprehensif untuk operasional kapal kargo, container, tanker CPO, dan LCT. Terintegrasi dengan master data, transaksi Surat Muatan Kapal (B/L), notifikasi WhatsApp otomatis, serta analitik armada.
              </p>

              {/* Feature bullet list */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mt-0.5">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white">Pelacakan Kapal Realtime di Peta Laut:</span>
                    <span className="text-slate-400 block">Koordinat GPS AIS akurat, kecepatan knots, rute, dan prakiraan tiba (ETA).</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 mt-0.5">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white">Modul CRUD Master, Transaksi & Laporan:</span>
                    <span className="text-slate-400 block">Kelola armada kapal, pelabuhan, tarif muatan, manifest, dan cetak invoice resmi.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white">Notifikasi Otomatis Multi-Kanal:</span>
                    <span className="text-slate-400 block">Pemberitahuan status kargo real-time ke nomor WhatsApp & email pelanggan.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Stats Footnote */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Armada Kapal</p>
                <p className="text-base font-extrabold text-cyan-400 mt-0.5">5 Unit</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Hub Pelabuhan</p>
                <p className="text-base font-extrabold text-blue-400 mt-0.5">8 Port</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">On-Time Rate</p>
                <p className="text-base font-extrabold text-emerald-400 mt-0.5">96.8%</p>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card with Tabs */}
          <div className="lg:col-span-7 bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl flex flex-col justify-between">
            <div>
              {/* Navigation Tab Selector */}
              <div className="flex rounded-2xl bg-slate-950 p-1.5 border border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'login'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Masuk (Login)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'register'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Daftar Akun Baru</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('quick_track');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'quick_track'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lacak Resi</span>
                  <span className="sm:hidden">Lacak</span>
                </button>
              </div>

              {/* Alert Feedback */}
              {errorMessage && (
                <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-xs text-red-300 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-200">Gagal Memproses</p>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3 text-xs text-emerald-300 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="font-semibold">{successMessage}</p>
                </div>
              )}

              {/* TAB 1: FORM LOGIN */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email / Username Administrator / Pengguna
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@maritimlogistik.id"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">Kata Sandi</label>
                      <span className="text-[11px] text-cyan-400">Default: admin123</span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span>Ingat sesi masuk saya</span>
                    </label>
                    <span className="text-slate-500">Real Database Connected</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Memvalidasi Kredensial...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk ke Dashboard NauticaLog</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: FORM REGISTER */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap</label>
                      <div className="relative">
                        <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Capt. Ridwan Alamsyah"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Email Resmi</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="ridwan@maritimlogistik.id"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Perusahaan / Afiliasi</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={regCompany}
                          onChange={(e) => setRegCompany(e.target.value)}
                          placeholder="PT Samudera Logistik Nusantara"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">No. HP / WhatsApp</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+628123456789"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Hak Akses / Peran Akun</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    >
                      <option value="admin">👑 Super Admin / Direktur Operasional (Full Control Master, Transaksi & Laporan)</option>
                      <option value="ops_manager">⚓ Fleet Ops Manager (Manajemen Kapal, Rute, Log Voyage, Pelabuhan)</option>
                      <option value="finance">💰 Finance Officer (Billing, Freight Rate, Invoicing & Laporan)</option>
                      <option value="customer">📦 Pelanggan / Shipper (Tracking Kargo, Booking & Notifikasi WhatsApp)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer"
                  >
                    {loading ? 'Mendaftarkan Akun...' : 'Daftar & Masuk ke Sistem'}
                  </button>
                </form>
              )}

              {/* TAB 3: QUICK TRACKING (WITHOUT FULL LOGIN) */}
              {activeTab === 'quick_track' && (
                <div className="space-y-4">
                  <form onSubmit={handleSearchQuickTrack} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Masukkan Nomor Bill of Lading (B/L) atau Kode Booking
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={trackQuery}
                            onChange={(e) => setTrackQuery(e.target.value)}
                            placeholder="Contoh: BL-SML-26-0091 atau BKG-2026-0891"
                            className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                        >
                          Cari
                        </button>
                      </div>
                    </div>
                  </form>

                  {trackError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
                      {trackError}
                    </div>
                  )}

                  {trackResult && (
                    <div className="p-4 bg-slate-950/80 border border-cyan-500/40 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Nomor Resi / B/L</span>
                          <p className="text-sm font-black text-cyan-400 font-mono">{trackResult.blNumber}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          trackResult.status === 'In Transit' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          trackResult.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          ● {trackResult.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">Pengirim (Shipper):</span>
                          <p className="font-semibold text-white truncate">{trackResult.customerName}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Kapal Pengangkut:</span>
                          <p className="font-semibold text-cyan-300 truncate">{trackResult.vesselName}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Muatan Kargo:</span>
                          <p className="font-semibold text-white">{trackResult.commodityName} ({trackResult.quantity} {trackResult.quantityUnit})</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Perkiraan Tiba (ETA):</span>
                          <p className="font-semibold text-amber-300">{trackResult.estimatedArrivalDate}</p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            // Quick login as client to view live tracking map
                            handleQuickDemo('logistik@indofood.co.id', 'client123');
                          }}
                          className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Buka Pelacakan Peta Digital Realtime</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Demo Logins Section */}
            <div className="pt-6 mt-6 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Akses Cepat Demo Akun (1-Click Login):</span>
                </span>
                <span className="text-[10px] text-slate-400">Pilih peran untuk langsung menguji</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin@maritimlogistik.id', 'admin123')}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-400 group-hover:text-cyan-300">👑 Admin</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">Capt. Hendra</p>
                  <p className="text-[9px] text-slate-500 font-mono">Full CRUD & Config</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('ops@samudera.co.id', 'ops123')}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-blue-500/30 hover:border-blue-400 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-400 group-hover:text-blue-300">⚓ Ops Fleet</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">Budi Santoso</p>
                  <p className="text-[9px] text-slate-500 font-mono">Peta & Armada</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('finance@samudera.co.id', 'finance123')}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 group-hover:text-emerald-300">💰 Finance</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">Ratna Kusuma</p>
                  <p className="text-[9px] text-slate-500 font-mono">Tarif & Laporan</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('logistik@indofood.co.id', 'client123')}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-purple-500/30 hover:border-purple-400 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-400 group-hover:text-purple-300">📦 Shipper</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">PT Indofood</p>
                  <p className="text-[9px] text-slate-500 font-mono">Tracking Portal</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-3.5 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <Anchor className="w-3.5 h-3.5 text-cyan-400" />
          <span>© 2026 NauticaLog Maritim Logistik. Sistem Informasi Bisnis Angkutan Laut Nasional & Internasional.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>Realtime AIS Protocol</span>
          <span>•</span>
          <span>B/L Electronic Manifest</span>
          <span>•</span>
          <span>WhatsApp Auto-Gateway</span>
        </div>
      </footer>
    </div>
  );
};
