import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Send, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Table from '../components/Table'
import Modal from '../components/Modal'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const statusBadge = (val) => {
  const colors = {
    pending: 'bg-amber-50 text-amber-700',
    submitted: 'bg-blue-50 text-blue-700',
    graded: 'bg-emerald-50 text-emerald-700',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[val] || 'bg-slate-100 text-slate-600'}`}>
      {val ? val.charAt(0).toUpperCase() + val.slice(1) : 'Pending'}
    </span>
  )
}

export default function AssignmentsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createModal, setCreateModal] = useState(false)
  const [submitModal, setSubmitModal] = useState(null) // { assignment }
  const [viewModal, setViewModal] = useState(null)    // { submission, assignment }
  const [form, setForm] = useState({ title: '', description: '', courseId: '', dueDate: '' })
  const [submitContent, setSubmitContent] = useState('')
  const [courses, setCourses] = useState([])
  const [creating, setCreating] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin'

  const fetchAssignments = async () => {
    const res = await api.get('/assignments/my')
    return res.data?.assignments || res.data || []
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAssignments()
        setAssignments(data)
        if (isTeacher) {
          const coursesRes = await api.get('/courses/my')
          setCourses(coursesRes.data?.courses || coursesRes.data || [])
        }
      } catch {
        // keep empty
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isTeacher])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/assignments', form)
      setCreateModal(false)
      setForm({ title: '', description: '', courseId: '', dueDate: '' })
      const data = await fetchAssignments()
      setAssignments(data)
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create assignment')
    } finally {
      setCreating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/submissions', {
        assignmentId: submitModal.assignment.id,
        content: submitContent,
      })
      setSubmitModal(null)
      setSubmitContent('')
      const data = await fetchAssignments()
      setAssignments(data)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const studentColumns = [
    { key: 'title', label: 'Assignment' },
    { key: 'courseName', label: 'Course' },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (val) => val ? new Date(val).toLocaleDateString() : '-',
    },
    { key: 'status', label: 'Status', render: statusBadge },
    {
      key: 'grade',
      label: 'Grade',
      render: (val) => val != null ? `${val}%` : '-',
    },
    {
      key: 'id',
      label: 'Action',
      render: (_, row) => {
        if (row.status === 'graded') {
          return (
            <button
              onClick={() => setViewModal({ submission: row.submissions?.[0], assignment: row })}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-800"
            >
              <Eye size={13} /> View
            </button>
          )
        }
        if (row.status === 'submitted') {
          return (
            <button
              onClick={() => setViewModal({ submission: row.submissions?.[0], assignment: row })}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              <Eye size={13} /> Submitted
            </button>
          )
        }
        return (
          <button
            onClick={() => { setSubmitModal({ assignment: row }); setSubmitContent('') }}
            className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-800"
          >
            <Send size={13} /> Submit
          </button>
        )
      },
    },
  ]

  const teacherColumns = [
    { key: 'title', label: 'Assignment' },
    { key: 'courseName', label: 'Course' },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (val) => val ? new Date(val).toLocaleDateString() : '-',
    },
    {
      key: 'submissionCount',
      label: 'Submissions',
      render: (val) => val ?? 0,
    },
    {
      key: 'id',
      label: 'Action',
      render: (val) => (
        <button
          onClick={() => navigate(`/assignments/${val}/submissions`)}
          className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-800"
        >
          <Eye size={13} /> View
        </button>
      ),
    },
  ]

  const columns = isTeacher ? teacherColumns : studentColumns
  const filtered = assignments.filter((a) =>
    !search || a.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Assignments</h2>
          <p className="text-slate-500 text-sm mt-1">
            {isTeacher ? 'Manage and grade assignments' : 'View and submit your assignments'}
          </p>
        </div>
        <div className="sm:ml-auto flex items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>
          {isTeacher && (
            <button
              onClick={() => setCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <Plus size={16} />
              New Assignment
            </button>
          )}
        </div>
      </motion.div>

      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No assignments found" />

      {/* Create Assignment Modal (Teacher) */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Assignment"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setCreateModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
            <button form="create-assignment-form" type="submit" disabled={creating} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 transition-colors">
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        }
      >
        <form id="create-assignment-form" onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input type="text" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" placeholder="Assignment title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none" placeholder="Assignment instructions..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Course</label>
            <select required value={form.courseId} onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition">
              <option value="">Select a course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
            <input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" />
          </div>
        </form>
      </Modal>

      {/* Submit Assignment Modal (Student) */}
      <Modal
        isOpen={!!submitModal}
        onClose={() => setSubmitModal(null)}
        title={`Submit: ${submitModal?.assignment?.title || ''}`}
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setSubmitModal(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
            <button form="submit-assignment-form" type="submit" disabled={submitting} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 transition-colors">
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        }
      >
        {submitModal && (
          <form id="submit-assignment-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 text-sm text-slate-600">
              {submitModal.assignment.description || 'No description provided.'}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Answer</label>
              <textarea
                rows={6}
                required
                value={submitContent}
                onChange={(e) => setSubmitContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                placeholder="Type your answer here..."
              />
            </div>
          </form>
        )}
      </Modal>

      {/* View Submission Modal (Student) */}
      <Modal
        isOpen={!!viewModal}
        onClose={() => setViewModal(null)}
        title={`Submission: ${viewModal?.assignment?.title || ''}`}
        size="lg"
      >
        {viewModal && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Your Answer</p>
              <div className="p-3 rounded-lg bg-slate-50 text-sm text-slate-700 whitespace-pre-wrap">
                {viewModal.submission?.content || 'No content submitted.'}
              </div>
            </div>
            {viewModal.assignment.status === 'graded' && (
              <>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Grade</p>
                    <p className="text-2xl font-bold text-emerald-600">{viewModal.assignment.grade}%</p>
                  </div>
                </div>
                {viewModal.submission?.feedback && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Teacher Feedback</p>
                    <div className="p-3 rounded-lg bg-emerald-50 text-sm text-emerald-800 whitespace-pre-wrap">
                      {viewModal.submission.feedback}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
