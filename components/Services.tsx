import React, { useState } from 'react';
import { FileText, ShieldAlert, HeartHandshake, Database, Trees, Search, Printer, X, User as UserIcon, Calendar, Info, Baby, Stethoscope, Shovel } from 'lucide-react';
import { Resident, User, Gender } from '../types';

interface ServicesProps {
  residents: Resident[];
  user: User;
}

const Services: React.FC<ServicesProps> = ({ residents, user }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [letterType, setLetterType] = useState<string>('');
  const [showLetterModal, setShowLetterModal] = useState(false);
  
  // State untuk Layanan Lingkungan
  const [showKerjaBaktiModal, setShowKerjaBaktiModal] = useState(false);
  const [showPosyanduModal, setShowPosyanduModal] = useState(false);

  // Helper: Calculate Age
  const getAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // --- Logic for Tab 1: Administrasi (Letter Generator) ---
  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.nik.includes(searchTerm)
  );

  const handleCreateLetter = (resident: Resident, type: string) => {
    setSelectedResident(resident);
    setLetterType(type);
    setShowLetterModal(true);
  };

  const printLetter = () => {
    const printContent = document.getElementById('letter-content');
    if (printContent) {
        const printWindow = window.open('', '', 'width=800,height=1100');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Cetak Surat - ${selectedResident?.name}</title>
                        <!-- Inject Tailwind agar tampilan sama persis -->
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            /* Force Times New Roman untuk surat resmi */
                            body { 
                                font-family: 'Times New Roman', Times, serif !important; 
                                -webkit-print-color-adjust: exact; 
                            }
                            /* Atur margin kertas saat print */
                            @page {
                                size: A4;
                                margin: 2cm;
                            }
                            /* Sembunyikan elemen browser default */
                            @media print {
                                body { padding: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        ${printContent.innerHTML}
                        <script>
                            // Tunggu sebentar agar Tailwind selesai me-render style sebelum print
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
    }
  };

  // --- Logic for Tab 2: Keamanan (Ronda Generator) ---
  const generateRondaSchedule = () => {
    // Filter: Laki-laki, usia 17-60
    const eligibleMen = residents.filter(r => 
      r.gender === Gender.MALE && getAge(r.birthDate) >= 17 && getAge(r.birthDate) <= 60
    );
    
    // Shuffle logic simple
    const shuffled = [...eligibleMen].sort(() => 0.5 - Math.random());
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const schedule: Record<string, Resident[]> = {};
    
    // Distribute
    days.forEach((day, index) => {
        schedule[day] = [];
        for (let i = index; i < shuffled.length; i += 7) {
            schedule[day].push(shuffled[i]);
        }
    });

    return schedule;
  };
  const rondaSchedule = generateRondaSchedule();

  // --- Logic for Tab 4: Data (Lansia) ---
  const elderlyResidents = residents.filter(r => getAge(r.birthDate) >= 60);

  // --- Logic for Tab 5: Lingkungan (Posyandu) ---
  const toddlers = residents.filter(r => getAge(r.birthDate) <= 5);
  
  // Helper: Get Next 4th Sunday for Kerja Bakti
  const getNextKerjaBaktiDate = () => {
    const d = new Date();
    d.setDate(1);
    // Find first sunday
    while (d.getDay() !== 0) {
        d.setDate(d.getDate() + 1);
    }
    // Add 3 weeks (21 days) to get 4th sunday
    d.setDate(d.getDate() + 21);
    
    // If passed, get next month
    if (d < new Date()) {
        d.setMonth(d.getMonth() + 1);
        d.setDate(1);
        while (d.getDay() !== 0) {
            d.setDate(d.getDate() + 1);
        }
        d.setDate(d.getDate() + 21);
    }
    return d.toLocaleDateString('id-ID', { dateStyle: 'full' });
  };


  const categories = [
    { title: "Administrasi", icon: FileText, color: "bg-blue-50 text-blue-600" },
    { title: "Keamanan", icon: ShieldAlert, color: "bg-red-50 text-red-600" },
    { title: "Sosial", icon: HeartHandshake, color: "bg-pink-50 text-pink-600" },
    { title: "Data Warga", icon: Database, color: "bg-indigo-50 text-indigo-600" },
    { title: "Lingkungan", icon: Trees, color: "bg-emerald-50 text-emerald-600" }
  ];

  const letterOptions = [
    { type: 'Surat Pengantar KTP/KK', label: 'Pengantar KTP/KK' },
    { type: 'Surat Keterangan Domisili', label: 'Ket. Domisili' },
    { type: 'Surat Keterangan Tidak Mampu', label: 'SKTM' },
    { type: 'Surat Keterangan Usaha', label: 'Ket. Usaha' },
    { type: 'Surat Pengantar Kematian', label: 'Ket. Kematian' },
    { type: 'Surat Pengantar Nikah', label: 'Pengantar Nikah' },
    { type: 'Surat Pengantar SKCK', label: 'Pengantar SKCK' },
    { type: 'Surat Pengantar Pindah', label: 'Pindah Datang' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Layanan Terpadu</h2>
        <p className="text-slate-500 text-sm">Pilih kategori layanan untuk diproses</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
                <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                        activeTab === idx 
                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                        : 'border-slate-100 bg-white hover:bg-slate-50'
                    }`}
                >
                    <div className={`p-2 rounded-lg mb-2 ${activeTab === idx ? 'bg-blue-200 text-blue-700' : cat.color}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-semibold ${activeTab === idx ? 'text-blue-700' : 'text-slate-600'}`}>
                        {cat.title}
                    </span>
                </button>
            )
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
        
        {/* TAB 1: ADMINISTRASI - LETTER GENERATOR */}
        {activeTab === 0 && (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Pembuatan Surat Otomatis</h3>
                        <p className="text-slate-500 text-sm">Cari warga dan pilih jenis surat untuk dicetak</p>
                    </div>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text"
                        placeholder="Cari Nama atau NIK warga..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {searchTerm && (
                    <div className="space-y-3">
                        {filteredResidents.length > 0 ? (
                            filteredResidents.map(r => (
                                <div key={r.id} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                            {r.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{r.name}</h4>
                                            <p className="text-xs text-slate-500">NIK: {r.nik} • {r.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {letterOptions.map((opt) => (
                                            <button
                                                key={opt.type}
                                                onClick={() => handleCreateLetter(r, opt.type)}
                                                className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-400 py-4">Warga tidak ditemukan.</p>
                        )}
                    </div>
                )}
                
                {!searchTerm && (
                    <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Ketik nama warga di kolom pencarian untuk memulai pembuatan surat.</p>
                    </div>
                )}
            </div>
        )}

        {/* TAB 2: KEAMANAN - RONDA OTOMATIS */}
        {activeTab === 1 && (
             <div className="p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Jadwal Ronda Otomatis</h3>
                    <p className="text-slate-500 text-sm">Digenerate dari data warga laki-laki usia 17-60 tahun</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(rondaSchedule).map(([day, guards]) => (
                        <div key={day} className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 p-3 border-b border-slate-100 font-bold text-slate-700 flex justify-between">
                                {day}
                                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">{guards.length} Org</span>
                            </div>
                            <ul className="p-3 space-y-2">
                                {guards.length > 0 ? guards.map(g => (
                                    <li key={g.id} className="text-sm text-slate-600 flex items-center gap-2">
                                        <UserIcon className="w-3 h-3 text-slate-400" />
                                        {g.name}
                                    </li>
                                )) : (
                                    <li className="text-xs text-slate-400 italic">Tidak ada jadwal</li>
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
             </div>
        )}

        {/* TAB 3: SOSIAL - KEGIATAN */}
        {activeTab === 2 && (
            <div className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Layanan Sosial Kemasyarakatan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-pink-50 p-6 rounded-xl border border-pink-100">
                        <h4 className="font-bold text-pink-700 mb-2">Bantuan Sosial</h4>
                        <p className="text-sm text-pink-600 mb-4">Pendataan warga yang berhak menerima bantuan sosial dari pemerintah.</p>
                        <button className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700">
                            Input Data Penerima
                        </button>
                    </div>
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                        <h4 className="font-bold text-orange-700 mb-2">Jenguk Warga Sakit</h4>
                        <p className="text-sm text-orange-600 mb-4">Formulir penggalangan dana atau koordinasi kunjungan warga sakit.</p>
                        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700">
                            Buat Jadwal Kunjungan
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* TAB 4: DATA - LANSIA & STATISTIK */}
        {activeTab === 3 && (
            <div className="p-6">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Data & Informasi Warga</h3>
                        <p className="text-slate-500 text-sm">Statistik otomatis berdasarkan database</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-xs text-blue-600 font-bold uppercase">Total Penduduk</p>
                        <p className="text-3xl font-bold text-blue-800 mt-1">{residents.length}</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-xl">
                        <p className="text-xs text-indigo-600 font-bold uppercase">Lansia ({'>'}60 Thn)</p>
                        <p className="text-3xl font-bold text-indigo-800 mt-1">{elderlyResidents.length}</p>
                    </div>
                     <div className="bg-emerald-50 p-4 rounded-xl">
                        <p className="text-xs text-emerald-600 font-bold uppercase">Kepala Keluarga</p>
                        <p className="text-3xl font-bold text-emerald-800 mt-1">{Math.ceil(residents.length / 3)}</p>
                    </div>
                </div>

                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Daftar Warga Lansia (Prioritas Layanan)
                </h4>
                <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="p-3">Nama</th>
                                <th className="p-3">Usia</th>
                                <th className="p-3">Alamat</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {elderlyResidents.map(r => (
                                <tr key={r.id}>
                                    <td className="p-3 font-medium">{r.name}</td>
                                    <td className="p-3">{getAge(r.birthDate)} Thn</td>
                                    <td className="p-3 text-slate-500">{r.address}</td>
                                    <td className="p-3">
                                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">Lansia</span>
                                    </td>
                                </tr>
                            ))}
                            {elderlyResidents.length === 0 && (
                                <tr><td colSpan={4} className="p-4 text-center text-slate-400">Tidak ada data lansia.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* TAB 5: LINGKUNGAN */}
        {activeTab === 4 && (
            <div className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Kegiatan Lingkungan</h3>
                <div className="space-y-4">
                    <div className="border p-4 rounded-xl flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                            <Trees className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold">Kerja Bakti Bulanan</h4>
                            <p className="text-sm text-slate-500">Jadwal: Minggu ke-4 setiap bulan</p>
                        </div>
                        <button 
                            onClick={() => setShowKerjaBaktiModal(true)}
                            className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700"
                        >
                            Lihat Detail
                        </button>
                    </div>
                    <div className="border p-4 rounded-xl flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                            <Stethoscope className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold">Posyandu & PKK</h4>
                            <p className="text-sm text-slate-500">Data Balita dan jadwal kegiatan PKK.</p>
                        </div>
                        <button 
                            onClick={() => setShowPosyanduModal(true)}
                            className="text-sm bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700"
                        >
                            Kelola
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* MODAL KERJA BAKTI */}
      {showKerjaBaktiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="bg-emerald-600 p-6 text-white flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            <Shovel className="w-6 h-6" />
                            Kerja Bakti Rutin
                        </h3>
                        <p className="text-emerald-100 text-sm mt-1">Kegiatan gotong royong warga RT 002 / RW 006</p>
                    </div>
                    <button onClick={() => setShowKerjaBaktiModal(false)} className="bg-white/20 p-1 rounded-lg hover:bg-white/30">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-100">
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Jadwal Berikutnya</p>
                        <p className="text-xl font-bold text-slate-800">{getNextKerjaBaktiDate()}</p>
                        <p className="text-sm text-slate-600 mt-1">Pukul 07:00 WIB - Selesai</p>
                    </div>

                    <h4 className="font-bold text-slate-800 mb-3 text-sm">Lokasi Fokus Pembersihan:</h4>
                    <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-3 text-sm text-slate-600">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            Membersihkan Saluran Air Utama (Got)
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-600">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            Pemangkasan Ranting Pohon
                        </li>
                         <li className="flex items-center gap-3 text-sm text-slate-600">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            Pembersihan Area Balai Warga
                        </li>
                    </ul>

                     <h4 className="font-bold text-slate-800 mb-3 text-sm">Peralatan yang disarankan:</h4>
                     <div className="flex gap-2 flex-wrap">
                        <span className="bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-600 border">Sapu Lidi</span>
                        <span className="bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-600 border">Cangkul</span>
                        <span className="bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-600 border">Sarung Tangan</span>
                        <span className="bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-600 border">Kantong Sampah</span>
                     </div>
                </div>
                <div className="p-4 border-t bg-slate-50 flex justify-end">
                    <button onClick={() => setShowKerjaBaktiModal(false)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
                        Tutup Jadwal
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL POSYANDU */}
      {showPosyanduModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="bg-yellow-500 p-6 text-white flex justify-between items-start shrink-0">
                    <div>
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            <Baby className="w-6 h-6" />
                            Posyandu & PKK
                        </h3>
                        <p className="text-yellow-100 text-sm mt-1">Layanan kesehatan ibu dan anak</p>
                    </div>
                    <button onClick={() => setShowPosyanduModal(false)} className="bg-white/20 p-1 rounded-lg hover:bg-white/30">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                            <p className="text-xs text-yellow-700 font-bold uppercase mb-1">Jadwal Posyandu</p>
                            <p className="font-bold text-slate-800">Tanggal 5 Setiap Bulan</p>
                            <p className="text-sm text-slate-600">Pukul 09:00 - 11:00 WIB</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                             <p className="text-xs text-blue-700 font-bold uppercase mb-1">Lokasi Kegiatan</p>
                            <p className="font-bold text-slate-800">Balai Warga RW 006</p>
                            <p className="text-sm text-slate-600">Jl. Merpati No. 1</p>
                        </div>
                    </div>

                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Baby className="w-4 h-4 text-pink-500" />
                        Data Balita (Usia 0-5 Tahun)
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">Terdeteksi otomatis dari database warga.</p>
                    
                    <div className="border rounded-xl overflow-hidden mb-6">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="p-3">Nama Anak</th>
                                    <th className="p-3">Usia</th>
                                    <th className="p-3">Jenis Kelamin</th>
                                    <th className="p-3">Orang Tua/Wali</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {toddlers.length > 0 ? toddlers.map(t => (
                                    <tr key={t.id}>
                                        <td className="p-3 font-medium text-slate-800">{t.name}</td>
                                        <td className="p-3">{getAge(t.birthDate)} Tahun</td>
                                        <td className="p-3">{t.gender === 'Laki-laki' ? 'L' : 'P'}</td>
                                        <td className="p-3 text-slate-500">{t.nik.substring(0,6)}... (NIK)</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-slate-400">Tidak ada data balita.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                         <h4 className="font-bold text-slate-800 mb-3 text-sm">Susunan Pengurus PKK</h4>
                         <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Ketua PKK</span>
                                <span className="font-medium text-slate-800">Ibu Siti Aminah</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Sekretaris</span>
                                <span className="font-medium text-slate-800">Ibu Ratna Sari</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Bendahara</span>
                                <span className="font-medium text-slate-800">Ibu Dewi Lestari</span>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MODAL LETTER PREVIEW */}
      {showLetterModal && selectedResident && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg">Preview {letterType}</h3>
                    <button onClick={() => setShowLetterModal(false)} className="p-1 hover:bg-slate-100 rounded-full">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    <div id="letter-content" className="bg-white p-12 shadow-sm mx-auto max-w-[210mm] min-h-[297mm]">
                        {/* Letter Header */}
                        <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
                            <h2 className="font-bold text-xl uppercase tracking-wider">RUKUN TETANGGA 002 / RUKUN WARGA 006</h2>
                            <h3 className="font-bold text-lg uppercase">KELURAHAN CIPADU JAYA KECAMATAN LARANGAN KOTA TANGERANG</h3>
                            <p className="text-sm mt-1">Sekretariat : Jl. Amal No. 20, Telp : 081573797565</p>
                        </div>

                        {/* Letter Title */}
                        <div className="text-center mb-8">
                            <h2 className="font-bold text-lg underline uppercase">{letterType}</h2>
                            <p className="text-sm">Nomor: ...........................................................</p>
                        </div>

                        {/* Letter Body */}
                        <div className="text-justify leading-relaxed">
                            <p className="mb-4">Yang bertanda tangan di bawah ini Ketua RT 002 / RW 006 Kelurahan Cipadu Jaya, Kecamatan Larangan, Kota Tangerang, menerangkan dengan sebenarnya bahwa:</p>
                            
                            <table className="w-full mb-6">
                                <tbody>
                                    <tr>
                                        <td className="w-40 py-1">Nama Lengkap</td>
                                        <td className="font-bold uppercase">: {selectedResident.name}</td>
                                    </tr>
                                    <tr>
                                        <td className="w-40 py-1">NIK</td>
                                        <td className="font-bold">: {selectedResident.nik}</td>
                                    </tr>
                                    <tr>
                                        <td className="w-40 py-1">Jenis Kelamin</td>
                                        <td>: {selectedResident.gender}</td>
                                    </tr>
                                    <tr>
                                        <td className="w-40 py-1">Tempat/Tgl Lahir</td>
                                        <td>: Jakarta, {selectedResident.birthDate}</td>
                                    </tr>
                                    <tr>
                                        <td className="w-40 py-1">Pekerjaan</td>
                                        <td>: {selectedResident.job}</td>
                                    </tr>
                                    <tr>
                                        <td className="w-40 py-1">Status Perkawinan</td>
                                        <td>: {selectedResident.status}</td>
                                    </tr>
                                    <tr>
                                        <td className="w-40 py-1 align-top">Alamat</td>
                                        <td className="align-top">: {selectedResident.address}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <p className="mb-4">
                                Adalah benar-benar warga kami yang berdomisili di alamat tersebut di atas. 
                                Surat keterangan ini dibuat untuk keperluan: <strong>Pengurusan Administrasi Kependudukan / {letterType.replace('Surat ', '')}</strong>.
                            </p>
                            
                            <p className="mb-8">
                                Demikian surat keterangan ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.
                            </p>
                        </div>

                        {/* Signature */}
                        <div className="flex justify-end mt-12">
                            <div className="text-center w-64">
                                <p className="mb-20">Tangerang, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                                <p className="font-bold underline text-lg">BAPAK KETUA RT</p>
                                <p>Ketua RT 002 / RW 006</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-white flex justify-end gap-3">
                    <button 
                        onClick={() => setShowLetterModal(false)}
                        className="px-6 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-100"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={printLetter}
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Cetak Surat
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Services;