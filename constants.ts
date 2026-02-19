import { Resident, Gender, MaritalStatus, DocumentRequest, DocumentType, RequestStatus, Announcement, User, Transaction } from './types';

export const MOCK_USERS = [
  {
    username: 'admin',
    password: 'password123', // Hardcoded for demo
    name: 'Bapak Ketua RT',
    role: 'ADMIN' as const
  },
  {
    username: 'staff',
    password: 'password123',
    name: 'Petugas Administrasi',
    role: 'STAFF' as const
  }
];

export const MOCK_RESIDENTS: Resident[] = [
  {
    id: '1',
    nik: '3171012001900001',
    name: 'Budi Santoso',
    gender: Gender.MALE,
    birthDate: '1990-01-20',
    address: 'Jl. Merpati No. 4B, RT 002/006',
    job: 'Wiraswasta',
    status: MaritalStatus.MARRIED,
    phone: '081234567890'
  },
  {
    id: '2',
    nik: '3171015505920002',
    name: 'Siti Aminah',
    gender: Gender.FEMALE,
    birthDate: '1992-05-15',
    address: 'Jl. Merpati No. 4B, RT 002/006',
    job: 'Ibu Rumah Tangga',
    status: MaritalStatus.MARRIED,
    phone: '081234567891'
  },
  {
    id: '3',
    nik: '3171011010850003',
    name: 'Agus Setiawan',
    gender: Gender.MALE,
    birthDate: '1985-10-10',
    address: 'Jl. Kutilang No. 10, RT 002/006',
    job: 'PNS',
    status: MaritalStatus.SINGLE,
    phone: '081234567892'
  },
  {
    id: '4',
    nik: '3171016512700004',
    name: 'Ratna Sari',
    gender: Gender.FEMALE,
    birthDate: '1970-12-25',
    address: 'Jl. Elang No. 5, RT 002/006',
    job: 'Pedagang',
    status: MaritalStatus.DIVORCED,
    phone: '081234567893'
  },
  {
    id: '5',
    nik: '3171012008000005',
    name: 'Joko Widodo',
    gender: Gender.MALE,
    birthDate: '2000-08-20',
    address: 'Jl. Pipit No. 12, RT 002/006',
    job: 'Mahasiswa',
    status: MaritalStatus.SINGLE,
    phone: '081234567894'
  }
];

export const MOCK_REQUESTS: DocumentRequest[] = [
  {
    id: 'R1',
    residentId: '1',
    residentName: 'Budi Santoso',
    type: DocumentType.DOMICILE,
    date: '2023-10-25',
    status: RequestStatus.PENDING
  },
  {
    id: 'R2',
    residentId: '3',
    residentName: 'Agus Setiawan',
    type: DocumentType.SKCK_INTRO,
    date: '2023-10-24',
    status: RequestStatus.APPROVED,
    notes: 'Surat sudah diambil'
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'A1',
    title: 'Kerja Bakti Minggu Ini',
    content: 'Diberitahukan kepada seluruh warga RT 002 RW 006 untuk mengikuti kegiatan kerja bakti membersihkan lingkungan pada hari Minggu, 29 Oktober 2023 pukul 07.00 WIB. Diharapkan membawa peralatan kebersihan masing-masing.',
    date: '2023-10-25',
    isAIGenerated: false
  },
  {
    id: 'A2',
    title: 'Jadwal Posyandu Balita',
    content: 'Posyandu Balita bulan November akan dilaksanakan pada tanggal 5 November 2023 di Balai Warga. Mohon ibu-ibu membawa balitanya untuk penimbangan dan imunisasi.',
    date: '2023-10-26',
    isAIGenerated: true
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'T1',
    date: '2023-10-01',
    description: 'Iuran Warga Bulan Oktober',
    category: 'Iuran Wajib',
    amount: 2500000,
    type: 'INCOME'
  },
  {
    id: 'T2',
    date: '2023-10-05',
    description: 'Perbaikan Lampu Jalan',
    category: 'Infrastruktur',
    amount: 350000,
    type: 'EXPENSE'
  },
  {
    id: 'T3',
    date: '2023-10-15',
    description: 'Konsumsi Kerja Bakti',
    category: 'Kegiatan',
    amount: 150000,
    type: 'EXPENSE'
  }
];