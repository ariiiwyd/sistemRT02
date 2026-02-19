import React, { useState } from 'react';
import { Resident, Gender, MaritalStatus, User } from '../types';
import { Search, Plus, Trash2, Edit, Download, IdCard, Printer, X, Camera, Upload } from 'lucide-react';

interface ResidentListProps {
  residents: Resident[];
  setResidents: React.Dispatch<React.SetStateAction<Resident[]>>;
  user: User;
}

const ResidentList: React.FC<ResidentListProps> = ({ residents, setResidents, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedResidentForCard, setSelectedResidentForCard] = useState<Resident | null>(null);
  
  const [isEditMode, setIsEditMode] = useState(false);
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

  const handleEdit = (resident: Resident) => {
    setNewResident(resident);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleShowCard = (resident: Resident) => {
    setSelectedResidentForCard(resident);
    setIsCardModalOpen(true);
  };

  const handlePrintCard = () => {
    if (!selectedResidentForCard) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      const cardHtml = document.getElementById('printable-card')?.innerHTML;
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak Kartu Warga - ${selectedResidentForCard.name}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; padding: 20px; display: flex; justify-content: center; }
              img { object-fit: cover; }
            </style>
          </head>
          <body>
            ${cardHtml}
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 1000);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleExportCSV = () => {
    const headers = ['NIK', 'Nama Lengkap', 'Jenis Kelamin', 'Tanggal Lahir', 'Alamat', 'Pekerjaan', 'Status', 'No HP'];
    const csvContent = [
      headers.join(','),
      ...residents.map(r => [
        `"${r.nik}"`,
        `"${r.name}"`,
        `"${r.gender}"`,
        `"${r.birthDate}"`,
        `"${r.address}"`,
        `"${r.job}"`,
        `"${r.status}"`,
        `"${r.phone}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `data_warga_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenAddModal = () => {
    setNewResident({ gender: Gender.MALE, status: MaritalStatus.SINGLE });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewResident(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResident.name || !newResident.nik) return;

    if (isEditMode && newResident.id) {
        // Update existing resident
        setResidents(prev => prev.map(r => r.id === newResident.id ? { ...newResident } as Resident : r));
    } else {
        // Add new resident
        const resident: Resident = {
            id: Date.now().toString(),
            nik: newResident.nik || '',
            name: newResident.name || '',
            gender: newResident.gender as Gender,
            birthDate: newResident.birthDate || '',
            address: newResident.address || '',
            job: newResident.job || '',
            status: newResident.status as MaritalStatus,
            phone: newResident.phone || '',
            photoUrl: newResident.photoUrl
        };
        setResidents(prev => [...prev, resident]);
    }

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
        <div className="flex gap-2 w-full sm:w-auto">
            <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
            >
            <Download className="w-5 h-5" />
            Export Excel
            </button>
            <button 
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
            >
            <Plus className="w-5 h-5" />
            Tambah Warga
            </button>
        </div>
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
                      <div className="flex items-center gap-3">
                         {/* Avatar in List */}
                         <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-200">
                            {resident.photoUrl ? (
                                <img src={resident.photoUrl} alt={resident.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                                    {resident.name.charAt(0)}
                                </div>
                            )}
                         </div>
                         <div>
                            <div className="font-semibold text-slate-800">{resident.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{resident.nik}</div>
                         </div>
                      </div>
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
                         <button 
                            onClick={() => handleShowCard(resident)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Lihat Kartu Anggota"
                        >
                          <IdCard className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleEdit(resident)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Data"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.role === 'ADMIN' && (
                          <button 
                            onClick={() => handleDelete(resident.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Data"
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

      {/* Modal Kartu Warga */}
      {isCardModalOpen && selectedResidentForCard && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <IdCard className="w-5 h-5 text-blue-600" />
                    Kartu Tanda Warga
                  </h3>
                  <button onClick={() => setIsCardModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
              </div>
              
              <div className="p-8 bg-slate-100 flex justify-center">
                  {/* Card Component for Print */}
                  <div id="printable-card" className="w-[450px] h-[280px] bg-white rounded-xl shadow-lg overflow-hidden relative border border-slate-200">
                      {/* Background Pattern */}
                      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-700 to-indigo-600"></div>
                      <div className="absolute top-4 left-6 z-10 text-white">
                          <h2 className="text-lg font-bold tracking-wide">KARTU TANDA WARGA</h2>
                          <p className="text-xs opacity-80 uppercase tracking-widest">RT 002 / RW 006</p>
                      </div>
                      <div className="absolute top-4 right-6 z-10">
                         <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <span className="text-xl">🏘️</span>
                         </div>
                      </div>

                      <div className="absolute top-16 left-6 w-full flex gap-5">
                          {/* Photo Area */}
                          <div className="w-24 h-32 bg-slate-200 rounded-lg border-4 border-white shadow-md overflow-hidden flex-shrink-0">
                             <img 
                                src={selectedResidentForCard.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedResidentForCard.name}`} 
                                alt="Foto" 
                                className="w-full h-full object-cover"
                             />
                          </div>
                          
                          {/* Data Area */}
                          <div className="pt-10 pr-6 flex-1 text-slate-800">
                              <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{selectedResidentForCard.name}</h3>
                              <p className="text-xs text-blue-600 font-mono mb-3">{selectedResidentForCard.nik}</p>
                              
                              <div className="space-y-1 text-[10px] leading-tight text-slate-600">
                                  <div className="grid grid-cols-[60px_1fr]">
                                      <span className="font-semibold">TTL</span>
                                      <span>: {selectedResidentForCard.birthDate}</span>
                                  </div>
                                  <div className="grid grid-cols-[60px_1fr]">
                                      <span className="font-semibold">Gender</span>
                                      <span>: {selectedResidentForCard.gender}</span>
                                  </div>
                                  <div className="grid grid-cols-[60px_1fr]">
                                      <span className="font-semibold">Alamat</span>
                                      <span className="truncate">: {selectedResidentForCard.address}</span>
                                  </div>
                                  <div className="grid grid-cols-[60px_1fr]">
                                      <span className="font-semibold">Pekerjaan</span>
                                      <span>: {selectedResidentForCard.job}</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Footer / Signature */}
                      <div className="absolute bottom-4 right-6 text-right">
                          <p className="text-[9px] text-slate-400 mb-8">Berlaku Selama Menjadi Warga</p>
                          <p className="text-[10px] font-bold border-t border-slate-300 px-4 pt-1 inline-block text-slate-700">KETUA RT 002</p>
                      </div>
                  </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
                  <button 
                    onClick={() => setIsCardModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                  >
                    Tutup
                  </button>
                  <button 
                    onClick={handlePrintCard}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Cetak Kartu
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* Modal Tambah/Edit Warga */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                {isEditMode ? 'Edit Data Warga' : 'Tambah Warga Baru'}
              </h3>
            </div>
            <form onSubmit={handleSaveResident} className="p-6 space-y-4">
              
              {/* Photo Upload Section */}
              <div className="flex justify-center mb-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                        {newResident.photoUrl ? (
                            <img src={newResident.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <Camera className="w-8 h-8 text-slate-400" />
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-md">
                        <Upload className="w-4 h-4" />
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NIK (Maks 16 digit)</label>
                  <input 
                    type="text" 
                    required 
                    maxLength={16}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={newResident.nik || ''} 
                    onChange={e => {
                        const val = e.target.value.replace(/\D/g, ''); // Hanya angka
                        setNewResident({...newResident, nik: val})
                    }}
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
                  {isEditMode ? 'Update Data' : 'Simpan Data'}
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