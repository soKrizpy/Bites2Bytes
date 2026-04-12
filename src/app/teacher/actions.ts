'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateZoomLinkFromTeacherAction(enrollmentId: string, zoomLink: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Tidak terautentikasi.' }

  // Pastikan hanya guru pemilik enrollment yang bisa update
  const { error } = await supabase
    .from('enrollments')
    .update({ zoom_link: zoomLink })
    .eq('id', enrollmentId)
    .eq('teacher_id', user.id) // security: only own enrollments

  if (error) return { success: false, error: error.message }

  revalidatePath('/teacher')
  return { success: true }
}

export async function giveBadgeAction(studentId: string, topicId: string, badgeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Tidak terautentikasi.' }

  const { error } = await supabase
    .from('student_progress')
    .upsert({
      student_id: studentId,
      topic_id: topicId,
      badge_earned: true,
      badge_id: badgeId,
    }, { onConflict: 'student_id,topic_id' })

  if (error) return { success: false, error: error.message }

  revalidatePath(`/teacher/students/${studentId}`)
  return { success: true, message: 'Badge berhasil diberikan!' }
}

export async function issueCertificateAction(studentId: string, moduleId: string, examScore: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Tidak terautentikasi.' }

  const { error } = await supabase
    .from('certificates')
    .upsert({
      student_id: studentId,
      module_id: moduleId,
      exam_score: examScore,
      issued_by: user.id,
    }, { onConflict: 'student_id,module_id' })

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Sertifikat sudah pernah diterbitkan untuk siswa ini.' }
    return { success: false, error: error.message }
  }

  revalidatePath(`/teacher/students/${studentId}`)
  revalidatePath(`/student`)
  return { success: true, message: 'Sertifikat berhasil diterbitkan!' }
}

import { GoogleGenAI } from '@google/genai'

export async function submitAIReportAction(enrollmentId: string, topicId: string, rawNotes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Tidak terautentikasi.' }

  const apiKey = process.env.GEMINI_API_KEY || ''
  if (!apiKey) return { success: false, error: 'GEMINI_API_KEY belum diset. Hubungi Admin.' }

  try {
     const ai = new GoogleGenAI({ apiKey })
     const prompt = `Anda adalah seorang pendamping belajar / mentor psikologi anak. Guru memberikan catatan kasar dan singkat berikut mengenai anak muridnya: "${rawNotes}". 
Tugas Anda: Poles catatan singkat tersebut menjadi paragraf laporan evaluasi (Progress Report) yang hangat, profesional, konstruktif, dan penuh semangat untuk disajikan kepada orang tua anak di tab Parent Hub mereka. 
Gunakan nada bersahabat, hindari kesan menyalahkan anak jika lambat, berikan dorongan. Panjang maksimal 3-5 kalimat ringkas. TIDAK BOLEH MENGGUNAKAN MARKDOWN. HANYA TEKS BIASA.`

     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
     })
     
     const aiReport = response.text || 'Catatan telah diterima (Gagal digenerate AI).'

     // Update class_sessions
     const { error } = await supabase
       .from('class_sessions')
       .update({
         report_submitted: true,
         ai_progress_report: aiReport
       })
       .eq('enrollment_id', enrollmentId)
       .eq('topic_id', topicId)

     if (error) return { success: false, error: error.message }

     // Revalidate
     revalidatePath('/teacher')
     const { data: en } = await supabase.from('enrollments').select('student_id').eq('id', enrollmentId).single()
     if (en?.student_id) {
       revalidatePath(`/teacher/students/${en.student_id}`)
     }
     
     return { success: true }
  } catch (err: any) {
     return { success: false, error: err.message }
  }
}

export async function generateGrandReviewAction(enrollmentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Tidak terautentikasi.' }

  // 1. Ambil semua class_sessions yang sudah dilaporkan
  const { data: sessions } = await supabase
    .from('class_sessions')
    .select('topic_id, ai_progress_report')
    .eq('enrollment_id', enrollmentId)
    .eq('report_submitted', true)
    
  if (!sessions || sessions.length < 1) {
     return { success: false, error: 'Belum ada progress report satupun di modul ini.' }
  }

  const reportsText = sessions.map((s, i) => `Sesi ${i+1}: ${s.ai_progress_report}`).join('\n')

  const apiKey = process.env.GEMINI_API_KEY || ''
  if (!apiKey) return { success: false, error: 'GEMINI_API_KEY belum diset.' }

  try {
     const ai = new GoogleGenAI({ apiKey })
     const prompt = `Anda adalah seorang ahli pendidikan anak. Berikut adalah daftar rangkuman perkembangan anak selama modul kursus ini berlangsung:
${reportsText}

Tugas Anda:
Buatlah rangkuman akhir yang disebut "Final Review" (2 paragraf hangat dan komprehensif) dan "Rekomendasi Aktivitas Otonom" (3 bullet poin untuk orang tua jadikan latihan di rumah).
Format balasanmu harus EXACTLY SEPERTI INI (tanpa markdown tambahan):
FINAL REVIEW:
(paragraf anda...)

SARAN AKTIVITAS:
- (saran 1)
- (saran 2)
- (saran 3)`

     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
     })
     
     const resultText = response.text || ''
     const splitIndex = resultText.indexOf('SARAN AKTIVITAS:')
     
     let finalReview = resultText
     let suggestions = ''
     if (splitIndex !== -1) {
        finalReview = resultText.substring(0, splitIndex).replace('FINAL REVIEW:', '').trim()
        suggestions = resultText.substring(splitIndex).replace('SARAN AKTIVITAS:', '').trim()
     }

     // Upsert module_reviews
     const { error } = await supabase
       .from('module_reviews')
       .upsert({
         enrollment_id: enrollmentId,
         final_review_pdf_url: finalReview, // Kita pinjam kolom ini sementara untuk menyimpan teks review (karena schema V4 menggunakan ini)
         activity_suggestions: suggestions
       }, { onConflict: 'enrollment_id' })

     if (error) return { success: false, error: error.message }

     const { data: enrollment } = await supabase.from('enrollments').select('student_id').eq('id', enrollmentId).single()
     if (enrollment?.student_id) {
         revalidatePath(`/teacher/students/${enrollment.student_id}`)
         revalidatePath('/student/parent-hub')
     }

     return { success: true }
  } catch (err: any) {
     return { success: false, error: err.message }
  }
}


