import React, { useState } from 'react';
import { Resident, Gender, MaritalStatus, User } from '../types';
import { Search, Plus, Trash2, Edit, Download, CreditCard, Printer, X, Camera, Upload, AlertCircle, AlertTriangle, QrCode } from 'lucide-react';
import { db } from '../services/db';

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
  
  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<Resident | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [newResident, setNewResident] = useState<Partial<Resident>>({
    gender: Gender.MALE,
    status: MaritalStatus.SINGLE
  });

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.nik.includes(searchTerm) ||
    r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.kkNumber?.includes(searchTerm) // Search by KK too
  );

  const requestDelete = (resident: Resident) => {
    if (user.role !== 'ADMIN') return;
    setDeleteTarget(resident);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
        setIsDeleting(true);
        // DB Call
        await db.residents.delete(deleteTarget.id);
        
        // Local State Update
        setResidents(prev => prev.filter(r => r.id !== deleteTarget.id));
        setDeleteTarget(null);
        setIsDeleting(false);
    }
  };

  const handleEdit = (resident: Resident) => {
    setNewResident(resident);
    setIsEditMode(true);
    setError('');
    setIsModalOpen(true);
  };

  const handleShowCard = (resident: Resident) => {
    setSelectedResidentForCard(resident);
    setIsCardModalOpen(true);
  };

  const handlePrintCard = () => {
    if (!selectedResidentForCard) return;

    const r = selectedResidentForCard;
    const photoUrl = r.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.name}`;
    
    // Parsing Alamat untuk memisahkan jalan dan RT/RW agar tidak kepotong
    let addrMain = r.address;
    let addrRTRW = '';
    
    // Regex untuk menangkap RT atau RW yang didahului koma atau spasi
    const splitMatch = r.address.match(/[,.]?\s*(RT\s*.*)/i) || r.address.match(/[,.]?\s*(RW\s*.*)/i);
    
    if (splitMatch && splitMatch.index !== undefined && splitMatch.index > 0) {
        addrMain = r.address.substring(0, splitMatch.index).trim();
        addrRTRW = splitMatch[1].trim();
    }

    // QR berisi JSON data penting
    const qrData = encodeURIComponent(JSON.stringify({
        nik: r.nik,
        nama: r.name,
        kk: r.kkNumber,
        alamat: r.address
    }));
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Cetak KTP - ${r.name}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
              /* CSS Reset & Base for Print Precision */
              *, *::before, *::after { box-sizing: border-box; }
              
              body {
                margin: 0;
                padding: 0;
                font-family: 'Inter', sans-serif;
                background-color: #f0f0f0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }

              /* Ukuran Kartu ID-1 (Standar KTP/ATM): 85.60mm x 53.98mm */
              .card {
                width: 85.60mm;
                height: 53.98mm;
                position: relative;
                overflow: hidden;
                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); /* Blue gradient */
                border-radius: 3mm;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                color: white;
              }

              /* Pattern Background Overlays */
              .pattern-1 {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 50%;
                background: rgba(255,255,255,0.1);
                transform: skewY(-6deg);
                transform-origin: bottom right;
              }
              .pattern-2 {
                position: absolute;
                top: 0;
                right: 0;
                width: 50%;
                height: 100%;
                background: rgba(255,255,255,0.05);
                transform: skewX(12deg);
              }

              /* Header Section */
              .header {
                position: relative;
                z-index: 10;
                display: flex;
                align-items: center;
                padding: 2.5mm 3mm 1mm 3mm;
                gap: 2mm;
              }
              .logo {
                width: 7mm;
                height: 7mm;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 0.5pt solid rgba(255,255,255,0.4);
                font-size: 6pt;
                font-weight: 800;
              }
              .title-group h1 {
                margin: 0;
                font-size: 8.5pt;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.5pt;
                line-height: 1;
              }
              .title-group p {
                margin: 0.5mm 0 0 0;
                font-size: 4.5pt;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5pt;
                opacity: 0.9;
              }

              /* Main Content Box */
              .content {
                position: relative;
                z-index: 10;
                background: white;
                margin: 0 1.5mm 1.5mm 1.5mm;
                height: 38mm; /* Sisa tinggi */
                border-radius: 1.5mm;
                display: flex;
                padding: 2mm;
                color: #334155; /* Slate-700 */
              }

              /* Left: Photo */
              .photo-box {
                width: 20mm;
                margin-right: 2mm;
                flex-shrink: 0;
                display: flex;
                flex-col-direction: column;
                flex-direction: column;
                gap: 1mm;
              }
              .photo-frame {
                width: 20mm;
                height: 25mm;
                background: #e2e8f0;
                border-radius: 1mm;
                overflow: hidden;
                border: 0.5pt solid #cbd5e1;
              }
              .photo-frame img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
              .gender-badge {
                text-align: center;
                font-size: 4pt;
                font-weight: 700;
                background: #f1f5f9;
                padding: 0.5mm 0;
                border-radius: 0.5mm;
                text-transform: uppercase;
                color: #64748b;
              }

              /* Middle: Details */
              .details {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                overflow: hidden;
              }
              .name {
                font-size: 8pt;
                font-weight: 800;
                color: #0f172a;
                text-transform: uppercase;
                margin: 0 0 0.5mm 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .nik {
                font-size: 6.5pt;
                font-family: 'Courier New', monospace;
                font-weight: 700;
                color: #2563eb; /* Blue-600 */
                margin: 0 0 1.5mm 0;
                letter-spacing: 0.2pt;
              }
              
              .row {
                display: flex;
                font-size: 5pt;
                margin-bottom: 0.5mm;
                line-height: 1.1;
              }
              .label {
                width: 13mm;
                font-weight: 600;
                color: #64748b;
                flex-shrink: 0;
              }
              .val {
                font-weight: 600;
                color: #334155;
                text-transform: uppercase;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              /* Right: QR & Footer */
              .sidebar {
                width: 16mm;
                border-left: 0.5pt dashed #cbd5e1;
                padding-left: 1.5mm;
                margin-left: 1mm;
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
              }
              .qr-box {
                width: 14mm;
                height: 14mm;
                border: 0.5pt solid #e2e8f0;
                padding: 0.5mm;
                border-radius: 1mm;
              }
              .qr-box img {
                width: 100%;
                height: 100%;
              }
              .footer {
                text-align: center;
                width: 100%;
              }
              .validity {
                font-size: 3.5pt;
                color: #94a3b8;
                line-height: 1;
                margin-bottom: 1mm;
              }
              .signature-line {
                border-top: 0.5pt solid #cbd5e1;
                padding-top: 0.5mm;
              }
              .signature-text {
                font-size: 4pt;
                font-weight: 700;
                text-transform: uppercase;
                color: #0f172a;
              }

              /* PRINT SETTINGS */
              @page {
                size: 85.60mm 53.98mm; /* Ukuran KTP */
                margin: 0;
              }
              
              @media print {
                body {
                  background: none;
                  display: block;
                }
                .card {
                  box-shadow: none;
                  border-radius: 0; /* Pinggiran tajam saat print */
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            
            <div class="card">
                <!-- Decorative Background -->
                <div class="pattern-1"></div>
                <div class="pattern-2"></div>

                <!-- Header -->
                <div class="header">
                    <div class="logo">RW</div>
                    <div class="title-group">
                        <h1>KARTU TANDA WARGA</h1>
                        <p>RT 002 / RW 006 KELURAHAN CIPADU JAYA</p>
                    </div>
                </div>

                <!-- Content -->
                <div class="content">
                    
                    <!-- Left Column: Photo -->
                    <div class="photo-box">
                        <div class="photo-frame">
                            <img src="${photoUrl}" alt="Foto Warga" />
                        </div>
                        <div class="gender-badge">
                            ${r.gender === 'Laki-laki' ? 'PRIA' : 'WANITA'}
                        </div>
                    </div>

                    <!-- Middle Column: Data -->
                    <div class="details">
                        <div class="name">${r.name}</div>
                        <div class="nik">${r.nik}</div>

                        <div class="row">
                            <span class="label">No. KK</span>
                            <span class="val">: ${r.kkNumber}</span>
                        </div>
                        <div class="row">
                            <span class="label">TTL</span>
                            <span class="val">: JAKARTA, ${r.birthDate}</span>
                        </div>
                        <div class="row" style="align-items: flex-start;">
                            <span class="label">Alamat</span>
                            <div style="flex: 1; display: flex; flex-direction: column;">
                                <span class="val" style="white-space: normal; overflow: visible; line-height: 1.1;">: ${addrMain}</span>
                                ${addrRTRW ? `<span class="val" style="white-space: normal; overflow: visible; line-height: 1.1; margin-top: 0.5mm; padding-left: 1.5mm;">${addrRTRW}</span>` : ''}
                            </div>
                        </div>
                        <div class="row">
                            <span class="label">Pekerjaan</span>
                            <span class="val">: ${r.job}</span>
                        </div>
                        <div class="row">
                            <span class="label">Status</span>
                            <span class="val">: ${r.status}</span>
                        </div>
                    </div>

                    <!-- Right Column: QR -->
                    <div class="sidebar">
                         <div class="qr-box">
                            <img src="${qrUrl}" alt="QR Code" />
                         </div>
                         <div class="footer">
                            <div class="validity">Berlaku<br>Seumur Hidup</div>
                            <div class="signature-line">
                                <div class="signature-text">Ketua RT</div>
                            </div>
                         </div>
                    </div>

                </div>
            </div>
            
            <script>
              window.onload = function() {
                 window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleExportCSV = () => {
    const headers = ['NIK', 'No. KK', 'Nama Lengkap', 'Jenis Kelamin', 'Tanggal Lahir', 'Alamat', 'Pekerjaan', 'Status', 'No HP'];
    const csvContent = [
      headers.join(','),
      ...residents.map(r => [
        `"${r.nik}"`,
        `"${r.kkNumber}"`,
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
    setError('');
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

  const handleSaveResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResident.name || !newResident.nik || !newResident.kkNumber) return;

    // Cek Duplikasi NIK
    const isDuplicate = residents.some(r => 
        r.nik === newResident.nik && 
        (isEditMode ? r.id !== newResident.id : true)
    );

    if (isDuplicate) {
        setError('NIK sudah terdaftar! Mohon periksa kembali data Anda.');
        return;
    }

    setIsSaving(true);
    let updatedResident: Resident;

    if (isEditMode && newResident.id) {
        // Update existing resident
        updatedResident = { ...newResident } as Resident;
        setResidents(prev => prev.map(r => r.id === newResident.id ? updatedResident : r));
    } else {
        // Add new resident
        updatedResident = {
            id: Date.now().toString(),
            nik: newResident.nik || '',
            kkNumber: newResident.kkNumber || '',
            name: newResident.name || '',
            gender: newResident.gender as Gender,
            birthDate: newResident.birthDate || '',
            address: newResident.address || '',
            job: newResident.job || '',
            status: newResident.status as MaritalStatus,
            phone: newResident.phone || '',
            photoUrl: newResident.photoUrl
        };
        setResidents(prev => [...prev, updatedResident]);
    }

    // Save to DB
    await db.residents.save(updatedResident);

    setIsSaving(false);
    setIsModalOpen(false);
    setNewResident({ gender: Gender.MALE, status: MaritalStatus.SINGLE });
    setError('');
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
            <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button 
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
            >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah Warga</span>
            <span className="sm:hidden">Tambah</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Cari nama, NIK, KK, atau alamat..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* MOBILE VIEW: Cards */}
        <div className="block md:hidden bg-slate-50 p-3 space-y-3">
            {filteredResidents.length > 0 ? (
                filteredResidents.map((resident) => (
                    <div key={resident.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                            {/* Photo */}
                            <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                {resident.photoUrl ? (
                                    <img src={resident.photoUrl} alt={resident.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-lg">
                                        {resident.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            
                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-800 text-base truncate">{resident.name}</h3>
                                <div className="text-xs text-slate-500 space-y-0.5 mt-1">
                                    <p className="font-mono text-blue-600">{resident.nik}</p>
                                    <p className="truncate">{resident.address}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                             <div>
                                <span className="text-slate-400 block text-[10px]">Pekerjaan</span>
                                {resident.job}
                             </div>
                             <div>
                                <span className="text-slate-400 block text-[10px]">Status</span>
                                {resident.status}
                             </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1 border-t border-slate-50">
                             <button 
                                onClick={() => handleShowCard(resident)}
                                className="flex-1 bg-indigo-50 text-indigo-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                             >
                                <CreditCard className="w-4 h-4" /> Kartu
                             </button>
                             <button 
                                onClick={() => handleEdit(resident)}
                                className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                             >
                                <Edit className="w-4 h-4" /> Edit
                             </button>
                             {user.role === 'ADMIN' && (
                                <button 
                                    onClick={() => requestDelete(resident)}
                                    className="w-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                             )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-8 text-slate-400">Tidak ada data.</div>
            )}
        </div>

        {/* DESKTOP VIEW: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Nama Lengkap & Identitas</th>
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
                            <div className="text-xs text-slate-500 font-mono flex flex-col">
                                <span>NIK: {resident.nik}</span>
                                <span className="text-blue-500">KK : {resident.kkNumber}</span>
                            </div>
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
                          <CreditCard className="w-4 h-4" />
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
                            onClick={() => requestDelete(resident)}
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

      {/* Modal Kartu Warga Preview (Code omitted for brevity, same as before) */}
      {/* ... keeping the same ... */}
      {isCardModalOpen && selectedResidentForCard && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
           {/* max-h-[95vh] and flex-col ensures headers/footers stay visible/accessible */}
           <div className="bg-white rounded-2xl w-full max-w-3xl flex flex-col max-h-[95vh] shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Kartu Tanda Warga
                  </h3>
                  <button onClick={() => setIsCardModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
              </div>
              
              <div className="p-4 sm:p-8 bg-slate-100 flex justify-center items-center overflow-auto flex-1">
                  {/* Container Wrapper for Scaling */}
                  <div className="relative shrink-0 transition-all duration-300
                       w-[330px] h-[208px]
                       sm:w-[450px] sm:h-[284px] 
                       md:w-[600px] md:h-[378px] 
                  ">
                      <div className="w-[600px] h-[378px] bg-white rounded-xl shadow-2xl overflow-hidden relative border border-slate-200 
                                      origin-top-left transform transition-transform duration-300
                                      scale-[0.55] sm:scale-75 md:scale-100">
                          
                          {/* Background Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 z-0"></div>
                          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-white/10 z-0 transform -skew-y-6 origin-bottom-right"></div>
                          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 z-0 transform skew-x-12"></div>

                          {/* Header */}
                          <div className="absolute top-0 left-0 w-full h-24 flex items-center px-6 gap-4 z-10">
                              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-sm">
                                 <span className="text-white font-bold text-xl">RW</span>
                              </div>
                              <div className="text-white">
                                  <h2 className="text-xl font-black tracking-wide leading-none uppercase drop-shadow-sm">KARTU TANDA WARGA</h2>
                                  <p className="text-[10px] font-semibold tracking-widest mt-1 uppercase opacity-90">RT 002 / RW 006 KELURAHAN CIPADU JAYA</p>
                              </div>
                          </div>

                          {/* Content Card */}
                          <div className="absolute top-24 left-4 right-4 bottom-4 bg-white rounded-lg shadow-lg z-10 flex p-4 gap-4">
                              
                              {/* Left: Photo */}
                              <div className="flex flex-col gap-2 w-32 shrink-0">
                                 <div className="w-32 h-40 bg-slate-200 rounded-md border border-slate-300 overflow-hidden shadow-inner">
                                    <img 
                                        src={selectedResidentForCard.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedResidentForCard.name}`} 
                                        alt="Foto" 
                                        className="w-full h-full object-cover"
                                    />
                                 </div>
                                 <div className="text-center">
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        {selectedResidentForCard.gender === 'Laki-laki' ? 'PRIA' : 'WANITA'}
                                    </span>
                                 </div>
                              </div>
                              
                              {/* Middle: Data */}
                              <div className="flex-1 pt-1 overflow-hidden">
                                  <h3 className="font-bold text-2xl text-slate-800 leading-tight mb-1 truncate uppercase">{selectedResidentForCard.name}</h3>
                                  <p className="text-sm text-blue-600 font-bold font-mono mb-4 tracking-wider">{selectedResidentForCard.nik}</p>
                                  
                                  <div className="space-y-1.5 text-[11px] leading-tight text-slate-700">
                                      <div className="flex">
                                          <span className="w-16 font-semibold text-slate-500">No. KK</span>
                                          <span className="font-medium">: {selectedResidentForCard.kkNumber}</span>
                                      </div>
                                      <div className="flex">
                                          <span className="w-16 font-semibold text-slate-500">TTL</span>
                                          <span className="font-medium uppercase">: Jakarta, {selectedResidentForCard.birthDate}</span>
                                      </div>
                                      <div className="flex items-start">
                                          <span className="w-16 font-semibold text-slate-500 shrink-0">Alamat</span>
                                          <span className="font-medium uppercase text-left break-words">: {selectedResidentForCard.address}</span>
                                      </div>
                                      <div className="flex">
                                          <span className="w-16 font-semibold text-slate-500">Pekerjaan</span>
                                          <span className="font-medium uppercase">: {selectedResidentForCard.job}</span>
                                      </div>
                                      <div className="flex">
                                          <span className="w-16 font-semibold text-slate-500">Status</span>
                                          <span className="font-medium uppercase">: {selectedResidentForCard.status}</span>
                                      </div>
                                  </div>
                              </div>

                              {/* Right: QR Code & Signature */}
                              <div className="w-24 shrink-0 flex flex-col justify-between items-center pl-2 border-l border-dashed border-slate-200">
                                 <div className="w-24 h-24 bg-white p-1 rounded-lg border border-slate-200">
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                            JSON.stringify({
                                                nik: selectedResidentForCard.nik,
                                                nama: selectedResidentForCard.name
                                            })
                                        )}`}
                                        alt="QR"
                                        className="w-full h-full object-contain"
                                    />
                                 </div>
                                 <div className="text-center w-full">
                                    <p className="text-[9px] text-slate-400 mb-2 leading-tight">Berlaku<br/>Seumur Hidup</p>
                                    <div className="border-t border-slate-300 w-full pt-1">
                                        <p className="text-[10px] font-bold text-slate-800 uppercase">Ketua RT</p>
                                    </div>
                                 </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0">
                  <button 
                    onClick={() => setIsCardModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                  >
                    Tutup
                  </button>
                  <button 
                    onClick={handlePrintCard}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-200"
                  >
                    <Printer className="w-4 h-4" />
                    Cetak KTP (Ukuran Asli)
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* Modal Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Data Warga?</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        Anda akan menghapus data <strong>{deleteTarget.name}</strong>. Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setDeleteTarget(null)}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center"
                        >
                            {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </button>
                    </div>
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
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
              )}

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
                    className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none ${error && error.includes('NIK') ? 'border-red-500 bg-red-50' : 'border-slate-300'}`} 
                    value={newResident.nik || ''} 
                    onChange={e => {
                        const val = e.target.value.replace(/\D/g, ''); // Hanya angka
                        setNewResident({...newResident, nik: val});
                        if (error) setError(''); // Clear error on type
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">No. KK (Maks 16 digit)</label>
                  <input 
                    type="text" 
                    required 
                    maxLength={16}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={newResident.kkNumber || ''} 
                    onChange={e => {
                        const val = e.target.value.replace(/\D/g, ''); // Hanya angka
                        setNewResident({...newResident, kkNumber: val});
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
                  disabled={isSaving}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  {isSaving && <span className="animate-spin text-white">⟳</span>}
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