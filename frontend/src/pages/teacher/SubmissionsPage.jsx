import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Modal from '../../components/Modal'
import api from '../../api'

const statusBadge = (sub) => {
  if (sub.grade != null) return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Graded</span>
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Submitted</span>
}

export default function SubmissionsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [gradeModal, setGradeModal] = useState(null) // { submission }
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' })
  const [grading, setGrading] = useState(false)

  const fetchSubmissions = async () => {
    const res = await api.get(`/submissions/assignment/${id}`)
    return res.data || []
  }

  useEffect(() => {
    const load = async () => {
      try {
        const subs = await fetchSubmissions()
        setSubmissions(subs)
        if (subs.length > 0) setAssignment(subs[0].assignment)
        else {
          // try to get assignment from assignments endpoint
          const asRes = await api.get('/assignments/my')
          const list = asRes.data?.assignments || asRes.data || []
          const found = list.find((a) => String(a.id) === String(id))
          if (found) setAssignment(found)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const openGradeModal = (sub) => {
    setGradeModal(sub)
    setGradeForm({ grade: sub.grade ?? '', feedback: sub.feedback ?? '' })
  }

  const handleGrade = async (e) => {
    e.preventDefault()
    setGrading(true)
    try {
      await api.put(`/submissions/${gradeModal.id}/grade`, gradeForm)
      setGradeModal(null)
      const updated = await fetchSubmissions()
      setSubmissions(updated)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to grade')
    } finally {
      setGrading(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <button
          onClick={() => navigate('/assignments')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft size={15} /> Back to Assignments
        </button>
        <h2 className="text-2xl font-bold text-slate-800">
          {assignment ? assignment.title : 'Submissions'}
        </h2>
        {assignment?.course && (
          <p className="text-slate-500 text-sm mt-1">{assignment.course.title}</p>
        )}
      </motion.div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">No submissions yet</div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                      {sub.student?.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{sub.student?.name}</p>
                      <p className="text-xs text-slate-400">{sub.student?.email}</p>
                    </div>
                    {statusBadge(sub)}
                    {sub.grade != null && (
                      <span className="text-sm font-bold text-emerald-600">{sub.grade}%</span>
                    )}
                  </div>
                  <div className="ml-11">
                    <p className="text-xs text-slate-400 mb-1">Submitted {new Date(sub.submittedAt).toLocaleString()}</p>
                    {sub.content && (
                      <p className="text-sm text-slate-600 line-clamp-3 bg-slate-50 rounded-lg p-3">
                        {sub.content}
                      </p>
                    )}
                    {sub.feedback && (
                      <div className="mt-2 p-2 rounded-lg bg-emerald-50 text-xs text-emerald-700">
                        <span className="font-semibold">Feedback: </span>{sub.feedback}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openGradeModal(sub)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors flex-shrink-0"
                >
                  <CheckCircle size={13} />
                  {sub.grade != null ? 'Re-grade' : 'Grade'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!gradeModal}
        onClose={() => setGradeModal(null)}
        title={`Grade: ${gradeModal?.student?.name || ''}`}
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setGradeModal(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
            <button form="grade-form" type="submit" disabled={grading} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 transition-colors">
              {grading ? 'Saving...' : 'Save Grade'}
            </button>
          </div>
        }
      >
        {gradeModal && (
          <form id="grade-form" onSubmit={handleGrade} className="space-y-4">
            {gradeModal.content && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Student Answer</p>
                <div className="p-3 rounded-lg bg-slate-50 text-sm text-slate-600 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {gradeModal.content}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Grade (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={gradeForm.grade}
                onChange={(e) => setGradeForm((p) => ({ ...p, grade: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="0–100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Feedback (optional)</label>
              <textarea
                rows={3}
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm((p) => ({ ...p, feedback: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                placeholder="Add feedback for the student..."
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
