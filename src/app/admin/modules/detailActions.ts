'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// =============================
// QUIZZES
// =============================

export async function createQuizAction(formData: FormData) {
  const supabase = await createClient()
  
  const topic_id = formData.get('topic_id') as string
  const title = formData.get('title') as string
  const passing_score = parseInt(formData.get('passing_score') as string) || 70
  const badge_id = formData.get('badge_id') as string || null

  if (!topic_id || !title) {
    return { success: false, error: 'Topic and title are required.' }
  }

  const { error } = await supabase
    .from('quizzes')
    .insert({ topic_id, title, passing_score, badge_id })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/modules/[moduleId]', 'page')
  return { success: true, message: 'Quiz created successfully!' }
}

export async function deleteQuizAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('quizzes').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/modules/[moduleId]', 'page')
  return { success: true }
}

// =============================
// QUIZ QUESTIONS
// =============================

export async function addQuizQuestionAction(formData: FormData) {
  const supabase = await createClient()
  
  const quiz_id = formData.get('quiz_id') as string
  const question = formData.get('question') as string
  const option_a = formData.get('option_a') as string
  const option_b = formData.get('option_b') as string
  const option_c = formData.get('option_c') as string
  const option_d = formData.get('option_d') as string
  const correct_answer = formData.get('correct_answer') as string
  const sort_order = parseInt(formData.get('sort_order') as string) || 0

  if (!quiz_id || !question || !correct_answer) {
    return { success: false, error: 'Mandatory fields are missing.' }
  }

  const { error } = await supabase
    .from('quiz_questions')
    .insert({ quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, sort_order })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/modules/[moduleId]', 'page')
  return { success: true, message: 'Question added!' }
}

export async function deleteQuizQuestionAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('quiz_questions').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/modules/[moduleId]', 'page')
  return { success: true }
}

// =============================
// EXAMS
// =============================

export async function createExamAction(formData: FormData) {
  const supabase = await createClient()
  
  const module_id = formData.get('module_id') as string
  const title = formData.get('title') as string
  const passing_score = parseInt(formData.get('passing_score') as string) || 75

  if (!module_id || !title) {
    return { success: false, error: 'Module and title are required.' }
  }

  const { error } = await supabase
    .from('exams')
    .insert({ module_id, title, passing_score })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/modules/[moduleId]', 'page')
  return { success: true, message: 'Exam created successfully!' }
}

// =============================
// EXAM QUESTIONS
// =============================

export async function addExamQuestionAction(formData: FormData) {
  const supabase = await createClient()
  
  const exam_id = formData.get('exam_id') as string
  const question = formData.get('question') as string
  const option_a = formData.get('option_a') as string
  const option_b = formData.get('option_b') as string
  const option_c = formData.get('option_c') as string
  const option_d = formData.get('option_d') as string
  const correct_answer = formData.get('correct_answer') as string
  const sort_order = parseInt(formData.get('sort_order') as string) || 0

  if (!exam_id || !question || !correct_answer) {
    return { success: false, error: 'Mandatory fields are missing.' }
  }

  const { error } = await supabase
    .from('exam_questions')
    .insert({ exam_id, question, option_a, option_b, option_c, option_d, correct_answer, sort_order })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/modules/[moduleId]', 'page')
  return { success: true, message: 'Question added!' }
}

export async function deleteExamQuestionAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('exam_questions').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/modules/[moduleId]', 'page')
  return { success: true }
}
