import React, { useState, useEffect } from 'react';
import { 
  Ship, Plus, Edit2, Trash2, Search, Filter, 
  X, Check, AlertCircle, Anchor, Gauge, Droplets, 
  Calendar, FileDown 
} from 'lucide-react';
import { Vessel, VesselType, VesselStatus, Port, Route } from '../../types';
import { vesselService, portService, routeService } from '../../services/db';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

export const MasterVessels: React.FC = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [deletingVessel, setDeletingVessel] = useState<Vessel | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [callSign, setCallSign] = useState('');
  const [imoNumber, setImoNumber] = useState('');
  const [mmsi, setMmsi] = useState('');
  const [type, setType] = useState<VesselType>('Container');
  const [capacityTEU, setCapacityTEU] = useState<number>(2500);
  const [capacityDWT, setCapacityDWT] = useState<number>(35000);
  const [yearBuilt, setYearBuilt] = useState<number>(2020);
  const [speedKnots, setSpeedKnots] = useState<number>(15.0);
  const [maxSpeedKnots, setMaxSpeedKnots] = useState<number>(20.0);
  const [status, setStatus] = useState<VesselStatus>('Underway');
  const [currentLat, setCurrentLat] = useState<number>(-5.62);
  const [currentLng, setCurrentLng] = useState<number>(108.95);
  const [heading, setHeading] = useState<number>(90);
  const [currentPortId, setCurrentPortId] = useState<string>('');
  const [destinationPortId, setDestinationPortId] = useState<string>('');
  const [currentRouteId, setCurrentRouteId] = useState<string>('');
  const [captain, setCaptain] = useState('');
  const [crewCount, setCrewCount] = useState<number>(20);
  const [fuelLevelPct, setFuelLevelPct] = useState<number>(85);
  const [fuelBunkerType, setFuelBunkerType] = useState<'MGO' | 'HFO' | 'VLSFO' | 'LNG'>('VLSFO');
  const [fuelConsumptionPerNM, setFuelConsumptionPerNM] = useState<number>(35);
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState('2026-12-01');
  const [notes, setNotes] = useState('');

  const loadData = () => {
    setVessels(vesselService.getAll());
    setPorts(portService.getAll());
    setRoutes(routeService.getAll());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingVessel(null);
    setName('');
    setCallSign('PK-');
    setImoNumber('9' + Math.floor(100000 + Math.random() * 900000));
    setMmsi('5250' + Math.floor(10000 + Math.random() * 90000));
    setType('Container');
    setCapacityTEU(2400);
    setCapacityDWT(32000);
    setYearBuilt(2021);
    setSpeedKnots(16.0);
    setMaxSpeedKnots(21.0);
    setStatus('Underway');
    setCurrentLat(-6.1006);
    setCurrentLng(106.8833);
    setHeading(90);
    setCurrentPortId(ports[0]?.id || '');
    setDestinationPortId(ports[1]?.id || '');
    setCurrentRouteId(routes[0]?.id || '');
    setCaptain('Capt. ');
    setCrewCount(22);
    setFuelLevelPct(90);
    setFuelBunkerType('VLSFO');
    setFuelConsumptionPerNM(34);
    setNextMaintenanceDate('2027-01-15');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vessel) => {
    setEditingVessel(v);
    setName(v.name);
    setCallSign(v.callSign);
    setImoNumber(v.imoNumber);
    setMmsi(v.mmsi);
    setType(v.type);
    setCapacityTEU(v.capacityTEU);
    setCapacityDWT(v.capacityDWT);
    setYearBuilt(v.yearBuilt);
    setSpeedKnots(v.speedKnots);
    setMaxSpeedKnots(v.maxSpeedKnots);
    setStatus(v.status);
    setCurrentLat(v.currentLat);
    setCurrentLng(v.currentLng);
    setHeading(v.heading);
    setCurrentPortId(v.currentPortId || '');
    setDestinationPortId(v.destinationPortId || '');
    setCurrentRouteId(v.currentRouteId || '');
    setCaptain(v.captain);
    setCrewCount(v.crewCount);
    setFuelLevelPct(v.fuelLevelPct);
    setFuelBunkerType(v.fuelBunkerType);
    setFuelConsumptionPerNM(v.fuelConsumptionPerNM);
    setNextMaintenanceDate(v.nextMaintenanceDate);
    setNotes(v.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !imoNumber.trim()) return;

    const payload = {
      name,
      callSign,
      imoNumber,
      mmsi,
      type,
      capacityTEU: Number(capacityTEU),
      capacityDWT: Number(capacityDWT),
      yearBuilt: Number(yearBuilt),
      speedKnots: Number(speedKnots),
      maxSpeedKnots: Number(maxSpeedKnots),
      status,
      currentLat: Number(currentLat),
      currentLng: Number(currentLng),
      heading: Number(heading),
      currentPortId: currentPortId || undefined,
      destinationPortId: destinationPortId || undefined,
      currentRouteId: currentRouteId || undefined,
      captain,
      crewCount: Number(crewCount),
      fuelLevelPct: Number(fuelLevelPct),
      fuelBunkerType,
      fuelConsumptionPerNM: Number(fuelConsumptionPerNM),
      nextMaintenanceDate,
      notes,
    };

    if (editingVessel) {
      vesselService.update(editingVessel.id, payload);
    } else {
      vesselService.create(payload);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteConfirm = () => {
    if (deletingVessel) {
      vesselService.delete(deletingVessel.id);
      setDeletingVessel(null);
      loadData();
    }
  };

  // Filtered List
  const filteredVessels = vessels.filter((v) => {
    const matchSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.imoNumber.includes(search) ||
      v.callSign.toLowerCase().includes(search.toLowerCase()) ||
      v.captain.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || v.type === filterType;
    const matchStatus = filterStatus === 'all' || v.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Ship className="w-7 h-7 text-cyan-400" />
              <span>Master Data Armada & Kapal Niaga</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {vessels.length} Kapal Terdaftar
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kelola spesifikasi teknis kapal, kapasitas TEU/DWT, nomor IMO/MMSI, konsumsi bunker, dan jadwal docking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Kapal Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama kapal, IMO, Call Sign, atau nama nakhoda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 outline-none"
          >
            <option value="all">Semua Tipe Kapal</option>
            <option value="Container">Kapal Kontainer</option>
            <option value="Bulk Carrier">Curah Kering (Bulk)</option>
            <option value="Tanker">Kapal Tanker (Liquid)</option>
            <option value="LCT">Landing Craft Tank (LCT)</option>
            <option value="Ro-Ro">Ro-Ro Ferry</option>
            <option value="Tug & Barge">Tug & Barge</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="Underway">Underway (Berlayar)</option>
            <option value="In Port">In Port (Dermaga)</option>
            <option value="Loading">Loading (Pemuatan)</option>
            <option value="At Anchor">At Anchor (Labuh)</option>
            <option value="Maintenance">Maintenance (Docking)</option>
          </select>
        </div>
      </div>

      {/* Vessels Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Nama Kapal & Identitas</th>
                <th className="py-3.5 px-4">Tipe & Kapasitas</th>
                <th className="py-3.5 px-4">Spesifikasi Mesin</th>
                <th className="py-3.5 px-4">Bunker BBM</th>
                <th className="py-3.5 px-4">Nakhoda & Awak</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi CRUD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredVessels.map((ves) => (
                <tr key={ves.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white group-hover:text-cyan-300 transition-colors text-sm">
                      {ves.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      IMO: <span className="text-cyan-400">{ves.imoNumber}</span> | Call Sign: {ves.callSign}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">MMSI: {ves.mmsi}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {ves.type}
                    </span>
                    <div className="mt-1 font-semibold text-slate-200">
                      {ves.capacityTEU > 0 ? `${ves.capacityTEU} TEU` : `${ves.capacityDWT.toLocaleString('id-ID')} DWT`}
                    </div>
                    <div className="text-[10px] text-slate-400">Tahun: {ves.yearBuilt}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-white">{ves.speedKnots} Knots</div>
                    <div className="text-[10px] text-slate-400">Maks: {ves.maxSpeedKnots} Knots</div>
                    <div className="text-[10px] text-slate-400">Konsumsi: {ves.fuelConsumptionPerNM} L/NM</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white font-bold">{ves.fuelLevelPct}%</span>
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${ves.fuelLevelPct < 30 ? 'bg-red-400' : 'bg-amber-400'}`}
                          style={{ width: `${ves.fuelLevelPct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400">Tipe: {ves.fuelBunkerType}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{ves.captain}</div>
                    <div className="text-[10px] text-slate-400">{ves.crewCount} Awak Kapal</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      ves.status === 'Underway'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : ves.status === 'In Port'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {ves.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(ves)}
                        className="p-1.5 bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-400 rounded-lg transition-colors"
                        title="Edit Data Kapal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingVessel(ves)}
                        className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition-colors"
                        title="Hapus Kapal"
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

      {/* Add / Edit Vessel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Ship className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingVessel ? 'Edit Data Kapal Niaga' : 'Tambah Armada Kapal Baru'}
                </h3>
                <p className="text-xs text-slate-400">Masukkan spesifikasi lengkap armada maritim</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Kapal *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MV Samudera Perkasa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipe Kapal *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as VesselType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="Container">Kapal Kontainer (Container)</option>
                    <option value="Bulk Carrier">Curah Kering (Bulk Carrier)</option>
                    <option value="Tanker">Kapal Tanker (Liquid CPO/Oil)</option>
                    <option value="LCT">Landing Craft Tank (LCT)</option>
                    <option value="Ro-Ro">Ro-Ro Ferry</option>
                    <option value="Tug & Barge">Tug & Barge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">IMO Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="9482104"
                    value={imoNumber}
                    onChange={(e) => setImoNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Call Sign & MMSI</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="PKSP-901"
                      value={callSign}
                      onChange={(e) => setCallSign(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                    />
                    <input
                      type="text"
                      placeholder="525008912"
                      value={mmsi}
                      onChange={(e) => setMmsi(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kapasitas TEU / DWT</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="TEU"
                      value={capacityTEU}
                      onChange={(e) => setCapacityTEU(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="DWT"
                      value={capacityDWT}
                      onChange={(e) => setCapacityDWT(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kecepatan Jelajah (Knots)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Speed"
                      value={speedKnots}
                      onChange={(e) => setSpeedKnots(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Max"
                      value={maxSpeedKnots}
                      onChange={(e) => setMaxSpeedKnots(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nakhoda & Awak</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Nama Nakhoda"
                      value={captain}
                      onChange={(e) => setCaptain(e.target.value)}
                      className="col-span-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="ABK"
                      value={crewCount}
                      onChange={(e) => setCrewCount(Number(e.target.value))}
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bunker BBM & Konsumsi</label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={fuelBunkerType}
                      onChange={(e) => setFuelBunkerType(e.target.value as any)}
                      className="px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    >
                      <option value="VLSFO">VLSFO</option>
                      <option value="MGO">MGO</option>
                      <option value="HFO">HFO</option>
                      <option value="LNG">LNG</option>
                    </select>
                    <input
                      type="number"
                      placeholder="BBM %"
                      value={fuelLevelPct}
                      onChange={(e) => setFuelLevelPct(Number(e.target.value))}
                      className="px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="L/NM"
                      value={fuelConsumptionPerNM}
                      onChange={(e) => setFuelConsumptionPerNM(Number(e.target.value))}
                      className="px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Operasi</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VesselStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="Underway">Underway (Berlayar)</option>
                    <option value="In Port">In Port (Dermaga)</option>
                    <option value="Loading">Loading (Pemuatan)</option>
                    <option value="At Anchor">At Anchor (Labuh)</option>
                    <option value="Maintenance">Maintenance (Docking)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Jadwal Docking</label>
                  <input
                    type="date"
                    value={nextMaintenanceDate}
                    onChange={(e) => setNextMaintenanceDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan Teknis Nakhoda</label>
                <textarea
                  rows={2}
                  placeholder="Catatan kondisi mesin, muatan khusus, atau riwayat sertifikasi..."
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
                  className="px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl shadow-lg shadow-cyan-500/25"
                >
                  {editingVessel ? 'Simpan Perubahan' : 'Tambah Kapal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingVessel}
        title="Hapus Data Kapal"
        message="Apakah Anda yakin ingin menghapus data kapal ini dari master data armada? Data transaksi terkait tetap tersimpan di riwayat."
        itemName={deletingVessel?.name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingVessel(null)}
      />
    </div>
  );
};
