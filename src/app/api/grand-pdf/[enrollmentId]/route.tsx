import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import React from 'react'
import { renderToStream } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#f8fafc' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1e3a8a', textAlign: 'center' },
  subHeader: { fontSize: 14, color: '#64748b', marginBottom: 10, textAlign: 'center' },
  infoBox: { padding: 15, borderRadius: 8, backgroundColor: '#ffffff', marginBottom: 20, border: '1pt solid #e2e8f0' },
  infoLabel: { fontSize: 10, color: '#94a3b8', marginBottom: 4 },
  infoValue: { fontSize: 14, color: '#0f172a', fontWeight: 'bold', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginTop: 20, marginBottom: 10 },
  paragraph: { fontSize: 12, lineHeight: 1.6, color: '#334155', marginBottom: 10 },
  bulletList: { marginTop: 10, marginBottom: 10 },
  bulletItem: { flexDirection: 'row', marginBottom: 5 },
  bulletPoint: { width: 15, fontSize: 12, color: '#8b5cf6' },
  bulletText: { flex: 1, fontSize: 12, lineHeight: 1.5, color: '#334155' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 10, color: '#94a3b8', borderTop: '1pt solid #e2e8f0', paddingTop: 10 }
});

const GrandPDFTemplate = ({ review, enrollment, sessions }: any) => {
  const studentName = enrollment?.profiles?.full_name || enrollment?.profiles?.username || 'Siswa'
  const moduleName = enrollment?.modules?.title || 'Modul'
  
  // Pisahkan suggestions dari tanda minus jika ada
  const suggestions = review?.activity_suggestions?.split('\n').map((s: string) => s.replace(/^- /, '').trim()).filter(Boolean) || []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
         {/* HEADER */}
         <Text style={styles.header}>The Grand Progress Report</Text>
         <Text style={styles.subHeader}>Bites2Bytes EdTech Learning Center</Text>

         {/* BIO */}
         <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>NAMA SISWA</Text>
            <Text style={styles.infoValue}>{studentName}</Text>

            <Text style={styles.infoLabel}>PROGRAM BELAJAR</Text>
            <Text style={styles.infoValue}>{moduleName}</Text>
            
            <Text style={styles.infoLabel}>TOTAL SESI SELESAI</Text>
            <Text style={styles.infoValue}>{sessions?.length || 0} Pertemuan</Text>
         </View>

         {/* FINAL REVIEW AI */}
         <Text style={styles.sectionTitle}>👨‍🏫 Review Komprehensif Mentor</Text>
         <View style={{ backgroundColor: '#ffffff', padding: 15, borderRadius: 8, border: '1pt solid #cbd5e1' }}>
            <Text style={styles.paragraph}>{review?.final_review_pdf_url || 'Tidak ada review.'}</Text>
         </View>

         {/* SARAN AKTIVITAS */}
         <Text style={styles.sectionTitle}>💡 Rekomendasi Aktivitas Orang Tua</Text>
         <View style={styles.bulletList}>
            {suggestions.map((sug: string, idx: number) => (
               <View key={idx} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{sug}</Text>
               </View>
            ))}
         </View>

         <Text style={styles.footer}>Dokumen ini diterbitkan secara otomatis oleh Bites2Bytes AI Teacher System.</Text>
      </Page>
    </Document>
  )
}

export async function GET(req: NextRequest, props: { params: Promise<{ enrollmentId: string }> }) {
  const { enrollmentId } = await props.params
  const adminClient = createAdminClient()

  const { data: review } = await adminClient.from('module_reviews').select('*').eq('enrollment_id', enrollmentId).single()
  if (!review) return new NextResponse('Review belum di-generate.', { status: 404 })

  const { data: enrollment } = await adminClient.from('enrollments')
      .select('modules(title), profiles!enrollments_student_id_fkey(full_name, username)')
      .eq('id', enrollmentId)
      .single()

  const { data: sessions } = await adminClient.from('class_sessions').select('id').eq('enrollment_id', enrollmentId).eq('report_submitted', true)

  const stream = await renderToStream(<GrandPDFTemplate review={review} enrollment={enrollment} sessions={sessions} />)

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Progress_${(enrollment?.modules as any)?.title || 'Report'}.pdf"`,
    },
  })
}
