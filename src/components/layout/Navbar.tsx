import React, { useState, useEffect } from 'react';
import { 
  Ship, Anchor, Bell, Search, Database, User as UserIcon, 
  LogOut, Shield, Compass, ChevronDown, CheckCircle2, 
  ExternalLink, MessageSquareText, Globe
} from 'lucide-react';
import { User, NotificationLog, DatabaseConfig } from '../../types';
import { notificationService, dbConfigService } from '../../services/db';

interface NavbarProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenDbConfig: () => void;
  onOpenNotifications: () => void;
  onSearchBL: (query: string) => void;
  onSelectRole: (role: User['role']) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenDbConfig,
  onOpenNotifications,
  onSearchBL,
  onSelectRole,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(dbConfigService.getConfig());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setNotifications(notificationService.getAll());
    setDbConfig(dbConfigService.getConfig());
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchBL(searchQuery.trim());
    }
  };

  const getRoleBadge = (role?: User['role']) => {
    switch (role) {
      case 'admin':
        return { label: 'Super Admin / Direksi', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'ops_manager':
        return { label: 'Fleet Ops Manager', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case 'finance':
        return { label: 'Finance & Invoicing', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'customer':
        return { label: 'Portal Pelanggan / Shipper', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      default:
        return { label: 'Tamu / Guest', bg: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
          <Ship className="w-5 h-5" />
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent">
              NAUTICALOG
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
              v2.6 AIS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-none">
            Sistem Angkutan Laut & Pelacakan Armada Realtime
          </p>
        </div>
      </div>

      {/* Center Search - Quick B/L & Resi Lookup */}
      <div className="flex-1 max-w-md hidden md:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No. Resi / B/L (Contoh: BL-SML-26-0091 atau BKG-2026)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-20 py-2 bg-slate-950/70 border border-slate-700/70 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-mono"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-1"
          >
            <span>Lacak</span>
          </button>
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs font-mono">
          <Globe className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '15s' }} />
          <span>{currentTime || 'WIB Time'}</span>
        </div>

        {/* Database Status Button */}
        <button
          onClick={onOpenDbConfig}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 transition-colors group"
          title="Koneksi Real Database (Supabase / Neon / Firebase / Local)"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Database className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300" />
          <span className="hidden sm:inline font-medium capitalize">
            {dbConfig.provider.replace('_', ' ')}
          </span>
        </button>

        {/* Notifications Icon with Badge */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
          title="Notifikasi Otomatis Pelanggan (WhatsApp/Email)"
        >
          <Bell className="w-4 h-4" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-900 animate-bounce">
              {notifications.length}
            </span>
          )}
        </button>

        {/* User Account / Role Switcher */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-semibold text-white leading-tight truncate max-w-[130px]">
                  {currentUser.name}
                </p>
                <span className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded border ${roleInfo.bg}`}>
                  {roleInfo.label}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in"
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <div className="px-4 py-3 border-b border-slate-800">
                  <p className="text-xs text-slate-400">Masuk sebagai</p>
                  <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-xs text-cyan-400 font-mono truncate">{currentUser.email}</p>
                  <div className="mt-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleInfo.bg}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                </div>

                {/* Quick Role Switcher */}
                <div className="p-2 border-b border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400 px-2 mb-1">Ganti Peran Cepat (Simulasi):</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => { onSelectRole('admin'); setShowUserMenu(false); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        currentUser.role === 'admin' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>🛡️ Super Admin</span>
                      {currentUser.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                    <button
                      onClick={() => { onSelectRole('ops_manager'); setShowUserMenu(false); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        currentUser.role === 'ops_manager' ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>🚢 Fleet Ops Manager</span>
                      {currentUser.role === 'ops_manager' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                    <button
                      onClick={() => { onSelectRole('finance'); setShowUserMenu(false); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        currentUser.role === 'finance' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>💰 Finance & Invoicing</span>
                      {currentUser.role === 'finance' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                    <button
                      onClick={() => { onSelectRole('customer'); setShowUserMenu(false); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        currentUser.role === 'customer' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>📦 Portal Pelanggan</span>
                      {currentUser.role === 'customer' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                    </button>
                  </div>
                </div>

                <div className="p-1">
                  <button
                    onClick={() => { onLogout(); setShowUserMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar Akun (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Login Admin / Portal</span>
          </button>
        )}
      </div>
    </header>
  );
};
