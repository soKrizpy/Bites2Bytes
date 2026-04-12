-- ============================================================
-- Bites2Bytes — Database Schema
-- Jalankan di Supabase SQL Editor (Project > SQL Editor > New Query)
-- ============================================================

-- =============================
-- 1. PROFILES
-- =============================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  photo_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================
-- 2. ALTER TOPICS (tambah kolom materi)
-- =============================
ALTER TABLE topics
  ADD COLUMN IF NOT EXISTS drive_link TEXT,
  ADD COLUMN IF NOT EXISTS canva_link TEXT;

-- =============================
-- 3. BADGES (master data badge custom)
-- =============================
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,  -- URL dari Supabase Storage bucket 'badges'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================
-- 4. QUIZZES (kuis per topik)
-- =============================
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  passing_score INT DEFAULT 70 CHECK (passing_score BETWEEN 0 AND 100),
  badge_id UUID REFERENCES badges(id) ON DELETE SET NULL,  -- badge yang diberikan jika lulus
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================
-- 5. QUIZ QUESTIONS (soal kuis)
-- =============================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  sort_order INT DEFAULT 0
);

-- =============================
-- 6. EXAMS (ujian akhir modul)
-- =============================
CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  passing_score INT DEFAULT 75 CHECK (passing_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id)  -- satu modul hanya punya satu ujian akhir
);

-- =============================
-- 7. EXAM QUESTIONS (soal ujian)
-- =============================
CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  sort_order INT DEFAULT 0
);

-- =============================
-- 8. ENROLLMENTS (guru - siswa - modul)
-- =============================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  zoom_link TEXT,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, student_id, module_id)
);

-- =============================
-- 9. STUDENT PROGRESS (progress belajar per topik)
-- =============================
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  quiz_score INT CHECK (quiz_score BETWEEN 0 AND 100),
  badge_earned BOOLEAN DEFAULT FALSE,
  badge_id UUID REFERENCES badges(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, topic_id)
);

-- =============================
-- 10. CERTIFICATES (sertifikat yang diterbitkan)
-- =============================
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  exam_score INT NOT NULL CHECK (exam_score BETWEEN 0 AND 100),
  certificate_number TEXT UNIQUE NOT NULL DEFAULT ('CERT-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8))),
  issued_by UUID REFERENCES auth.users(id),  -- teacher yang mengeluarkan, NULL jika otomatis
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, module_id)
);

-- ============================================================
-- STORAGE BUCKETS (Jalankan via Supabase Dashboard > Storage)
-- Atau jalankan via SQL berikut:
-- ============================================================

-- Bucket untuk foto profil (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket untuk gambar badge (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('badges', 'badges', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES
-- ============================================================

-- Profile pictures: siapa pun bisa lihat, hanya user sendiri yang bisa upload
CREATE POLICY "Public read profile pictures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users upload own profile picture"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "Users update own profile picture"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile-pictures' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

-- Badge images: siapa pun bisa lihat, hanya admin yang bisa upload
CREATE POLICY "Public read badges"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'badges');

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Untuk saat ini dinonaktifkan agar admin bisa akses semua.
-- Aktifkan bertahap setelah sistem stabil.
-- ============================================================

-- Disable RLS untuk semua tabel baru (konsisten dengan existing tables)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE certificates DISABLE ROW LEVEL SECURITY;

-- =============================
-- 11. NEW COLUMNS (REVISION V4)
-- =============================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plain_mpin TEXT;

-- =============================
-- 12. CLASS SESSIONS (Attendance & Earning)
-- =============================
CREATE TABLE IF NOT EXISTS class_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  session_date TIMESTAMPTZ NOT NULL,
  zoom_link_override TEXT, -- jika null, gunakan enrollment zoom_link
  student_joined BOOLEAN DEFAULT FALSE,
  report_submitted BOOLEAN DEFAULT FALSE,
  ai_progress_report TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enrollment_id, topic_id)
);

-- =============================
-- 13. MODULE REVIEWS (End of Module Report)
-- =============================
CREATE TABLE IF NOT EXISTS module_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE NOT NULL,
  final_review_pdf_url TEXT,
  activity_suggestions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enrollment_id)
);

-- =============================
-- 14. PAYROLL SLIPS (Keuangan Guru)
-- =============================
CREATE TABLE IF NOT EXISTS payroll_slips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_paid INT NOT NULL,
  slip_date TIMESTAMPTZ DEFAULT NOW(),
  slip_pdf_url TEXT,
  processed_by UUID REFERENCES auth.users(id) -- admin siapa yang memproses
);

-- Disable RLS untuk tabel-tabel baru
ALTER TABLE class_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE module_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_slips DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- DONE! Semua tabel berhasil dibuat.
-- ============================================================
