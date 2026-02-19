export enum Gender {
  MALE = 'Laki-laki',
  FEMALE = 'Perempuan'
}

export enum MaritalStatus {
  SINGLE = 'Belum Kawin',
  MARRIED = 'Kawin',
  DIVORCED = 'Cerai'
}

export interface Resident {
  id: string;
  nik: string;
  name: string;
  gender: Gender;
  birthDate: string;
  address: string;
  job: string;
  status: MaritalStatus;
  phone: string;
  photoUrl?: string; // Menambahkan properti foto
}

export enum DocumentType {
  KTP_INTRO = 'Pengantar KTP',
  SKCK_INTRO = 'Pengantar SKCK',
  DOMICILE = 'Surat Domisili',
  DEATH_CERT = 'Surat Kematian',
  BIRTH_CERT = 'Surat Kelahiran'
}

export enum RequestStatus {
  PENDING = 'Menunggu',
  APPROVED = 'Disetujui',
  REJECTED = 'Ditolak'
}

export interface DocumentRequest {
  id: string;
  residentId: string;
  residentName: string;
  type: DocumentType;
  date: string;
  status: RequestStatus;
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  isAIGenerated: boolean;
}

export type Role = 'ADMIN' | 'STAFF';

export interface User {
  username: string;
  name: string;
  role: Role;
  password?: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
}

export type ViewState = 'DASHBOARD' | 'RESIDENTS' | 'ANNOUNCEMENTS' | 'FINANCE' | 'SERVICES';