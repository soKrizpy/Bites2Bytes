import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import TopicSection from '../module-detail/TopicSection'
import ExamManagement from '../module-detail/ExamManagement'

interface PageProps {
    params: Promise<{ moduleId: string }>
}

export default async function ModuleDetailPage({ params }: PageProps) {
    const { moduleId } = await params
    const supabase = await createClient()

    // 1. Ambil Modul
    const { data: module, error: modError } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single()

    if (modError || !module) {
        return (
            <div className="page-wrapper">
                <p className="alert alert-error">Module not found.</p>
                <a href="/admin/modules" className="btn btn-ghost">← Back to Modules</a>
            </div>
        )
    }

    // 2. Ambil Topik dan Kuisnya
    const { data: topics } = await supabase
        .from('topics')
        .select(`
            *,
            quizzes (
                *,
                quiz_questions (*)
            )
        `)
        .eq('module_id', moduleId)
        .order('sort_order', { ascending: true })

    // 3. Ambil Ujian Modul
    const { data: exam } = await supabase
        .from('exams')
        .select(`
            *,
            exam_questions (*)
        `)
        .eq('module_id', moduleId)
        .single()

    // 4. Ambil Badge untuk pilihan saat buat kuis
    const { data: badges } = await supabase
        .from('badges')
        .select('*')

    return (
        <>
            <Navbar role="admin" />
            <div className="page-wrapper">
                <div style={{ marginBottom: '0.5rem' }}>
                    <a href="/admin/modules" style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>← Kembali ke Modul</a>
                </div>
                <h1 className="header">⚙️ Atur Konten Modul</h1>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    {module.title}
                </h2>

                <div className="grid-auto" style={{ alignItems: 'start', gridTemplateColumns: '2fr 1fr' }}>
                    {/* Daftar Topik & Kuis */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <TopicSection 
                            moduleId={moduleId}
                            topics={topics || []} 
                            badges={badges || []}
                        />
                    </div>

                    {/* Ujian Modul */}
                    <div>
                        <ExamManagement 
                            moduleId={moduleId}
                            exam={exam}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
