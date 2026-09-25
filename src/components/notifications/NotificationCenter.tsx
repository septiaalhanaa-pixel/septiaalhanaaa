import React, { useState, useEffect } from 'react';
import { 
  BellRing, Send, MessageSquare, Mail, CheckCircle2, 
  ExternalLink, Search, RefreshCw, Smartphone, Ship, FileText 
} from 'lucide-react';
import { NotificationLog, Booking } from '../../types';
import { notificationService, bookingService } from '../../services/db';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');

  // Manual Dispatch Form
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [customMsg, setCustomMsg] = useState('');
  const [notifType, setNotifType] = useState<'whatsapp' | 'email'>('whatsapp');
  const [isSuccessSent, setIsSuccessSent] = useState(false);

  const loadData = () => {
    setNotifications(notificationService.getAll());
    const b = bookingService.getAll();
    setBookings(b);
    if (b.length > 0 && !selectedBookingId) {
      setSelectedBookingId(b[0].id);
      setCustomMsg(`Halo ${b[0].customerName}, muatan kargo Anda dengan No. B/L ${b[0].blNumber} pada kapal ${b[0].vesselName} saat ini berstatus ${b[0].status}.`);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBookingChange = (bkgId: string) => {
    setSelectedBookingId(bkgId);
    const b = bookings.find((item) => item.id === bkgId);
    if (b) {
      setCustomMsg(`Halo ${b.customerName}, pembaruan status terkini untuk muatan ${b.bookingNumber} (${b.blNumber}) pada armada ${b.vesselName}: Status saat ini [${b.status}]. Lacak realtime di peta satelit: https://nauticalog.app/track/${b.blNumber}`);
    }
  };

  const handleSendManual = (e: React.FormEvent) => {
    e.preventDefault();
    const b = bookings.find((item) => item.id === selectedBookingId);
    if (!b) return;

    const phone = b.customerWhatsapp || b.customerPhone || '6281200000000';
    const waUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(customMsg)}`;

    notificationService.create({
      recipientPhone: phone,
      recipientEmail: `${b.customerId}@client.id`,
      customerName: b.customerName,
      bookingNumber: b.bookingNumber,
      type: notifType,
      title: `🚢 Notifikasi Manual: Muatan ${b.bookingNumber}`,
      message: customMsg,
      status: 'delivered',
      directWhatsAppUrl: waUrl,
    });

    setIsSuccessSent(true);
    setTimeout(() => setIsSuccessSent(false), 3000);
    loadData();
  };

  const filtered = notifications.filter(
    (n) =>
      n.customerName.toLowerCase().includes(search.toLowerCase()) ||
      n.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BellRing className="w-7 h-7 text-cyan-400" />
            <span>Pusat Notifikasi Otomatis Pelanggan (WhatsApp & Email)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Sistem pengiriman pesan milestone otomatis (Booking Confirmed → Loading → Sailing → Arrived → Delivered) dengan tautan pelacakan GPS kapal.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <span>Segarkan Log</span>
        </button>
      </div>

      {/* Grid 2 Columns: Manual Dispatcher & Automated Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dispatcher Form (1 Col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" />
              <span>Kirim Notifikasi Pelanggan</span>
            </h3>
            <p className="text-xs text-slate-400">Kirim pemberitahuan langsung ke WhatsApp PIC Shipper</p>
          </div>

          {isSuccessSent && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Notifikasi berhasil diproses dan dikirim ke log WhatsApp!</span>
            </div>
          )}

          <form onSubmit={handleSendManual} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pilih Transaksi Muatan</label>
              <select
                value={selectedBookingId}
                onChange={(e) => handleBookingChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.blNumber} - {b.customerName} ({b.vesselName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Kanal Pengiriman</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNotifType('whatsapp')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    notifType === 'whatsapp'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Gateway
                </button>
                <button
                  type="button"
                  onClick={() => setNotifType('email')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    notifType === 'email'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Email Alert
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Isi Pesan Notifikasi</label>
              <textarea
                rows={5}
                required
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Sekarang</span>
            </button>
          </form>
        </div>

        {/* Right: Notification History Logs (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Riwayat Log Notifikasi Otomatis Terkirim</span>
              </h3>
              <p className="text-xs text-slate-400">Total {notifications.length} notifikasi tercatat di sistem</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari histori pesan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-950/80 border border-slate-800 hover:border-cyan-500/30 rounded-2xl transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> WhatsApp
                      </span>
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {item.bookingNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">({item.customerName})</span>
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1">{item.title}</h4>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-slate-500 block">{item.timestamp}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Delivered
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 whitespace-pre-line bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 leading-relaxed font-sans">
                  {item.message}
                </p>

                {item.directWhatsAppUrl && (
                  <div className="pt-1 flex justify-end">
                    <a
                      href={item.directWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 transition-colors"
                    >
                      <span>Buka Obrolan WhatsApp Langsung</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
