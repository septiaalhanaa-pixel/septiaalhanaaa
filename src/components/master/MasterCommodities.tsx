import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, Search, Snowflake, AlertTriangle, DollarSign, X } from 'lucide-react';
import { Commodity, CargoCategory } from '../../types';
import { commodityService } from '../../services/db';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

export const MasterCommodities: React.FC = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Commodity | null>(null);
  const [deletingItem, setDeletingItem] = useState<Commodity | null>(null);

  // Form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CargoCategory>('Container FCL');
  const [unit, setUnit] = useState<Commodity['unit']>('TEU');
  const [tariffPerUnit, setTariffPerUnit] = useState<number>(4500000);
  const [handlingFee, setHandlingFee] = useState<number>(350000);
  const [insuranceRatePct, setInsuranceRatePct] = useState<number>(0.25);
  const [requiresReefer, setRequiresReefer] = useState(false);
  const [dangerousGoodsClass, setDangerousGoodsClass] = useState('-');
  const [description, setDescription] = useState('');

  const loadData = () => {
    setCommodities(commodityService.getAll());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setCode(`CMD-${Date.now().toString().slice(-4)}`);
    setName('');
    setCategory('Container FCL');
    setUnit('TEU');
    setTariffPerUnit(4500000);
    setHandlingFee(350000);
    setInsuranceRatePct(0.25);
    setRequiresReefer(false);
    setDangerousGoodsClass('-');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Commodity) => {
    setEditingItem(c);
    setCode(c.code);
    setName(c.name);
    setCategory(c.category);
    setUnit(c.unit);
    setTariffPerUnit(c.tariffPerUnit);
    setHandlingFee(c.handlingFee);
    setInsuranceRatePct(c.insuranceRatePct);
    setRequiresReefer(c.requiresReefer);
    setDangerousGoodsClass(c.dangerousGoodsClass || '-');
    setDescription(c.description || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const payload = {
      code,
      name,
      category,
      unit,
      tariffPerUnit: Number(tariffPerUnit),
      handlingFee: Number(handlingFee),
      insuranceRatePct: Number(insuranceRatePct),
      requiresReefer,
      dangerousGoodsClass,
      description,
    };

    if (editingItem) {
      commodityService.update(editingItem.id, payload);
    } else {
      commodityService.create(payload);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteConfirm = () => {
    if (deletingItem) {
      commodityService.delete(deletingItem.id);
      setDeletingItem(null);
      loadData();
    }
  };

  const filtered = commodities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-emerald-400" />
            <span>Master Komoditas & Skema Tarif Muatan</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Konfigurasi jenis muatan (FCL, Reefer, Curah Cair, Heavy Lift), tarif dasar per satuan, biaya handling, dan rate asuransi maritim.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Komoditas</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari komoditas, kategori kargo (e.g. Reefer, Semen, CPO)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-3xl shadow-xl transition-all flex flex-col justify-between group space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  {item.code}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {item.category}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                {item.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description || 'Tidak ada deskripsi spesifik.'}</p>

              <div className="mt-4 p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tarif / {item.unit}:</span>
                  <span className="font-mono font-bold text-white">
                    Rp {item.tariffPerUnit.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Handling Fee:</span>
                  <span className="font-mono text-slate-300">
                    Rp {item.handlingFee.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Asuransi Maritim:</span>
                  <span className="font-mono text-cyan-400">{item.insuranceRatePct}%</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                {item.requiresReefer && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <Snowflake className="w-3 h-3" /> Cold Chain / Reefer
                  </span>
                )}
                {item.dangerousGoodsClass && item.dangerousGoodsClass !== '-' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> IMO DG: {item.dangerousGoodsClass}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-1.5">
              <button
                onClick={() => openEditModal(item)}
                className="p-1.5 bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-400 rounded-lg transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeletingItem(item)}
                className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
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
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingItem ? 'Edit Komoditas & Tarif' : 'Tambah Komoditas Baru'}
                </h3>
                <p className="text-xs text-slate-400">Atur skema biaya dan penanganan kargo kapal</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kode Komoditas *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori Kargo</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Container FCL">Container FCL</option>
                    <option value="Container LCL">Container LCL</option>
                    <option value="Curah Kering (Bulk)">Curah Kering (Bulk)</option>
                    <option value="Curah Cair (Liquid)">Curah Cair (Liquid)</option>
                    <option value="Reefer / Pendingin">Reefer / Pendingin</option>
                    <option value="Kendaraan / Heavy Lift">Kendaraan / Heavy Lift</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Komoditas / Kargo *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Cold Storage Ikan Beku / Semen Curah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Satuan</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="TEU">TEU (20ft)</option>
                    <option value="FEU">FEU (40ft)</option>
                    <option value="Ton">Metric Ton</option>
                    <option value="CBM">CBM</option>
                    <option value="Unit">Unit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tarif Satuan (Rp)</label>
                  <input
                    type="number"
                    value={tariffPerUnit}
                    onChange={(e) => setTariffPerUnit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Handling (Rp)</label>
                  <input
                    type="number"
                    value={handlingFee}
                    onChange={(e) => setHandlingFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Asuransi Maritim (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={insuranceRatePct}
                    onChange={(e) => setInsuranceRatePct(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kelas Dangerous Goods</label>
                  <input
                    type="text"
                    placeholder="Class 3 / -"
                    value={dangerousGoodsClass}
                    onChange={(e) => setDangerousGoodsClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reeferCheck"
                  checked={requiresReefer}
                  onChange={(e) => setRequiresReefer(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="reeferCheck" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Memerlukan Soket Pendingin (Reefer Plug / Suhu -20°C)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deskripsi Tambahan</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
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
                  className="px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Komoditas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deletingItem}
        title="Hapus Data Komoditas"
        message="Yakin ingin menghapus skema komoditas & tarif ini?"
        itemName={deletingItem?.name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
};
