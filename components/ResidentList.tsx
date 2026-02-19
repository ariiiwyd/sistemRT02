import React, { useState } from 'react';
import { Resident, Gender, MaritalStatus, User } from '../types';
import { Search, Plus, MoreHorizontal, Trash2, Edit } from 'lucide-react';

interface ResidentListProps {
  residents: Resident[];
  setResidents: React.Dispatch<React.SetStateAction<Resident[]>>;
  user: User;
}

const ResidentList: React.FC<ResidentListProps> = ({ residents, setResidents, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newResident, setNewResident] = useState<Partial<Resident>>({
    gender: Gender.MALE,
    status: MaritalStatus.SINGLE
  });

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.nik.includes(searchTerm) ||
    r.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (user.role !== 'ADMIN') return;
    if (confirm('Apakah anda yakin ingin menghapus data warga ini?')) {
      setResidents(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResident.name || !newResident.nik) return;

    const resident: Resident = {
      id: Date.now().toString(),
      nik: newResident.nik || '',
      name: newResident.name || '',
      gender: newResident.gender as Gender,
      birthDate: newResident.birthDate || '',
      address: newResident.address || '',
      job: newResident.job || '',
      status: newResident.status as MaritalStatus,
      phone: newResident.phone || ''
    };

    setResidents(prev => [...prev, resident]);
    setIsModalOpen(false);
    setNewResident({ gender: Gender.MALE, status: MaritalStatus.SINGLE });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Data Warga</h2>
          <p className="text-slate-500 text-sm">Kelola data kependudukan RT/RW anda</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Warga
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Cari nama, NIK, atau alamat..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Nama Lengkap & NIK</th>
                <th className="px-6 py-4">Jenis Kelamin</th>
                <th className="px-6 py-4">Alamat</th>
                <th className="px-6 py-4">Pekerjaan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.length > 0 ? (
                filteredResidents.map((resident) => (
                  <tr key={resident.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{resident.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{resident.nik}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{resident.gender}</td>
                    <td className="px-6 py-4 text-slate-600">{resident.address}</td>
                    <td className="px-6 py-4 text-slate-600">{resident.job}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        resident.status === MaritalStatus.MARRIED ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {resident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.role === 'ADMIN' && (
                          <button 
                            onClick={() => handleDelete(resident.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Data (Admin Only)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada data warga yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Warga */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Tambah Warga Baru</h3>
            </div>
            <form onSubmit={handleAddResident} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NIK</label>
                  <input type="text" required className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={newResident.nik || ''} onChange={e => setNewResident({...newResident, nik: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                  <input type="text" required className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={newResident.name || ''} onChange={e => setNewResident({...newResident, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                  <select className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newResident.gender} onChange={e => setNewResident({...newResident, gender: e.target.value as Gender})}
                  >
                    <option value={Gender.MALE}>Laki-laki</option>
                    <option value={Gender.FEMALE}>Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir</label>
                  <input type="date" required className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={newResident.birthDate || ''} onChange={e => setNewResident({...newResident, birthDate: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
                  <input type="text" required className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={newResident.address || ''} onChange={e => setNewResident({...newResident, address: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pekerjaan</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={newResident.job || ''} onChange={e => setNewResident({...newResident, job: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status Perkawinan</label>
                  <select className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newResident.status} onChange={e => setNewResident({...newResident, status: e.target.value as MaritalStatus})}
                  >
                    <option value={MaritalStatus.SINGLE}>Belum Kawin</option>
                    <option value={MaritalStatus.MARRIED}>Kawin</option>
                    <option value={MaritalStatus.DIVORCED}>Cerai</option>
                  </select>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nomor HP</label>
                  <input type="tel" className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={newResident.phone || ''} onChange={e => setNewResident({...newResident, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentList;