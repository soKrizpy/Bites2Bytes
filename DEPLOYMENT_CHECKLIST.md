# Deployment Checklist

## Vercel Environment Variables

Tambahkan semua variable ini di Vercel untuk `Production`, `Preview`, dan `Development`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

Catatan:

- `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` wajib untuk login, session refresh, dan query user biasa.
- `SUPABASE_SERVICE_ROLE_KEY` wajib untuk fitur admin seperti create user, sinkronisasi `profiles`, dan auto-create bucket storage.
- `GEMINI_API_KEY` opsional, tapi tanpa ini fitur AI progress report guru akan gagal.

## Vercel Project Settings

- Pastikan project memakai framework `Next.js`.
- Tidak perlu `vercel.json` khusus untuk versi aplikasi ini.
- Setelah mengganti env vars, lakukan redeploy penuh.
- Jika memakai custom domain, pastikan callback auth tetap mengarah ke domain aktif yang melayani route `/auth/callback`.

## Supabase Database

Jalankan `scripts/schema.sql` di Supabase SQL Editor.

Pastikan tabel berikut ada:

- `profiles`
- `badges`
- `quizzes`
- `quiz_questions`
- `exams`
- `exam_questions`
- `enrollments`
- `student_progress`
- `certificates`
- `class_sessions`
- `module_reviews`
- `payroll_slips`

## Supabase Auth

- Pastikan user admin memiliki `user_metadata.role = "admin"`.
- Pastikan user guru memiliki `user_metadata.role = "teacher"`.
- Pastikan user siswa memiliki `user_metadata.role = "student"`.
- Pastikan `user_metadata.username` terisi untuk semua akun internal.

## Supabase Profiles Sync

- Jumlah row di `profiles` idealnya minimal sama dengan jumlah user auth internal.
- Jika user auth lebih banyak daripada `profiles`, buka dashboard admin sekali setelah deploy untuk memicu sinkronisasi profile.
- Anda juga bisa menjalankan `npm run repair:supabase` dari folder project ini.

## Supabase Storage

Pastikan bucket berikut ada:

- `profile-pictures`
- `badges`

Pastikan keduanya `public`.
- Jika bucket belum ada, gunakan tombol `Repair Supabase` di dashboard admin atau jalankan `npm run repair:supabase`.

## Supabase Storage Policies

Untuk `profile-pictures`:

- Public read aktif.
- User boleh upload file pada folder miliknya sendiri: `<user-id>/avatar.ext`.
- User boleh update file pada folder miliknya sendiri.

Untuk `badges`:

- Public read aktif.
- Admin upload badge memakai service role dari server action.

## Production Smoke Test

Lakukan pengecekan ini setelah deploy:

1. Login sebagai admin.
2. Buka `/admin` dan cek panel `Audit Deployment`.
3. Buat 1 user guru dan 1 user siswa.
4. Pastikan keduanya muncul di halaman admin guru/siswa.
5. Coba hide/unhide MPIN dari tombol mata.
6. Upload foto profil pada akun guru atau siswa.
7. Upload satu badge dari admin.
8. Buat modul, topik, enrollment, lalu cek perubahan tampil tanpa stale state.
9. Jika memakai AI report, submit satu laporan guru untuk memastikan `GEMINI_API_KEY` valid.

## Current Findings From This Backup

- Tidak ada file `vercel.json` di repo, dan itu tidak masalah untuk setup sekarang.
- Bucket storage di project Supabase yang aktif masih kosong saat audit ini dilakukan.
- Jumlah user auth lebih besar daripada row `profiles`, jadi sinkronisasi profile sebelumnya memang belum lengkap.
- Karena itu, kegagalan fitur profile photo dan badge upload yang Anda lihat memang sangat mungkin dipicu environment Supabase, bukan hanya bug UI.
