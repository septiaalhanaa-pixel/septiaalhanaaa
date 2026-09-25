import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Building2, Phone, Mail, MessageSquare, DollarSign, X } from 'lucide-react';
import { Customer } from '../../types';
import { customerService } from '../../services/db';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

export const MasterCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Form
  const [code, setCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('+62-');
  const [whatsapp, setWhatsapp] = useState('628');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [taxId, setTaxId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState<Customer['paymentTerms']>('Net 30 Days');
  const [creditLimit, setCreditLimit] = useState<number>(2000000000);
  const [status, setStatus] = useState<Customer['status']>('Aktif');

  const loadData = () => {
    setCustomers(customerService.getAll());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingCustomer(null);
    setCode(`CUST-${(customers.length + 1).toString().padStart(3, '0')}`);
    setCompanyName('');
    setContactPerson('');
    setPhone('+62-21-');
    setWhatsapp('6281');
    setEmail('');
    setAddress('');
    setCity('Jakarta');
    setTaxId('');
    setPaymentTerms('Net 30 Days');
    setCreditLimit(1500000000);
    setStatus('Aktif');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setCode(c.code);
    setCompanyName(c.companyName);
    setContactPerson(c.contactPerson);
    setPhone(c.phone);
    setWhatsapp(c.whatsapp);
    setEmail(c.email);
    setAddress(c.address);
    setCity(c.city);
    setTaxId(c.taxId);
    setPaymentTerms(c.paymentTerms);
    setCreditLimit(c.creditLimit);
    setStatus(c.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactPerson.trim()) return;

    const payload = {
      code,
      companyName,
      contactPerson,
      phone,
      whatsapp,
      email,
      address,
      city,
      taxId,
      paymentTerms,
      creditLimit: Number(creditLimit),
      status,
    };

    if (editingCustomer) {
      customerService.update(editingCustomer.id, payload);
    } else {
      customerService.create(payload);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteConfirm = () => {
    if (deletingCustomer) {
      customerService.delete(deletingCustomer.id);
      setDeletingCustomer(null);
      loadData();
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-purple-400" />
            <span>Master Data Pelanggan, Shipper & Consignee</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Data kontak perusahaan, nomor WhatsApp untuk notifikasi otomatis kapal, NPWP, dan batas kredit pengiriman.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Pelanggan</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama perusahaan, kontak person, email, nomor WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cust) => (
          <div
            key={cust.id}
            className="p-5 bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 rounded-3xl shadow-xl transition-all flex flex-col justify-between group space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  {cust.code}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  cust.status === 'Aktif'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {cust.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                {cust.companyName}
              </h3>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">PIC: {cust.contactPerson}</p>

              <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono text-slate-200">WA: +{cust.whatsapp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-slate-300 truncate">{cust.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-slate-400 truncate">{cust.address}, {cust.city}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Term Pembayaran:</span>
                  <span className="font-bold text-white">{cust.paymentTerms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plafon Kredit:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    Rp {(cust.creditLimit / 1000000000).toFixed(1)} Miliar
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Pengiriman:</span>
                  <span className="font-mono font-bold text-emerald-400">{cust.totalShipments} Shipment</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[10px] text-slate-500">NPWP: {cust.taxId}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(cust)}
                  className="p-1.5 bg-slate-800 hover:bg-purple-500/20 hover:text-purple-300 text-slate-400 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeletingCustomer(cust)}
                  className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
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
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingCustomer ? 'Edit Data Pelanggan' : 'Tambah Pelanggan / Shipper Baru'}
                </h3>
                <p className="text-xs text-slate-400">Masukkan identitas lengkap dan kontak notifikasi otomatis</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kode Pelanggan *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Prospek">Prospek</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Perusahaan / PT *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Indofood Sukses Makmur Tbk"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">PIC (Contact Person) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama PIC Supply Chain"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Notifikasi *</label>
                  <input
                    type="text"
                    required
                    placeholder="628123456789"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    placeholder="logistik@company.co.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Telepon Kantor</label>
                  <input
                    type="text"
                    placeholder="+62-21-..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kota / Domisili</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">NPWP / Tax ID</label>
                  <input
                    type="text"
                    placeholder="01.234.567.8-000.000"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Syarat Pembayaran</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="Cash Before Loading">Cash Before Loading (CBL)</option>
                    <option value="Net 14 Days">Net 14 Hari</option>
                    <option value="Net 30 Days">Net 30 Hari</option>
                    <option value="Net 45 Days">Net 45 Hari</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Plafon Kredit (Rp)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Kantor</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none"
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
                  className="px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-500/25"
                >
                  {editingCustomer ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deletingCustomer}
        title="Hapus Data Pelanggan"
        message="Yakin ingin menghapus data pelanggan ini?"
        itemName={deletingCustomer?.companyName}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingCustomer(null)}
      />
    </div>
  );
};
