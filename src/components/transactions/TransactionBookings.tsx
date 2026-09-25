import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Edit2, Trash2, Search, Filter, 
  CheckCircle2, Clock, AlertTriangle, ArrowRight, 
  Ship, Anchor, Package, Users, DollarSign, X, 
  Send, MessageSquare, Printer, Check, Eye, Navigation
} from 'lucide-react';
import { 
  Booking, BookingStatus, PaymentStatus, Vessel, 
  Port, Route, Commodity, Customer 
} from '../../types';
import { 
  bookingService, vesselService, portService, 
  routeService, commodityService, customerService 
} from '../../services/db';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface TransactionBookingsProps {
  onViewBL: (booking: Booking) => void;
  onOpenMapTrack?: (booking: Booking) => void;
}

export const TransactionBookings: React.FC<TransactionBookingsProps> = ({
  onViewBL,
  onOpenMapTrack,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [statusTargetBooking, setStatusTargetBooking] = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);

  // Form Fields for Booking
  const [customerId, setCustomerId] = useState('');
  const [vesselId, setVesselId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [originPortId, setOriginPortId] = useState('');
  const [destinationPortId, setDestinationPortId] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [estimatedArrivalDate, setEstimatedArrivalDate] = useState('');
  const [commodityId, setCommodityId] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [grossWeightTon, setGrossWeightTon] = useState<number>(200);
  const [volumeCBM, setVolumeCBM] = useState<number>(330);
  const [freightTotal, setFreightTotal] = useState<number>(45000000);
  const [handlingTotal, setHandlingTotal] = useState<number>(3500000);
  const [insuranceCost, setInsuranceCost] = useState<number>(121250);
  const [grandTotal, setGrandTotal] = useState<number>(48621250);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Lunas');
  const [paymentMethod, setPaymentMethod] = useState<Booking['paymentMethod']>('Bank Transfer');
  const [notes, setNotes] = useState('');

  // Status Progression Form
  const [nextStatus, setNextStatus] = useState<BookingStatus>('In Transit');
  const [statusLocation, setStatusLocation] = useState('');
  const [statusDescription, setStatusDescription] = useState('');

  const loadData = () => {
    setBookings(bookingService.getAll());
    setVessels(vesselService.getAll());
    setPorts(portService.getAll());
    setRoutes(routeService.getAll());
    setCommodities(commodityService.getAll());
    setCustomers(customerService.getAll());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Automatic Tariff calculation when commodity or quantity changes
  const recalculateTariff = (cmdId: string, rotId: string, qty: number, ton: number) => {
    const cmd = commodities.find((c) => c.id === cmdId);
    const rot = routes.find((r) => r.id === rotId);
    if (!cmd) return;

    let baseRate = cmd.tariffPerUnit;
    if (rot) {
      if (cmd.unit === 'TEU' || cmd.unit === 'FEU') {
        baseRate = rot.baseRatePerTEU;
      } else if (cmd.unit === 'Ton') {
        baseRate = rot.baseRatePerTon;
      }
    }

    const calculatedFreight = baseRate * qty;
    const calculatedHandling = cmd.handlingFee * qty;
    const calculatedInsurance = Math.round((calculatedFreight * (cmd.insuranceRatePct || 0.25)) / 100);
    const total = calculatedFreight + calculatedHandling + calculatedInsurance;

    setFreightTotal(calculatedFreight);
    setHandlingTotal(calculatedHandling);
    setInsuranceCost(calculatedInsurance);
    setGrandTotal(total);
  };

  const openAddModal = () => {
    setEditingBooking(null);
    const firstCust = customers[0]?.id || '';
    const firstVes = vessels[0]?.id || '';
    const firstRot = routes[0]?.id || '';
    const firstCmd = commodities[0]?.id || '';

    setCustomerId(firstCust);
    setVesselId(firstVes);
    setRouteId(firstRot);
    setOriginPortId(ports[0]?.id || '');
    setDestinationPortId(ports[1]?.id || '');

    const now = new Date();
    const dep = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' ');
    const arr = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' ');

    setDepartureDate(dep);
    setEstimatedArrivalDate(arr);
    setCommodityId(firstCmd);
    setQuantity(10);
    setGrossWeightTon(200);
    setVolumeCBM(330);
    setPaymentStatus('Lunas');
    setPaymentMethod('Bank Transfer');
    setNotes('Muatan standar siap muat, surat jalan terlampir.');

    recalculateTariff(firstCmd, firstRot, 10, 200);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Booking) => {
    setEditingBooking(b);
    setCustomerId(b.customerId);
    setVesselId(b.vesselId);
    setRouteId(b.routeId);
    setOriginPortId(b.originPortId);
    setDestinationPortId(b.destinationPortId);
    setDepartureDate(b.departureDate);
    setEstimatedArrivalDate(b.estimatedArrivalDate);
    setCommodityId(b.commodityId);
    setQuantity(b.quantity);
    setGrossWeightTon(b.grossWeightTon);
    setVolumeCBM(b.volumeCBM);
    setFreightTotal(b.freightTotal);
    setHandlingTotal(b.handlingTotal);
    setInsuranceCost(b.insuranceCost);
    setGrandTotal(b.grandTotal);
    setPaymentStatus(b.paymentStatus);
    setPaymentMethod(b.paymentMethod);
    setNotes(b.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId);
    const ves = vessels.find((v) => v.id === vesselId);
    const cmd = commodities.find((c) => c.id === commodityId);

    const payload = {
      customerId,
      customerName: cust?.companyName || 'Pelanggan Maritim',
      customerPhone: cust?.phone || '+62-',
      customerWhatsapp: cust?.whatsapp || '6281200000000',
      vesselId,
      vesselName: ves?.name || 'MV Samudera Perkasa',
      routeId,
      originPortId,
      destinationPortId,
      departureDate,
      estimatedArrivalDate,
      status: editingBooking ? editingBooking.status : ('Confirmed' as BookingStatus),
      commodityId,
      commodityName: cmd?.name || 'General Cargo',
      cargoCategory: cmd?.category || 'Container FCL',
      quantity: Number(quantity),
      quantityUnit: cmd?.unit || 'TEU',
      grossWeightTon: Number(grossWeightTon),
      volumeCBM: Number(volumeCBM),
      freightTotal: Number(freightTotal),
      handlingTotal: Number(handlingTotal),
      insuranceCost: Number(insuranceCost),
      grandTotal: Number(grandTotal),
      paymentStatus,
      paymentMethod,
      notes,
    };

    if (editingBooking) {
      bookingService.update(editingBooking.id, payload);
    } else {
      bookingService.create(payload);
    }

    setIsModalOpen(false);
    loadData();
  };

  const openStatusModal = (b: Booking) => {
    setStatusTargetBooking(b);
    if (b.status === 'Draft') setNextStatus('Confirmed');
    else if (b.status === 'Confirmed') setNextStatus('Loading');
    else if (b.status === 'Loading') setNextStatus('In Transit');
    else if (b.status === 'In Transit') setNextStatus('Arrived');
    else if (b.status === 'Arrived') setNextStatus('Delivered');
    else setNextStatus('Delivered');

    setStatusLocation(ports.find((p) => p.id === b.originPortId)?.name || 'Dermaga Petikemas');
    setStatusDescription(`Pembaruan status operasional muatan ${b.bookingNumber}. Notifikasi WhatsApp otomatis terkirim.`);
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatusConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (statusTargetBooking) {
      bookingService.updateStatus(
        statusTargetBooking.id,
        nextStatus,
        statusLocation,
        statusDescription,
        'Admin Operasional'
      );
      setIsStatusModalOpen(false);
      setStatusTargetBooking(null);
      loadData();
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingBooking) {
      bookingService.delete(deletingBooking.id);
      setDeletingBooking(null);
      loadData();
    }
  };

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.blNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.vesselName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchPayment = filterPayment === 'all' || b.paymentStatus === filterPayment;
    return matchSearch && matchStatus && matchPayment;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-cyan-400" />
            <span>Transaksi Booking & Surat Muatan Kapal</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Penerbitan surat muatan kargo, Bill of Lading (B/L), kalkulasi tarif otomatis, serta pembaruan status berlayar dengan notifikasi WhatsApp real-time.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Booking Muatan Baru</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari no. B/L, booking, nama perusahaan shipper, atau kapal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 outline-none"
          >
            <option value="all">Semua Status Muatan</option>
            <option value="Draft">Draft</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Loading">Loading di Pelabuhan</option>
            <option value="In Transit">In Transit (Berlayar)</option>
            <option value="Arrived">Arrived (Tiba)</option>
            <option value="Delivered">Delivered (Selesai)</option>
          </select>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 outline-none"
          >
            <option value="all">Semua Pembayaran</option>
            <option value="Lunas">Lunas</option>
            <option value="DP Dibayar">DP Dibayar</option>
            <option value="Belum Bayar">Belum Bayar</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Nomor B/L & Booking</th>
                <th className="py-3.5 px-4">Shipper / Pelanggan</th>
                <th className="py-3.5 px-4">Armada & Rute</th>
                <th className="py-3.5 px-4">Muatan Kargo</th>
                <th className="py-3.5 px-4">Nilai Freight (IDR)</th>
                <th className="py-3.5 px-4">Status Pengiriman</th>
                <th className="py-3.5 px-4 text-right">Aksi CRUD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filtered.map((bkg) => (
                <tr key={bkg.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-cyan-400 text-sm group-hover:text-cyan-300">
                      {bkg.blNumber}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">{bkg.bookingNumber}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{bkg.createdAt}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white max-w-[180px] truncate">{bkg.customerName}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">WA: +{bkg.customerWhatsapp}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200 flex items-center gap-1">
                      <Ship className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate max-w-[160px]">{bkg.vesselName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      ETD: {bkg.departureDate.slice(5)} → ETA: {bkg.estimatedArrivalDate.slice(5)}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{bkg.commodityName}</div>
                    <div className="text-[10px] text-slate-300 font-mono">
                      {bkg.quantity} {bkg.quantityUnit} ({bkg.grossWeightTon} Ton / {bkg.volumeCBM} m³)
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-mono font-extrabold text-white text-sm">
                      Rp {bkg.grandTotal.toLocaleString('id-ID')}
                    </div>
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                      bkg.paymentStatus === 'Lunas'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {bkg.paymentStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => openStatusModal(bkg)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-transform hover:scale-105 ${
                        bkg.status === 'In Transit'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          : bkg.status === 'Loading'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : bkg.status === 'Arrived'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                      title="Klik untuk update milestone & kirim notifikasi"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{bkg.status}</span>
                      <span className="text-[9px] opacity-60">✏️</span>
                    </button>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {bkg.trackingEvents.length} Checkpoints
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewBL(bkg)}
                        className="p-1.5 bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 rounded-lg transition-colors"
                        title="Cetak Bill of Lading (B/L)"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(bkg)}
                        className="p-1.5 bg-slate-800 hover:bg-blue-500/20 hover:text-blue-300 text-slate-300 rounded-lg transition-colors"
                        title="Edit Booking"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingBooking(bkg)}
                        className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-lg transition-colors"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Form Modal (Wizard / Full Form) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingBooking ? 'Edit Transaksi Surat Muatan' : 'Penerbitan Booking & Surat Muatan Kapal (B/L)'}
                </h3>
                <p className="text-xs text-slate-400">Kalkulasi biaya freight terintegrasi dengan tarif komoditas</p>
              </div>
            </div>

            <form onSubmit={handleSaveBooking} className="space-y-4">
              {/* Row 1: Shipper & Vessel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pelanggan / Shipper *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} (PIC: {c.contactPerson})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Armada Kapal Pengangkut *</label>
                  <select
                    value={vesselId}
                    onChange={(e) => setVesselId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    {vessels.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.type} - {v.capacityTEU > 0 ? `${v.capacityTEU} TEU` : `${v.capacityDWT} DWT`})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Route & Ports */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rute Pelayaran</label>
                  <select
                    value={routeId}
                    onChange={(e) => {
                      setRouteId(e.target.value);
                      recalculateTariff(commodityId, e.target.value, quantity, grossWeightTon);
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.code} - {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pelabuhan Muat (Origin)</label>
                  <select
                    value={originPortId}
                    onChange={(e) => setOriginPortId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pelabuhan Bongkar (Dest)</label>
                  <select
                    value={destinationPortId}
                    onChange={(e) => setDestinationPortId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Schedule Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Waktu Berangkat (ETD)</label>
                  <input
                    type="text"
                    placeholder="2026-09-25 08:00"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimasi Tiba (ETA)</label>
                  <input
                    type="text"
                    placeholder="2026-09-27 12:00"
                    value={estimatedArrivalDate}
                    onChange={(e) => setEstimatedArrivalDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Row 4: Cargo & Measurements */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <p className="text-xs font-bold text-cyan-400">Spesifikasi Kargo & Pengukuran</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Jenis Komoditas</label>
                    <select
                      value={commodityId}
                      onChange={(e) => {
                        setCommodityId(e.target.value);
                        recalculateTariff(e.target.value, routeId, quantity, grossWeightTon);
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    >
                      {commodities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Kuantitas</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const q = Number(e.target.value);
                        setQuantity(q);
                        recalculateTariff(commodityId, routeId, q, grossWeightTon);
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Berat Bruto (Ton)</label>
                    <input
                      type="number"
                      value={grossWeightTon}
                      onChange={(e) => setGrossWeightTon(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Financials & Totals */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Ongkos Angkut (Freight)</span>
                  <input
                    type="number"
                    value={freightTotal}
                    onChange={(e) => {
                      const f = Number(e.target.value);
                      setFreightTotal(f);
                      setGrandTotal(f + handlingTotal + insuranceCost);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Biaya Handling Dermaga</span>
                  <input
                    type="number"
                    value={handlingTotal}
                    onChange={(e) => {
                      const h = Number(e.target.value);
                      setHandlingTotal(h);
                      setGrandTotal(freightTotal + h + insuranceCost);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Premi Asuransi Kapal</span>
                  <input
                    type="number"
                    value={insuranceCost}
                    onChange={(e) => {
                      const ins = Number(e.target.value);
                      setInsuranceCost(ins);
                      setGrandTotal(freightTotal + handlingTotal + ins);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-400 font-mono"
                  />
                </div>

                <div className="bg-slate-900 p-2 rounded-xl border border-cyan-500/30 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">Grand Total Tagihan</span>
                  <span className="text-base font-extrabold text-white font-mono">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Payment Status & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Pembayaran</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="Lunas">Lunas (Paid in Full)</option>
                    <option value="DP Dibayar">DP Dibayar (Down Payment)</option>
                    <option value="Belum Bayar">Belum Bayar (Unpaid)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Metode Pembayaran</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer (BCA/Mandiri/BRI)</option>
                    <option value="Letter of Credit (L/C)">Letter of Credit (L/C)</option>
                    <option value="Giro">Giro Bilyet</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Instruksi Khusus / Catatan Palka</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{editingBooking ? 'Simpan Perubahan B/L' : 'Terbitkan Booking & Kirim Notif WA'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Milestone / Status Progression Modal */}
      {isStatusModalOpen && statusTargetBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsStatusModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Update Status & Kirim Notifikasi</h3>
                <p className="text-xs text-slate-400 font-mono">{statusTargetBooking.blNumber}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateStatusConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status Baru</label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as BookingStatus)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  <option value="Confirmed">Confirmed (Booking Disetujui)</option>
                  <option value="Loading">Loading (Proses Pemuatan Dermaga)</option>
                  <option value="In Transit">In Transit (Kapal Berlayar di Laut)</option>
                  <option value="Arrived">Arrived (Kapal Tiba di Pelabuhan Tujuan)</option>
                  <option value="Delivered">Delivered (Bongkar Selesai / Diserahkan)</option>
                  <option value="Cancelled">Cancelled (Dibatalkan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lokasi Saat Ini</label>
                <input
                  type="text"
                  required
                  value={statusLocation}
                  onChange={(e) => setStatusLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pesan Keterangan Milestone</label>
                <textarea
                  rows={3}
                  required
                  value={statusDescription}
                  onChange={(e) => setStatusDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  WhatsApp otomatis akan dikirim ke <strong>+{statusTargetBooking.customerWhatsapp}</strong> ({statusTargetBooking.customerName}).
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25"
                >
                  Update & Kirim Notifikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingBooking}
        title="Hapus Transaksi Booking"
        message="Yakin ingin menghapus transaksi booking dan Surat Muatan Kapal (B/L) ini?"
        itemName={deletingBooking?.blNumber}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingBooking(null)}
      />
    </div>
  );
};
