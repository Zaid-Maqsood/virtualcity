import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, UserCheck, Plus, Trash2 } from 'lucide-react'
import Modal from '../../components/Modal'
import api from '../../api'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Assign teacher modal
  const [assignModal, setAssignModal] = useState(null)
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [assigning, setAssigning] = useState(false)

  // Create course modal
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', price: '0', instructorId: '' })

  // Delete
  const [deleting, setDeleting] = useState(null)

  const fetchCourses = async () => {
    const res = await api.get('/courses')
    return (res.data?.courses || res.data || []).map((c) => ({
      ...c,
      instructorName: c.instructor?.name || '-',
      enrollmentCount: c._count?.enrollments ?? 0,
    }))
  }

  useEffect(() => {
    const load = async () => {
      try {
        const [data, teachersRes] = await Promise.all([
          fetchCourses(),
          api.get('/admin/users?role=teacher'),
        ])
        setCourses(data)
        setTeachers(teachersRes.data || [])
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAssign = async (e) => {
    e.preventDefault()
    setAssigning(true)
    try {
      await api.put(`/admin/courses/${assignModal.id}/assign-teacher`, {
        instructorId: selectedTeacher,
      })
      setAssignModal(null)
      setSelectedTeacher('')
      const data = await fetchCourses()
      setCourses(data)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to assign teacher')
    } finally {
      setAssigning(false)
    }
  }

  const openAssign = (course) => {
    setAssignModal(course)
    setSelectedTeacher(String(course.instructorId || ''))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/courses', {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price) || 0,
        instructorId: form.instructorId || undefined,
      })
      setCreateOpen(false)
      setForm({ title: '', description: '', price: '0', instructorId: '' })
      const data = await fetchCourses()
      setCourses(data)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to create course')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return
    setDeleting(course.id)
    try {
      await api.delete(`/courses/${course.id}`)
      setCourses((prev) => prev.filter((c) => c.id !== course.id))
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to delete course')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = courses.filter((c) =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <h2 className="text-2xl font-bold text-slate-800">Course Management</h2>
        <p className="text-slate-500 text-sm mt-1">Create, assign teachers, and delete courses</p>
      </motion.div>

      <div className="flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus size={15} /> New Course
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading courses...</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Course</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Teacher</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Students</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{c.title}</div>
                    {c.category && <div className="text-xs text-slate-400">{c.category}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{c.instructorName}</td>
                  <td className="px-4 py-3 text-slate-600">{c.enrollmentCount}</td>
                  <td className="px-4 py-3 text-slate-600">{c.price === 0 ? 'Free' : `$${Number(c.price).toFixed(2)}`}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openAssign(c)}
                        className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        <UserCheck size={13} /> Assign
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        disabled={deleting === c.id}
                        className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">No courses found</div>
          )}
        </div>
      )}

      {/* Assign Teacher Modal */}
      <Modal
        isOpen={!!assignModal}
        onClose={() => setAssignModal(null)}
        title={`Assign Teacher: ${assignModal?.title || ''}`}
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setAssignModal(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
            <button form="assign-form" type="submit" disabled={assigning} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 transition-colors">
              {assigning ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      >
        {assignModal && (
          <form id="assign-form" onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Teacher</label>
              <select
                required
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white"
              >
                <option value="">Choose a teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                ))}
              </select>
            </div>
          </form>
        )}
      </Modal>

      {/* Create Course Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Course"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
            <button form="create-form" type="submit" disabled={creating} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 transition-colors">
              {creating ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        }
      >
        <form id="create-form" onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Introduction to Python"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Short course description..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Price ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign Teacher</label>
            <select
              value={form.instructorId}
              onChange={(e) => setForm((f) => ({ ...f, instructorId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white"
            >
              <option value="">Select a teacher (optional)</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  )
}
