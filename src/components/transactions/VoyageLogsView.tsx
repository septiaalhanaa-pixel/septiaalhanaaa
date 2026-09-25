import React, { useState, useEffect } from 'react';
import { 
  Compass, Plus, Edit2, Trash2, Search, Ship, 
  Wind, Droplets, Gauge, AlertCircle, MapPin, X, CheckCircle2 
} from 'lucide-react';
import { VoyageLog, Vessel, Port, Route } from '../../types';
import { voyageService, vesselService, portService, routeService } from '../../services/db';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface VoyageLogsViewProps {
  onOpenMap?: (vesselId?: string) => void;
}

export const VoyageLogsView: React.FC<VoyageLogsViewProps> = ({ onOpenMap }) => {
  const [voyages, setVoyages] = useState<VoyageLog[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoyage, setEditingVoyage] = useState<VoyageLog | null>(null);
  const [deletingVoyage, setDeletingVoyage] = useState<VoyageLog | null>(null);

  // Form
  const [voyageNumber, setVoyageNumber] = useState('');
  const [vesselId, setVesselId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [originPortId, setOriginPortId] = useState('');
  const [destinationPortId, setDestinationPortId] = useState('');
  const [etd, setEtd] = useState('');
  const [eta, setEta] = useState('');
  const [currentLat, setCurrentLat] = useState<number>(-5.62);
  const [currentLng, setCurrentLng] = useState<number>(108.95);
  const [heading, setHeading] = useState<number>(105);
  const [speedKnots, setSpeedKnots] = useState<number>(16.4);
  const [distanceTraveledNM, setDistanceTraveledNM] = useState<number>(180);
  const [totalDistanceNM, setTotalDistanceNM] = useState<number>(410);
  const [fuelConsumptionLiters, setFuelConsumptionLiters] = useState<number>(6930);
  const [weatherCondition, setWeatherCondition] = useState<VoyageLog['weatherCondition']>('Cerah Berawan');
  const [seaStateBft, setSeaStateBft] = useState<number>(3);
  const [engineRpm, setEngineRpm] = useState<number>(102);
  const [status, setStatus] = useState<VoyageLog['status']>('Sailing');
  const [captainReport, setCaptainReport] = useState('');

  const loadData = () => {
    setVoyages(voyageService.getAll());
    setVessels(vesselService.getAll());
    setPorts(portService.getAll());
    setRoutes(routeService.getAll());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingVoyage(null);
    setVoyageNumber(`VOY-2026-${(voyages.length + 1).toString().padStart(2, '0')}A`);
    setVesselId(vessels[0]?.id || '');
    setRouteId(routes[0]?.id || '');
    setOriginPortId(ports[0]?.id || '');
    setDestinationPortId(ports[1]?.id || '');
    setEtd('2026-09-25 08:00');
    setEta('2026-09-26 10:00');
    setCurrentLat(-5.62);
    setCurrentLng(108.95);
    setHeading(90);
    setSpeedKnots(15.5);
    setDistanceTraveledNM(100);
    setTotalDistanceNM(410);
    setFuelConsumptionLiters(3500);
    setWeatherCondition('Cerah Berawan');
    setSeaStateBft(3);
    setEngineRpm(100);
    setStatus('Sailing');
    setCaptainReport('Pelayaran lancar, navigasi alur laut aman terkendali.');
    setIsModalOpen(true);
  };

  const openEditModal = (v: VoyageLog) => {
    setEditingVoyage(v);
    setVoyageNumber(v.voyageNumber);
    setVesselId(v.vesselId);
    setRouteId(v.routeId);
    setOriginPortId(v.originPortId);
    setDestinationPortId(v.destinationPortId);
    setEtd(v.etd);
    setEta(v.eta);
    setCurrentLat(v.currentLat);
    setCurrentLng(v.currentLng);
    setHeading(v.heading);
    setSpeedKnots(v.speedKnots);
    setDistanceTraveledNM(v.distanceTraveledNM);
    setTotalDistanceNM(v.totalDistanceNM);
    setFuelConsumptionLiters(v.fuelConsumptionLiters);
    setWeatherCondition(v.weatherCondition);
    setSeaStateBft(v.seaStateBft);
    setEngineRpm(v.engineRpm);
    setStatus(v.status);
    setCaptainReport(v.captainReport || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const ves = vessels.find((v) => v.id === vesselId);
    const payload = {
      voyageNumber,
      vesselId,
      vesselName: ves?.name || 'MV Samudera Perkasa',
      routeId,
      originPortId,
      destinationPortId,
      etd,
      eta,
      currentLat: Number(currentLat),
      currentLng: Number(currentLng),
      heading: Number(heading),
      speedKnots: Number(speedKnots),
      distanceTraveledNM: Number(distanceTraveledNM),
      totalDistanceNM: Number(totalDistanceNM),
      fuelConsumptionLiters: Number(fuelConsumptionLiters),
      weatherCondition,
      seaStateBft: Number(seaStateBft),
      engineRpm: Number(engineRpm),
      status,
      captainReport,
    };

    if (editingVoyage) {
      voyageService.update(editingVoyage.id, payload);
    } else {
      voyageService.create(payload);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteConfirm = () => {
    if (deletingVoyage) {
      voyageService.delete(deletingVoyage.id);
      setDeletingVoyage(null);
      loadData();
    }
  };

  const filtered = voyages.filter(
    (v) =>
      v.voyageNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.vesselName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-cyan-400" />
            <span>Log Perjalanan Pelayaran & Telemetri AIS</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Riwayat log pelayaran kapal, nautical miles jelajah, RPM mesin, cuaca laut (Beaufort scale), dan konsumsi bahan bakar bunker.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Log Voyage Baru</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari voyage number (e.g. VOY-2026-091A) atau nama kapal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((voy) => {
          const orig = ports.find((p) => p.id === voy.originPortId);
          const dest = ports.find((p) => p.id === voy.destinationPortId);
          const progressPct = Math.min(100, Math.round((voy.distanceTraveledNM / (voy.totalDistanceNM || 1)) * 100));

          return (
            <div
              key={voy.id}
              className="p-5 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-3xl shadow-xl transition-all flex flex-col justify-between group space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {voy.voyageNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {voy.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {voy.vesselName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {orig?.name?.split(' ')[1] || 'Origin'} → {dest?.name?.split(' ')[1] || 'Dest'}
                </p>

                {/* Progress Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Progres Nautical:</span>
                    <span className="font-mono font-bold text-white">
                      {voy.distanceTraveledNM} / {voy.totalDistanceNM} NM ({progressPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-cyan-500 h-full rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">SOG Speed</span>
                    <span className="font-mono font-bold text-white">{voy.speedKnots} Kts</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Engine RPM</span>
                    <span className="font-mono font-bold text-blue-400">{voy.engineRpm}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">BBM Terpakai</span>
                    <span className="font-mono font-bold text-amber-400">{voy.fuelConsumptionLiters} L</span>
                  </div>
                </div>

                <div className="mt-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  <span className="font-bold text-slate-400 block text-[10px]">Cuaca & Status Laut:</span>
                  <span>{voy.weatherCondition} (Beaufort {voy.seaStateBft})</span>
                  {voy.captainReport && (
                    <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-2">
                      "{voy.captainReport}"
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[10px] font-mono">Updated: {voy.updatedAt}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(voy)}
                    className="p-1.5 bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-400 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingVoyage(voy)}
                    className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingVoyage ? 'Edit Log Pelayaran' : 'Catat Log Pelayaran Baru'}
                </h3>
                <p className="text-xs text-slate-400">Pembaruan telemetri AIS dan kondisi operasional kapal</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Voyage Number *</label>
                  <input
                    type="text"
                    required
                    value={voyageNumber}
                    onChange={(e) => setVoyageNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kapal Armada *</label>
                  <select
                    value={vesselId}
                    onChange={(e) => setVesselId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    {vessels.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kecepatan (Kts)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={speedKnots}
                    onChange={(e) => setSpeedKnots(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Engine RPM</label>
                  <input
                    type="number"
                    value={engineRpm}
                    onChange={(e) => setEngineRpm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Konsumsi BBM (L)</label>
                  <input
                    type="number"
                    value={fuelConsumptionLiters}
                    onChange={(e) => setFuelConsumptionLiters(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kondisi Cuaca BMKG</label>
                  <select
                    value={weatherCondition}
                    onChange={(e) => setWeatherCondition(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="Cerah Berawan">Cerah Berawan</option>
                    <option value="Hujan Ringan">Hujan Ringan</option>
                    <option value="Gelombang Tinggi (2.5m)">Gelombang Tinggi (2.5m)</option>
                    <option value="Badai / Ombak Ekstrem">Badai / Ombak Ekstrem</option>
                    <option value="Tenang">Tenang</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Pelayaran</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="Sailing">Sailing (Berlayar)</option>
                    <option value="Docking">Docking (Sandar)</option>
                    <option value="Arrived">Arrived (Tiba)</option>
                    <option value="Delayed">Delayed (Tertunda)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Laporan Singkat Nakhoda</label>
                <textarea
                  rows={2}
                  value={captainReport}
                  onChange={(e) => setCaptainReport(e.target.value)}
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
                  className="px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl shadow-lg shadow-cyan-500/25"
                >
                  {editingVoyage ? 'Simpan Log' : 'Simpan Log Pelayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deletingVoyage}
        title="Hapus Log Pelayaran"
        message="Yakin ingin menghapus catatan log pelayaran ini?"
        itemName={deletingVoyage?.voyageNumber}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingVoyage(null)}
      />
    </div>
  );
};
