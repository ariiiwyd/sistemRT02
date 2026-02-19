import { supabase } from './supabaseClient';
import { Resident, Transaction, Announcement } from '../types';
import { MOCK_RESIDENTS, MOCK_TRANSACTIONS, MOCK_ANNOUNCEMENTS } from '../constants';

// --- HELPER: Mapping Snake Case (DB) <-> Camel Case (App) ---
const mapResidentFromDB = (data: any): Resident => ({
    id: data.id,
    nik: data.nik,
    kkNumber: data.kk_number,
    name: data.name,
    gender: data.gender,
    birthDate: data.birth_date,
    address: data.address,
    job: data.job,
    status: data.status,
    phone: data.phone,
    photoUrl: data.photo_url
});

const mapResidentToDB = (data: Resident) => ({
    id: data.id,
    nik: data.nik,
    kk_number: data.kkNumber,
    name: data.name,
    gender: data.gender,
    birth_date: data.birthDate,
    address: data.address,
    job: data.job,
    status: data.status,
    phone: data.phone,
    photo_url: data.photoUrl
});

// --- SERVICE IMPLEMENTATION ---

export const db = {
    residents: {
        getAll: async (): Promise<Resident[]> => {
            if (supabase) {
                const { data, error } = await supabase.from('residents').select('*');
                if (error) {
                    console.error("Supabase Error:", error);
                    return [];
                }
                return data.map(mapResidentFromDB);
            } else {
                const local = localStorage.getItem('sipintar_residents');
                return local ? JSON.parse(local) : MOCK_RESIDENTS;
            }
        },
        save: async (resident: Resident) => {
            if (supabase) {
                const { error } = await supabase.from('residents').upsert(mapResidentToDB(resident));
                if (error) console.error("Supabase Error:", error);
            } else {
                // LocalStorage logic handled by App.tsx effects, but we can return true here
            }
        },
        delete: async (id: string) => {
            if (supabase) {
                const { error } = await supabase.from('residents').delete().eq('id', id);
                if (error) console.error("Supabase Error:", error);
            }
        }
    },
    
    transactions: {
        getAll: async (): Promise<Transaction[]> => {
            if (supabase) {
                const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
                if (error) return [];
                return data as Transaction[];
            } else {
                const local = localStorage.getItem('sipintar_transactions');
                return local ? JSON.parse(local) : MOCK_TRANSACTIONS;
            }
        },
        save: async (transaction: Transaction) => {
             if (supabase) {
                const { error } = await supabase.from('transactions').upsert(transaction);
                if (error) console.error("Supabase Error:", error);
            }
        },
        delete: async (id: string) => {
             if (supabase) {
                const { error } = await supabase.from('transactions').delete().eq('id', id);
                if (error) console.error("Supabase Error:", error);
            }
        }
    },

    announcements: {
        getAll: async (): Promise<Announcement[]> => {
            if (supabase) {
                const { data, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });
                 // Map is_ai_generated snake_case to camelCase if needed, but here it matches mostly
                 if (error) return [];
                 return data.map((d: any) => ({
                     id: d.id,
                     title: d.title,
                     content: d.content,
                     date: d.date,
                     isAIGenerated: d.is_ai_generated
                 }));
            } else {
                const local = localStorage.getItem('sipintar_announcements');
                return local ? JSON.parse(local) : MOCK_ANNOUNCEMENTS;
            }
        },
        save: async (announcement: Announcement) => {
             if (supabase) {
                const payload = {
                    id: announcement.id,
                    title: announcement.title,
                    content: announcement.content,
                    date: announcement.date,
                    is_ai_generated: announcement.isAIGenerated
                };
                const { error } = await supabase.from('announcements').upsert(payload);
                if (error) console.error("Supabase Error:", error);
            }
        }
    }
};