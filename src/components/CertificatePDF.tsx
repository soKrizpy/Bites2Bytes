import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'

// Register font (AntriGravity doesn't have local fonts, so we use standard ones or Google Fonts if needed)
// For simplicity, we use Helvetica (standard in react-pdf)

const styles = StyleSheet.create({
  page: {
    padding: 60,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    border: '10pt solid #3b82f6',
  },
  innerBorder: {
    padding: 40,
    border: '2pt solid #60a5fa',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 800,
    color: '#1e3a8a',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 30,
  },
  studentName: {
    fontSize: 32,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 20,
    textDecoration: 'underline',
  },
  description: {
    fontSize: 14,
    lineHeight: 1.5,
    color: '#475569',
    marginBottom: 40,
    maxWidth: '80%',
  },
  stats: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 50,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
  },
  footer: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    borderTop: '1pt solid #e2e8f0',
    paddingTop: 20,
  },
  certNumber: {
    fontSize: 10,
    color: '#94a3b8',
  },
  branding: {
    fontSize: 12,
    fontWeight: 700,
    color: '#3b82f6',
  }
})

interface CertificatePDFProps {
  studentName: string
  moduleTitle: string
  examScore: number
  date: string
  certNumber: string
}

export const CertificatePDF = ({ studentName, moduleTitle, examScore, date, certNumber }: CertificatePDFProps) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.innerBorder}>
        <Text style={styles.branding}>BITES2BYTES ONLINE LEARNING</Text>
        <Text style={styles.title}>Sertifikat Kelulusan</Text>
        <Text style={styles.subtitle}>Diberikan dengan bangga kepada:</Text>
        
        <Text style={styles.studentName}>{studentName}</Text>
        
        <Text style={styles.description}>
          Atas keberhasilannya menyelesaikan kurikulum pembelajaran pada modul "{moduleTitle}" 
          dengan predikat memuaskan melalui platform Bites2Bytes.
        </Text>
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Skor Ujian Akhir</Text>
            <Text style={styles.statValue}>{examScore}/100</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tanggal Terbit</Text>
            <Text style={styles.statValue}>{date}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.certNumber}>Verify ID: {certNumber}</Text>
          <Text style={styles.branding}>B2B Verified Learning Path</Text>
        </View>
      </View>
    </Page>
  </Document>
)
