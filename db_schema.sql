-- 1. Tabel Residents (Warga)
CREATE TABLE residents (
    id TEXT PRIMARY KEY,
    nik TEXT NOT NULL,
    kk_number TEXT NOT NULL,
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    birth_date DATE NOT NULL,
    address TEXT NOT NULL,
    job TEXT,
    status TEXT NOT NULL,
    phone TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabel Transactions (Keuangan)
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabel Announcements (Pengumuman)
CREATE TABLE announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date DATE NOT NULL,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS) - Optional: Disable for public demo
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Allow Public Read/Write for Demo Purpose)
-- WARNING: In production, restrict this to authenticated users only
CREATE POLICY "Public Access Residents" ON residents FOR ALL USING (true);
CREATE POLICY "Public Access Transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Public Access Announcements" ON announcements FOR ALL USING (true);