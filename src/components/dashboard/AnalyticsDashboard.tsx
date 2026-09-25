import React, { useState, useEffect } from 'react';
import { 
  Ship, Anchor, TrendingUp, DollarSign, Package, 
  Clock, ShieldAlert, ArrowUpRight, ArrowDownRight, 
  MapPin, CheckCircle2, AlertTriangle, ChevronRight, 
  Flame, Gauge, RefreshCw, BarChart2, Plus
} from 'lucide-react';
import { Vessel, Booking, Port, Route, Customer, VoyageLog } from '../../types';
import { vesselService, bookingService, portService, routeService, customerService, voyageService } from '../../services/db';

interface AnalyticsDashboardProps {
  onNavigateToMap: (vesselId?: string) => void;
  onNavigateToBookings: () => void;
  onNewBookingClick: () => void;
  onViewBL: (booking: Booking) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  onNavigateToMap,
  onNavigateToBookings,
  onNewBookingClick,
  onViewBL,
}) => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [voyages, setVoyages] = useState<VoyageLog[]>([]);

  const loadData = () => {
    setVessels(vesselService.getAll());
    setBookings(bookingService.getAll());
    setPorts(portService.getAll());
    setRoutes(routeService.getAll());
    setCustomers(customerService.getAll());
    setVoyages(voyageService.getAll());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Analytics Metrics
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
  const totalTEU = bookings.filter(b => b.cargoCategory.includes('Container') || b.cargoCategory.includes('Reefer')).reduce((sum, b) => sum + (b.quantity || 0), 0);
  const totalTonnage = bookings.reduce((sum, b) => sum + (b.grossWeightTon || 0), 0);
  const activeVesselsCount = vessels.filter(v => v.status === 'Underway' || v.status === 'Loading').length;
  const inTransitBookings = bookings.filter(b => b.status === 'In Transit' || b.status === 'Loading').length;
  const onTimeRate = 96.8; // High reliability

  const formatRupiah = (val: number) => {
    if (val >= 1000000000) {
      return `Rp ${(val / 1000000000).toFixed(2)} M`;
    }
    if (val >= 1000000) {
      return `Rp ${(val / 1000000).toFixed(1)} Jt`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              ⚓ Maritime Ops Center
            </span>
            <span className="text-xs text-slate-400">Live Telemetri AIS Realtime</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard Operasional & Performa Armada
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Monitoring posisi kapal real-time, utilisasi muatan kargo, efisiensi konsumsi bunker, serta status pengiriman surat muatan maritim.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => onNavigateToMap()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Buka Peta AIS</span>
          </button>

          <button
            onClick={onNewBookingClick}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Booking Muatan</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Pendapatan Freight</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{formatRupiah(totalRevenue)}</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2% vs Bulan Lalu</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Armada Berlayar Aktif</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Ship className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{activeVesselsCount} / {vessels.length}</span>
            <span className="text-xs text-slate-400">Kapal</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-cyan-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AIS Telemetri Aktif 100%</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Muatan Terangkut</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{totalTonnage.toLocaleString('id-ID')}</span>
            <span className="text-xs text-slate-400">Ton / {totalTEU} TEU</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-blue-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Utilisasi Kapal: 87.4%</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Ketepatan Jadwal (On-Time)</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{onTimeRate}%</span>
            <span className="text-xs text-emerald-400 font-semibold">Sangat Baik</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Avg Port Turnaround: 18 Jam</span>
          </div>
        </div>
      </div>

      {/* Fleet Status Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Ship className="w-5 h-5 text-cyan-400" />
              <span>Matriks Status & Performa Armada Kapal (Realtime AIS)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Pemantauan koordinat GPS, kecepatan jelajah, konsumsi bunker, dan jadwal docking.
            </p>
          </div>

          <button
            onClick={() => onNavigateToMap()}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Buka Peta Satelit</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3 pr-4">Nama Kapal & IMO</th>
                <th className="pb-3 px-4">Tipe Armada</th>
                <th className="pb-3 px-4">Posisi & Rute</th>
                <th className="pb-3 px-4">Kecepatan</th>
                <th className="pb-3 px-4">Bunker BBM</th>
                <th className="pb-3 px-4">Status Operasi</th>
                <th className="pb-3 pl-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {vessels.map((ves) => {
                const route = routes.find(r => r.id === ves.currentRouteId);
                return (
                  <tr key={ves.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {ves.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Call Sign: {ves.callSign} | IMO: {ves.imoNumber}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {ves.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200 truncate max-w-[200px]">
                        {route ? route.name : 'Pelabuhan Domestik'}
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono">
                        Lat {ves.currentLat.toFixed(2)}°, Lng {ves.currentLng.toFixed(2)}°
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {ves.speedKnots} <span className="text-[10px] text-slate-400 font-normal">Knots</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-bold">{ves.fuelLevelPct}%</span>
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              ves.fuelLevelPct < 30 ? 'bg-red-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${ves.fuelLevelPct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">{ves.fuelBunkerType}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        ves.status === 'Underway'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ves.status === 'Underway' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        {ves.status}
                      </span>
                    </td>

                    <td className="py-3.5 pl-4 text-right">
                      <button
                        onClick={() => onNavigateToMap(ves.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1"
                      >
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 group-hover:text-white" />
                        <span>Lihat AIS</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid 2 Columns: Recent Transaksi Muatan & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                <span>Transaksi Surat Muatan & B/L Terkini</span>
              </h3>
              <p className="text-xs text-slate-400">Daftar booking aktif dan status pengiriman muatan.</p>
            </div>
            <button
              onClick={onNavigateToBookings}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Semua Transaksi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {bookings.slice(0, 4).map((bkg) => (
              <div
                key={bkg.id}
                className="p-4 bg-slate-950/80 hover:bg-slate-800/60 border border-slate-800 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{bkg.blNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      bkg.status === 'In Transit' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                      bkg.status === 'Loading' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {bkg.status}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">{bkg.customerName}</h4>
                  <p className="text-xs text-slate-400">
                    Kapal: <span className="text-slate-200 font-semibold">{bkg.vesselName}</span> • {bkg.commodityName} ({bkg.quantity} {bkg.quantityUnit})
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <span className="font-mono text-xs font-extrabold text-white">
                    Rp {bkg.grandTotal.toLocaleString('id-ID')}
                  </span>
                  <button
                    onClick={() => onViewBL(bkg)}
                    className="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Cetak B/L
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Nautical Notices (1 Col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-bold text-white">Peringatan Maritim & Cuaca</h3>
                <p className="text-[11px] text-slate-400">Notifikasi navigasi & BMKG Maritim</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Waspada Ombak Tinggi (Selat Makassar)</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Tinggi gelombang diperkirakan 2.0 - 2.5m. Kapal KM Barito Utama diinstruksikan menjaga kecepatan ekonomis 12.8 Knots.
                </p>
              </div>

              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-cyan-400">
                  <Anchor className="w-3.5 h-3.5" />
                  <span>Dermaga Tanjung Perak Beroperasi Normal</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Waktu tunggu sandar (berthing wait) rata-rata 1.2 jam dengan 36 crane STS aktif.
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-300">
                  <span>Jadwal Docking Terdekat</span>
                  <span className="text-cyan-400 font-mono text-[10px]">30 Okt 2026</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  MT Samudera Energy dijadwalkan Annual Survey & Dry Dock di Graha Galangan Nusantara.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigateToMap()}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
            >
              Lihat Seluruh Peta Pelayaran
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
