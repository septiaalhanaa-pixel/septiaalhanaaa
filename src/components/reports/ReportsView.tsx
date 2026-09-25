import React, { useState, useEffect } from 'react';
import { 
  BarChart3, FileSpreadsheet, Printer, Download, 
  Calendar, Filter, DollarSign, Ship, Package, 
  TrendingUp, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { Booking, Vessel, Route, Customer, VoyageLog } from '../../types';
import { bookingService, vesselService, routeService, customerService, voyageService } from '../../services/db';

export const ReportsView: React.FC = () => {
  const [reportType, setReportType] = useState<'financial' | 'operations' | 'utilization' | 'customer_recap'>('financial');
  const [dateRange, setDateRange] = useState('bulan_ini');
  const [selectedVessel, setSelectedVessel] = useState('all');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [voyages, setVoyages] = useState<VoyageLog[]>([]);

  useEffect(() => {
    setBookings(bookingService.getAll());
    setVessels(vesselService.getAll());
    setRoutes(routeService.getAll());
    setCustomers(customerService.getAll());
    setVoyages(voyageService.getAll());
  }, []);

  // Filtered Bookings for calculations
  const filteredBookings = bookings.filter((b) => {
    if (selectedVessel !== 'all' && b.vesselId !== selectedVessel) return false;
    return true;
  });

  const totalGrossFreight = filteredBookings.reduce((sum, b) => sum + b.freightTotal, 0);
  const totalHandlingIncome = filteredBookings.reduce((sum, b) => sum + b.handlingTotal, 0);
  const totalInsurance = filteredBookings.reduce((sum, b) => sum + b.insuranceCost, 0);
  const totalGrandRevenue = filteredBookings.reduce((sum, b) => sum + b.grandTotal, 0);

  // Bunker Fuel Expenses Estimation (approx Rp 12,500/liter VLSFO)
  const totalFuelLiters = voyages.reduce((sum, v) => sum + v.fuelConsumptionLiters, 0);
  const totalFuelCost = totalFuelLiters * 12500;
  const netEstimatedProfit = totalGrandRevenue - totalFuelCost;

  // Export to CSV Function
  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'financial') {
      csvContent += 'No B/L,No Booking,Shipper,Kapal,Freight (IDR),Handling (IDR),Asuransi (IDR),Total (IDR),Status Bayar,Tanggal\n';
      filteredBookings.forEach((b) => {
        csvContent += `"${b.blNumber}","${b.bookingNumber}","${b.customerName}","${b.vesselName}",${b.freightTotal},${b.handlingTotal},${b.insuranceCost},${b.grandTotal},"${b.paymentStatus}","${b.createdAt}"\n`;
      });
    } else if (reportType === 'operations') {
      csvContent += 'Voyage No,Kapal,Speed (Knots),Distance (NM),Total NM,BBM (Liters),Cuaca,Status\n';
      voyages.forEach((v) => {
        csvContent += `"${v.voyageNumber}","${v.vesselName}",${v.speedKnots},${v.distanceTraveledNM},${v.totalDistanceNM},${v.fuelConsumptionLiters},"${v.weatherCondition}","${v.status}"\n`;
      });
    } else {
      csvContent += 'Kode Pelanggan,Nama Perusahaan,PIC,WhatsApp,Term Bayar,Plafon Kredit,Total Muatan\n';
      customers.forEach((c) => {
        csvContent += `"${c.code}","${c.companyName}","${c.contactPerson}","${c.whatsapp}","${c.paymentTerms}",${c.creditLimit},${c.totalShipments}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Maritim_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            <span>Pusat Laporan & Rekapitulasi Bisnis Angkutan Laut</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ekspor rekap keuangan freight, utilisasi armada kapal, efisiensi konsumsi bunker BBM, dan performa shipper ke CSV / Excel & PDF Resmi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-700 shadow"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV / Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Report Nav Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'financial', label: '💰 Laporan Keuangan & Pendapatan Freight' },
          { id: 'operations', label: '🧭 Laporan Operasional & Bunker Pelayaran' },
          { id: 'utilization', label: '📦 Laporan Utilisasi Muatan Kapal (TEU/Ton)' },
          { id: 'customer_recap', label: '👥 Rekapitulasi Pelanggan & Volume' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              reportType === tab.id
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold">Periode:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white outline-none"
            >
              <option value="bulan_ini">Bulan Berjalan (September 2026)</option>
              <option value="kuartal_3">Kuartal III 2026 (Q3)</option>
              <option value="tahun_2026">Tahun Buku 2026 (YTD)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Ship className="w-4 h-4 text-blue-400" />
            <span className="font-semibold">Filter Kapal:</span>
            <select
              value={selectedVessel}
              onChange={(e) => setSelectedVessel(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white outline-none"
            >
              <option value="all">Semua Armada ({vessels.length} Kapal)</option>
              {vessels.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Menampilkan {filteredBookings.length} data transaksi
        </span>
      </div>

      {/* KPI Financial Cards (For Financial View) */}
      {reportType === 'financial' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs text-slate-400 block mb-1">Gross Freight Revenue</span>
            <span className="text-xl font-extrabold text-white font-mono">
              Rp {totalGrossFreight.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs text-slate-400 block mb-1">Handling & THC Revenue</span>
            <span className="text-xl font-extrabold text-cyan-400 font-mono">
              Rp {totalHandlingIncome.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs text-slate-400 block mb-1">Estimasi Biaya Bunker BBM</span>
            <span className="text-xl font-extrabold text-amber-400 font-mono">
              Rp {totalFuelCost.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/30 border-emerald-500/30">
            <span className="text-xs text-emerald-400 block mb-1 font-bold">Estimasi Net Profit Maritim</span>
            <span className="text-xl font-extrabold text-emerald-300 font-mono">
              Rp {netEstimatedProfit.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      )}

      {/* Data Table Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            {reportType === 'financial' && 'Tabel Rincian Pendapatan Freight & Tagihan'}
            {reportType === 'operations' && 'Tabel Log Efisiensi & Bahan Bakar Pelayaran'}
            {reportType === 'utilization' && 'Tabel Utilisasi Muatan Kontainer & Curah'}
            {reportType === 'customer_recap' && 'Tabel Rekapitulasi Pelanggan & Shipper'}
          </h3>
          <span className="text-xs text-cyan-400 font-mono font-bold">NAUTICALOG AUDIT READY</span>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'financial' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="py-3 px-4">No. B/L</th>
                  <th className="py-3 px-4">Pelanggan (Shipper)</th>
                  <th className="py-3 px-4">Kapal Pengangkut</th>
                  <th className="py-3 px-4">Freight (Rp)</th>
                  <th className="py-3 px-4">THC & Handling (Rp)</th>
                  <th className="py-3 px-4">Grand Total (Rp)</th>
                  <th className="py-3 px-4">Status Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">{b.blNumber}</td>
                    <td className="py-3 px-4 font-semibold text-white">{b.customerName}</td>
                    <td className="py-3 px-4 text-slate-300">{b.vesselName}</td>
                    <td className="py-3 px-4 font-mono">{b.freightTotal.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 font-mono">{b.handlingTotal.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{b.grandTotal.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.paymentStatus === 'Lunas' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'operations' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="py-3 px-4">No. Voyage</th>
                  <th className="py-3 px-4">Kapal</th>
                  <th className="py-3 px-4">Kecepatan Jelajah</th>
                  <th className="py-3 px-4">Jarak Tempuh</th>
                  <th className="py-3 px-4">Bunker BBM Terpakai</th>
                  <th className="py-3 px-4">Kondisi Cuaca Laut</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {voyages.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">{v.voyageNumber}</td>
                    <td className="py-3 px-4 font-semibold text-white">{v.vesselName}</td>
                    <td className="py-3 px-4 font-mono">{v.speedKnots} Knots</td>
                    <td className="py-3 px-4 font-mono">{v.distanceTraveledNM} / {v.totalDistanceNM} NM</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{v.fuelConsumptionLiters} Liter</td>
                    <td className="py-3 px-4 text-slate-300">{v.weatherCondition}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'utilization' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="py-3 px-4">Nama Kapal</th>
                  <th className="py-3 px-4">Tipe Armada</th>
                  <th className="py-3 px-4">Kapasitas Maksimal</th>
                  <th className="py-3 px-4">Muatan Terisi Onboard</th>
                  <th className="py-3 px-4">Utilisasi (%)</th>
                  <th className="py-3 px-4">Status Sandar/Laut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {vessels.map((v) => {
                  const vesBookings = bookings.filter((b) => b.vesselId === v.id);
                  const carriedQty = vesBookings.reduce((sum, b) => sum + b.quantity, 0);
                  const carriedTons = vesBookings.reduce((sum, b) => sum + b.grossWeightTon, 0);
                  const utilPct = v.capacityTEU > 0 
                    ? Math.min(100, Math.round((carriedQty / v.capacityTEU) * 100))
                    : Math.min(100, Math.round((carriedTons / (v.capacityDWT || 1)) * 100));

                  return (
                    <tr key={v.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-white">{v.name}</td>
                      <td className="py-3 px-4 text-slate-400">{v.type}</td>
                      <td className="py-3 px-4 font-mono">
                        {v.capacityTEU > 0 ? `${v.capacityTEU} TEU` : `${v.capacityDWT.toLocaleString('id-ID')} DWT`}
                      </td>
                      <td className="py-3 px-4 font-mono text-cyan-300">
                        {v.capacityTEU > 0 ? `${carriedQty} TEU` : `${carriedTons} Ton`} ({vesBookings.length} B/L)
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{utilPct}%</span>
                          <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${utilPct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {reportType === 'customer_recap' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="py-3 px-4">Kode & Perusahaan</th>
                  <th className="py-3 px-4">PIC Supply Chain</th>
                  <th className="py-3 px-4">WhatsApp Notifikasi</th>
                  <th className="py-3 px-4">Total Pengiriman</th>
                  <th className="py-3 px-4">Term Pembayaran</th>
                  <th className="py-3 px-4">Plafon Kredit (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{c.companyName}</div>
                      <div className="text-[10px] font-mono text-cyan-400">{c.code}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{c.contactPerson}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">+{c.whatsapp}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{c.totalShipments} Shipment</td>
                    <td className="py-3 px-4 text-slate-300">{c.paymentTerms}</td>
                    <td className="py-3 px-4 font-mono text-cyan-300">
                      Rp {(c.creditLimit / 1000000000).toFixed(1)} Miliar
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
