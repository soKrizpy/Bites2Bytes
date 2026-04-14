import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import React from 'react'
import { renderToStream } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  borderBox: { flex: 1, border: '5pt solid #1e3a8a', padding: 30, textAlign: 'center', display: 'flex', flexDirection: 'column', position: 'relative' },
  header: { fontSize: 36, fontWeight: 'bold', color: '#10b981', marginTop: 20 },
  subHeader: { fontSize: 16, color: '#64748b', marginTop: 10, letterSpacing: 2 },
  awardedTo: { fontSize: 14, color: '#334155', marginTop: 50 },
  studentName: { fontSize: 32, fontWeight: 'bold', color: '#0f172a', marginTop: 15, borderBottom: '1pt solid #cbd5e1', paddingBottom: 10, marginLeft: 50, marginRight: 50 },
  forCompleting: { fontSize: 14, color: '#334155', marginTop: 20 },
  moduleTitle: { fontSize: 24, fontWeight: 'bold', color: '#8b5cf6', marginTop: 10 },
  scoreBox: { marginTop: 30, backgroundColor: '#f8fafc', padding: 15, marginHorizontal: 100, borderRadius: 8 },
  scoreText: { fontSize: 14, color: '#0f172a', fontWeight: 'bold' },
  dateText: { fontSize: 12, color: '#94a3b8', marginTop: 40 },
  certNumber: { fontSize: 10, color: '#cbd5e1', position: 'absolute', bottom: 10, left: 10 },
  qrPlaceholder: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, border: '2pt solid #e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  qrText: { fontSize: 8, color: '#94a3b8' }
});

interface CertificateRecord {
  exam_score: number
  issued_at: string
  certificate_number: string
  modules?: { title?: string | null }[] | { title?: string | null } | null
  profiles?: { full_name?: string | null; username?: string | null }[] | { full_name?: string | null; username?: string | null } | null
}

const CertificateTemplate = ({ cert, studentName, moduleTitle }: { cert: CertificateRecord; studentName: string; moduleTitle: string }) => {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.borderBox}>
           {/* HEADER */}
           <Text style={styles.header}>CERTIFICATE OF ACHIEVEMENT</Text>
           <Text style={styles.subHeader}>PROUDLY PRESENTED BY BITES2BYTES EDUCATIONAL CENTER</Text>

           {/* BODY */}
           <Text style={styles.awardedTo}>This is to certify that</Text>
           <Text style={styles.studentName}>{studentName.toUpperCase()}</Text>
           
           <Text style={styles.forCompleting}>has successfully completed the program</Text>
           <Text style={styles.moduleTitle}>{moduleTitle}</Text>

           <View style={styles.scoreBox}>
              <Text style={styles.scoreText}>Final Final Exam Score: {cert.exam_score} / 100</Text>
           </View>

           <Text style={styles.dateText}>Issued on: {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>

           {/* FOOTER */}
           <Text style={styles.certNumber}>Verify ID: {cert.certificate_number}</Text>
           <View style={styles.qrPlaceholder}>
              <Text style={styles.qrText}>Verif QR</Text>
           </View>
        </View>
      </Page>
    </Document>
  )
}

export async function GET(req: NextRequest, props: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = await props.params
  const supabase = await createClient()

  // Ambil data sertifikat dan join profile siswa + modul
  const { data: cert } = await supabase
    .from('certificates')
    .select(`
      *,
      modules (title),
      profiles!certificates_student_id_fkey (full_name, username)
    `)
    .eq('id', certificateId)
    .single()

  if (!cert) return new NextResponse('Sertifikat tidak ditemukan.', { status: 404 })

  const profile = Array.isArray(cert.profiles) ? cert.profiles[0] : cert.profiles
  const moduleRecord = Array.isArray(cert.modules) ? cert.modules[0] : cert.modules
  const studentName = profile?.full_name || profile?.username || 'Student'
  const moduleTitle = moduleRecord?.title || 'Unknown Module'

  const stream = await renderToStream(
     <CertificateTemplate cert={cert} studentName={studentName} moduleTitle={moduleTitle} />
  )

  return new NextResponse(stream as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Certificate_${studentName}.pdf"`,
    },
  })
}
