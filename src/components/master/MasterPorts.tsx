import React, { useState, useEffect } from 'react';
import { Anchor, Plus, Edit2, Trash2, Search, MapPin, X, Phone, Building } from 'lucide-react';
import { Port } from '../../types';
import { portService } from '../../services/db';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

export const MasterPorts: React.FC = () => {
  const [ports, setPorts] = useState<Port[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [deletingPort, setDeletingPort] = useState<Port | null>(null);

  // Form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('Indonesia');
  const [lat, setLat] = useState<number>(-6.1006);
  const [lng, setLng] = useState<number>(106.8833);
  const [berthCapacity, setBerthCapacity] = useState<number>(20);
  const [maxDraftMeters, setMaxDraftMeters] = useState<number>(13.5);
  const [craneCount, setCraneCount] = useState<number>(24);
  const [operationalHours, setOperationalHours] = useState('24 Jam / 7 Hari');
  const [contactPhone, setContactPhone] = useState('+62-');
  const [status, setStatus] = useState<Port['status']>('Operasional');

  const loadData = () => {
    setPorts(portService.getAll());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingPort(null);
    setCode('ID');
    setName('');
    setCity('');
    setProvince('');
    setCountry('Indonesia');
    setLat(-6.0);
    setLng(107.0);
    setBerthCapacity(16);
    setMaxDraftMeters(12.0);
    setCraneCount(18);
    setOperationalHours('24 Jam / 7 Hari');
    setContactPhone('+62-');
    setStatus('Operasional');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Port) => {
    setEditingPort(p);
    setCode(p.code);
    setName(p.name);
    setCity(p.city);
    setProvince(p.province);
    setCountry(p.country);
    setLat(p.coordinates[0]);
    setLng(p.coordinates[1]);
    setBerthCapacity(p.berthCapacity);
    setMaxDraftMeters(p.maxDraftMeters);
    setCraneCount(p.craneCount);
    setOperationalHours(p.operationalHours);
    setContactPhone(p.contactPhone);
    setStatus(p.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    const payload = {
      code: code.trim().toUpperCase(),
      name,
      city,
      province,
      country,
      coordinates: [Number(lat), Number(lng)] as [number, number],
      berthCapacity: Number(berthCapacity),
      maxDraftMeters: Number(maxDraftMeters),
      craneCount: Number(craneCount),
      operationalHours,
      contactPhone,
      status,
    };

    if (editingPort) {
      portService.update(editingPort.id, payload);
    } else {
      portService.create(payload);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteConfirm = () => {
    if (deletingPort) {
      portService.delete(deletingPort.id);
      setDeletingPort(null);
      loadData();
    }
  };

  const filteredPorts = ports.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Anchor className="w-7 h-7 text-amber-400" />
            <span>Master Data Pelabuhan & Terminal Petikemas</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Daftar pelabuhan bongkar muat, kapasitas dermaga, kedalaman draft (m), crane STS, dan kontak otoritas pelabuhan.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Pelabuhan</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama pelabuhan, kode UN/LOCODE (e.g. IDTPK), atau kota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPorts.map((port) => (
          <div
            key={port.id}
            className="p-5 bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl shadow-xl transition-all flex flex-col justify-between group space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {port.code}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  port.status === 'Operasional'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {port.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                {port.name}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{port.city}, {port.province}</span>
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Dermaga</span>
                  <span className="text-xs font-bold text-white">{port.berthCapacity} Berth</span>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Max Draft</span>
                  <span className="text-xs font-bold text-cyan-400">{port.maxDraftMeters} m</span>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Crane STS</span>
                  <span className="text-xs font-bold text-white">{port.craneCount} Unit</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate max-w-[180px] font-mono text-[11px]">{port.contactPhone}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(port)}
                  className="p-1.5 bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-400 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeletingPort(port)}
                  className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit */}
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
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Anchor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingPort ? 'Edit Data Pelabuhan' : 'Tambah Pelabuhan Baru'}
                </h3>
                <p className="text-xs text-slate-400">Kelola detail infrastruktur pelabuhan maritim</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kode UN/LOCODE *</label>
                  <input
                    type="text"
                    required
                    placeholder="IDTPK"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Operasional</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="Operasional">Operasional</option>
                    <option value="Padat / Congested">Padat / Congested</option>
                    <option value="Perbaikan / Maintenance">Perbaikan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Pelabuhan *</label>
                <input
                  type="text"
                  required
                  placeholder="Pelabuhan Tanjung Priok"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kota</label>
                  <input
                    type="text"
                    placeholder="Jakarta Utara"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Provinsi</label>
                  <input
                    type="text"
                    placeholder="DKI Jakarta"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Dermaga</label>
                  <input
                    type="number"
                    value={berthCapacity}
                    onChange={(e) => setBerthCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Draft (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={maxDraftMeters}
                    onChange={(e) => setMaxDraftMeters(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Crane STS</label>
                  <input
                    type="number"
                    value={craneCount}
                    onChange={(e) => setCraneCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kontak Otoritas</label>
                <input
                  type="text"
                  placeholder="+62-21-4301080"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
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
                  className="px-6 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-xl shadow-lg shadow-amber-500/25"
                >
                  {editingPort ? 'Simpan Perubahan' : 'Tambah Pelabuhan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingPort}
        title="Hapus Data Pelabuhan"
        message="Yakin ingin menghapus data pelabuhan ini?"
        itemName={deletingPort?.name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingPort(null)}
      />
    </div>
  );
};
