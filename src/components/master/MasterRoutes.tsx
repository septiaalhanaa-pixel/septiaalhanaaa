import React, { useState, useEffect } from 'react';
import { Navigation, Plus, Edit2, Trash2, Search, ArrowRight, Clock, DollarSign, X } from 'lucide-react';
import { Route, Port } from '../../types';
import { routeService, portService } from '../../services/db';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

export const MasterRoutes: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [deletingRoute, setDeletingRoute] = useState<Route | null>(null);

  // Form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [originPortId, setOriginPortId] = useState('');
  const [destinationPortId, setDestinationPortId] = useState('');
  const [distanceNM, setDistanceNM] = useState<number>(450);
  const [estimatedHours, setEstimatedHours] = useState<number>(28);
  const [baseRatePerTEU, setBaseRatePerTEU] = useState<number>(4500000);
  const [baseRatePerTon, setBaseRatePerTon] = useState<number>(250000);
  const [status, setStatus] = useState<Route['status']>('Aktif');

  const loadData = () => {
    setRoutes(routeService.getAll());
    setPorts(portService.getAll());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingRoute(null);
    setCode(`RT-${(routes.length + 1).toString().padStart(3, '0')}`);
    setOriginPortId(ports[0]?.id || '');
    setDestinationPortId(ports[1]?.id || '');
    setName('');
    setDistanceNM(420);
    setEstimatedHours(26);
    setBaseRatePerTEU(5000000);
    setBaseRatePerTon(260000);
    setStatus('Aktif');
    setIsModalOpen(true);
  };

  const openEditModal = (r: Route) => {
    setEditingRoute(r);
    setCode(r.code);
    setName(r.name);
    setOriginPortId(r.originPortId);
    setDestinationPortId(r.destinationPortId);
    setDistanceNM(r.distanceNM);
    setEstimatedHours(r.estimatedHours);
    setBaseRatePerTEU(r.baseRatePerTEU);
    setBaseRatePerTon(r.baseRatePerTon);
    setStatus(r.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const orig = ports.find((p) => p.id === originPortId);
    const dest = ports.find((p) => p.id === destinationPortId);
    const autoName = name.trim() || `${orig?.name || 'Origin'} ⇄ ${dest?.name || 'Destination'}`;

    const waypoints: [number, number][] = [
      orig?.coordinates || [-6.1, 106.8],
      [
        ((orig?.coordinates[0] || -6) + (dest?.coordinates[0] || -7)) / 2,
        ((orig?.coordinates[1] || 106) + (dest?.coordinates[1] || 112)) / 2,
      ],
      dest?.coordinates || [-7.2, 112.7],
    ];

    const payload = {
      code,
      name: autoName,
      originPortId,
      destinationPortId,
      distanceNM: Number(distanceNM),
      estimatedHours: Number(estimatedHours),
      waypoints,
      baseRatePerTEU: Number(baseRatePerTEU),
      baseRatePerTon: Number(baseRatePerTon),
      status,
    };

    if (editingRoute) {
      routeService.update(editingRoute.id, payload);
    } else {
      routeService.create(payload);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteConfirm = () => {
    if (deletingRoute) {
      routeService.delete(deletingRoute.id);
      setDeletingRoute(null);
      loadData();
    }
  };

  const filtered = routes.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Navigation className="w-7 h-7 text-cyan-400" />
            <span>Master Data Rute Pelayaran & Sea Lanes</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Konfigurasi rute laut (ALKI), jarak mil laut (Nautical Miles), estimasi waktu tempuh (transit time), dan tarif dasar freight.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Rute Baru</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari rute pelayaran atau kode (e.g. RT-001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((route) => {
          const orig = ports.find((p) => p.id === route.originPortId);
          const dest = ports.find((p) => p.id === route.destinationPortId);
          return (
            <div
              key={route.id}
              className="p-5 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-3xl shadow-xl transition-all flex flex-col justify-between group space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {route.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {route.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {route.name}
                </h3>

                <div className="mt-3 flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Origin Port</span>
                    <span className="font-semibold text-white">{orig?.name || 'Asal'}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Destination Port</span>
                    <span className="font-semibold text-cyan-300">{dest?.name || 'Tujuan'}</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Jarak Nautical</span>
                    <span className="font-mono font-bold text-white">{route.distanceNM} NM</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Transit Time</span>
                    <span className="font-mono font-bold text-cyan-400">~{route.estimatedHours} Jam</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Tarif / TEU</span>
                    <span className="font-mono font-bold text-emerald-400">
                      Rp {(route.baseRatePerTEU / 1000000).toFixed(1)} Jt
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Tarif Curah: Rp {route.baseRatePerTon.toLocaleString('id-ID')}/Ton</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(route)}
                    className="p-1.5 bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-400 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingRoute(route)}
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
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingRoute ? 'Edit Rute Pelayaran' : 'Tambah Rute Baru'}
                </h3>
                <p className="text-xs text-slate-400">Konfigurasi alur laut dan tarif dasar pengiriman</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kode Rute *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Rute</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                    <option value="Waspada Cuaca">Waspada Cuaca</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Rute (Opsional)</label>
                <input
                  type="text"
                  placeholder="Otomatis diisi dari Port Asal & Tujuan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pelabuhan Asal *</label>
                  <select
                    value={originPortId}
                    onChange={(e) => setOriginPortId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pelabuhan Tujuan *</label>
                  <select
                    value={destinationPortId}
                    onChange={(e) => setDestinationPortId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Jarak Mil Laut (NM)</label>
                  <input
                    type="number"
                    value={distanceNM}
                    onChange={(e) => setDistanceNM(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimasi Transit (Jam)</label>
                  <input
                    type="number"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tarif Dasar per TEU (Rp)</label>
                  <input
                    type="number"
                    value={baseRatePerTEU}
                    onChange={(e) => setBaseRatePerTEU(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tarif Dasar per Ton (Rp)</label>
                  <input
                    type="number"
                    value={baseRatePerTon}
                    onChange={(e) => setBaseRatePerTon(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                  />
                </div>
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
                  {editingRoute ? 'Simpan Perubahan' : 'Tambah Rute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deletingRoute}
        title="Hapus Data Rute Pelayaran"
        message="Yakin ingin menghapus rute pelayaran ini?"
        itemName={deletingRoute?.name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingRoute(null)}
      />
    </div>
  );
};
