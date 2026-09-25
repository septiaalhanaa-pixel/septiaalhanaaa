import React from 'react';
import { 
  LayoutDashboard, MapPin, Ship, Anchor, Navigation, 
  Package, Users, FileText, ScrollText, Compass, 
  BarChart3, BellRing, Database, ChevronRight, Sparkles,
  Layers, ShieldCheck, DollarSign
} from 'lucide-react';
import { UserRole } from '../../types';

export type ActiveTab = 
  | 'dashboard'
  | 'map_tracking'
  | 'master_vessels'
  | 'master_ports'
  | 'master_routes'
  | 'master_commodities'
  | 'master_customers'
  | 'trans_bookings'
  | 'trans_bl'
  | 'trans_voyages'
  | 'reports'
  | 'notifications'
  | 'database_settings';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  countKey?: string;
  isPrimary?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userRole?: UserRole;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole = 'admin',
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const navItems: NavGroup[] = [
    {
      group: 'UTAMA & MONITORING',
      items: [
        {
          id: 'dashboard' as ActiveTab,
          label: 'Dashboard Analitik',
          icon: LayoutDashboard,
          badge: 'Live',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        },
        {
          id: 'map_tracking' as ActiveTab,
          label: 'Peta Pelacakan AIS',
          icon: MapPin,
          badge: 'Realtime',
          badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
        },
      ]
    },
    {
      group: 'MODUL MASTER DATA',
      items: [
        { id: 'master_vessels' as ActiveTab, label: 'Armada & Kapal', icon: Ship, countKey: 'vessels' },
        { id: 'master_ports' as ActiveTab, label: 'Pelabuhan & Hub', icon: Anchor, countKey: 'ports' },
        { id: 'master_routes' as ActiveTab, label: 'Rute Pelayaran', icon: Navigation, countKey: 'routes' },
        { id: 'master_commodities' as ActiveTab, label: 'Komoditas & Tarif', icon: Package, countKey: 'commodities' },
        { id: 'master_customers' as ActiveTab, label: 'Data Pelanggan', icon: Users, countKey: 'customers' },
      ]
    },
    {
      group: 'MODUL TRANSAKSI DATA',
      items: [
        { id: 'trans_bookings' as ActiveTab, label: 'Booking & Surat Muatan', icon: FileText, isPrimary: true },
        { id: 'trans_bl' as ActiveTab, label: 'Bill of Lading (B/L)', icon: ScrollText },
        { id: 'trans_voyages' as ActiveTab, label: 'Log Perjalanan Kapal', icon: Compass },
      ]
    },
    {
      group: 'LAPORAN & ANALISIS',
      items: [
        { id: 'reports' as ActiveTab, label: 'Laporan & Keuangan', icon: BarChart3 },
        { id: 'notifications' as ActiveTab, label: 'Notifikasi Pelanggan', icon: BellRing, badge: 'Auto WA' },
      ]
    },
    {
      group: 'PENGATURAN SISTEM',
      items: [
        { id: 'database_settings' as ActiveTab, label: 'Koneksi Real Database', icon: Database, badge: 'Multi-DB' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900/95 border-r border-slate-800/80 
        flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {navItems.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold
                        transition-all duration-150 group text-left
                        ${isActive 
                          ? 'bg-gradient-to-r from-cyan-600/90 to-blue-600 text-white shadow-lg shadow-cyan-600/20 ring-1 ring-white/20' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      
                      {item.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : item.badgeColor || 'bg-slate-800 text-cyan-300 border border-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Maritime Fleet Status Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <p className="text-[11px] font-bold text-white tracking-tight">AIS Telemetri Aktif</p>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              6 Kapal Komersial Terpantau di Perairan Nusantara & Selat Malaka.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
