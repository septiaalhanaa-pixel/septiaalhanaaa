import React, { useState } from 'react';
import { 
  Printer, ArrowLeft, Download, ShieldCheck, 
  Ship, Anchor, QrCode, CheckCircle2, FileText, Send 
} from 'lucide-react';
import { Booking, Port, Vessel, Customer } from '../../types';
import { portService, vesselService, customerService } from '../../services/db';

interface BillOfLadingViewProps {
  booking: Booking;
  onBack: () => void;
}

export const BillOfLadingView: React.FC<BillOfLadingViewProps> = ({ booking, onBack }) => {
  const originPort = portService.getById(booking.originPortId);
  const destPort = portService.getById(booking.destinationPortId);
  const vessel = vesselService.getById(booking.vesselId);
  const customer = customerService.getById(booking.customerId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Controls (Hidden during print) */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Transaksi</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen B/L (Print / PDF)</span>
          </button>
        </div>
      </div>

      {/* Official Bill of Lading Document Container */}
      <div 
        id="printable-document" 
        className="bg-white text-slate-950 p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-300 font-sans relative overflow-hidden"
      >
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <Ship className="w-96 h-96 text-slate-900" />
        </div>

        {/* Header Letterhead */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center text-white font-bold shadow-md">
              <Ship className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                PT SAMUDERA LOGISTIK NUSANTARA
              </h1>
              <p className="text-xs font-medium text-slate-600 max-w-md">
                International & Domestic Ocean Freight Forwarding, Liner Agency & Marine Cargo Carrier
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Gedung Samudera Plaza Lt. 12, Jl. Maritim Raya No. 88, Tanjung Priok, Jakarta Utara | Telp: (021) 430-8899
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="px-3 py-1 bg-slate-100 border border-slate-300 rounded-lg inline-block text-xs font-mono font-bold text-slate-900">
              ORIGINAL BILL OF LADING
            </div>
            <div className="mt-2 text-sm font-extrabold text-slate-900 font-mono">
              NO: {booking.blNumber}
            </div>
            <div className="text-xs font-mono text-slate-500">
              REF: {booking.bookingNumber}
            </div>
          </div>
        </div>

        {/* 2-Column Parties Grid */}
        <div className="grid grid-cols-2 gap-4 border border-slate-400 mb-6 text-xs divide-x divide-slate-400">
          <div className="p-3 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 block">SHIPPER / PENGIRIM (NAME & ADDRESS)</span>
            <p className="font-bold text-slate-900 text-sm">{booking.customerName}</p>
            <p className="text-slate-700">{customer?.address || 'Alamat Terdaftar'}</p>
            <p className="text-slate-700">NPWP: {customer?.taxId || '-'}</p>
            <p className="text-slate-700 font-mono">PIC: {customer?.contactPerson} ({booking.customerPhone})</p>
          </div>

          <div className="p-3 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 block">CONSIGNEE / PENERIMA (TO THE ORDER OF)</span>
            <p className="font-bold text-slate-900 text-sm">{booking.customerName} (Branch / Depo)</p>
            <p className="text-slate-700">{destPort?.city || 'Pelabuhan Tujuan'}, Indonesia</p>
            <p className="text-slate-700">NOTIFY PARTY: Same as Consignee / Carrier Ops</p>
          </div>
        </div>

        {/* Vessel & Voyage Routing Grid */}
        <div className="grid grid-cols-4 gap-2 border border-slate-400 mb-6 text-xs divide-x divide-slate-400 bg-slate-50">
          <div className="p-2.5">
            <span className="text-[10px] font-bold text-slate-500 block">OCEAN VESSEL</span>
            <span className="font-bold text-slate-900 font-mono">{booking.vesselName}</span>
          </div>
          <div className="p-2.5">
            <span className="text-[10px] font-bold text-slate-500 block">PORT OF LOADING (POL)</span>
            <span className="font-bold text-slate-900">{originPort?.name || 'Tanjung Priok'}</span>
          </div>
          <div className="p-2.5">
            <span className="text-[10px] font-bold text-slate-500 block">PORT OF DISCHARGE (POD)</span>
            <span className="font-bold text-slate-900">{destPort?.name || 'Tanjung Perak'}</span>
          </div>
          <div className="p-2.5">
            <span className="text-[10px] font-bold text-slate-500 block">SAILING DATE (ETD)</span>
            <span className="font-bold text-slate-900 font-mono">{booking.departureDate}</span>
          </div>
        </div>

        {/* Cargo Items Table */}
        <div className="border border-slate-400 mb-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-200 border-b border-slate-400 font-bold text-slate-800 text-[10px] uppercase">
                <th className="p-2.5">Container No. / Seal No.</th>
                <th className="p-2.5">No. of Pkgs & Description of Goods</th>
                <th className="p-2.5 text-right">Gross Weight</th>
                <th className="p-2.5 text-right">Measurement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              <tr>
                <td className="p-3 align-top font-mono text-[11px]">
                  <div className="font-bold text-slate-900">
                    {booking.containerNumbers?.join(', ') || 'SMLU-882190 / SMLU-882191'}
                  </div>
                  <div className="text-slate-600 mt-1">
                    SEAL: {booking.sealNumbers?.join(', ') || 'SEAL-SL99812A'}
                  </div>
                </td>
                <td className="p-3 align-top">
                  <div className="font-bold text-slate-900 text-sm">{booking.commodityName}</div>
                  <div className="text-slate-600 mt-1">
                    Kategori: {booking.cargoCategory} • {booking.quantity} {booking.quantityUnit}
                  </div>
                  {booking.notes && (
                    <div className="text-[11px] text-slate-500 mt-1 italic">
                      Notes: {booking.notes}
                    </div>
                  )}
                </td>
                <td className="p-3 align-top text-right font-mono font-bold text-slate-900">
                  {booking.grossWeightTon.toLocaleString('id-ID')} MT (Metric Ton)
                </td>
                <td className="p-3 align-top text-right font-mono font-bold text-slate-900">
                  {booking.volumeCBM} CBM (m³)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Freight & Charges Breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">FREIGHT CHARGES & TERMS</span>
            <div className="flex justify-between">
              <span>Freight Rate:</span>
              <span className="font-mono">Rp {booking.freightTotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Terminal Handling Charge (THC):</span>
              <span className="font-mono">Rp {booking.handlingTotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Marine Cargo Insurance:</span>
              <span className="font-mono">Rp {booking.insuranceCost.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t border-slate-300 text-slate-900">
              <span>GRAND TOTAL PREPAID:</span>
              <span className="font-mono text-sm">Rp {booking.grandTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">STATUS VERIFIKASI RESMI</span>
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>CLEAN ON BOARD - VERIFIED</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Pindai QR untuk melacak posisi kapal & manifest muatan realtime di portal AIS.
              </p>
            </div>
            <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg p-1 flex items-center justify-center shrink-0">
              <QrCode className="w-14 h-14 text-slate-900" />
            </div>
          </div>
        </div>

        {/* Signatures & Seal Section */}
        <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-slate-900 text-xs text-center">
          <div className="space-y-12">
            <p className="font-bold text-slate-700">Shipper / Pengirim</p>
            <div className="pt-2 border-t border-slate-400 font-semibold text-slate-900">
              ( {customer?.contactPerson || 'Authorized Signatory'} )
            </div>
          </div>

          <div className="space-y-12">
            <p className="font-bold text-slate-700">Nakhoda Kapal (Master of Vessel)</p>
            <div className="pt-2 border-t border-slate-400 font-semibold text-slate-900">
              ( {vessel?.captain || 'Capt. Bambang Suryono'} )
            </div>
          </div>

          <div className="space-y-12">
            <p className="font-bold text-slate-700">For the Carrier / As Agent</p>
            <div className="pt-2 border-t border-slate-400 font-semibold text-slate-900">
              ( PT Samudera Logistik Nusantara )
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-8 pt-4 border-t border-slate-300 text-[9px] text-slate-500 leading-tight text-justify">
          IN WITNESS WHEREOF the Master or Agent of said vessel hath signed 3 (three) original Bills of Lading, all of this tenor and date, one of which being accomplished, the others to stand void. Subject to The Hague-Visby Rules and standard terms and conditions of maritime carriage.
        </div>
      </div>
    </div>
  );
};
