import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Megaphone, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const roleColors = {
  admin: 'bg-purple-50 text-purple-700',
  teacher: 'bg-green-50 text-green-700',
}

export default function AnnouncementsPage() {
  const { user } = useAuth()
  const isAuthor = user?.role === 'teacher' || user?.role === 'admin'
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [createModal, setCreateModal] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', courseId: '' })
  const [courses, setCourses] = useState([])
  const [creating, setCreating] = useState(false)

  const fetchAnnouncements = async () => {
    const res = await api.get('/announcements')
    return res.data || []
  }

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAnnouncements()
        setAnnouncements(data)
        if (isAuthor) {
          const endpoint = user?.role === 'admin' ? '/courses' : '/courses/my'
          const cRes = await api.get(endpoint)
          setCourses(cRes.data?.courses || cRes.data || [])
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isAuthor, user?.role])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/announcements', {
        title: form.title,
        body: form.body,
        courseId: form.courseId || undefined,
      })
      setCreateModal(false)
      setForm({ title: '', body: '', courseId: '' })
      const data = await fetchAnnouncements()
      setAnnouncements(data)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to post announcement')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return
    try {
      await api.delete(`/announcements/${id}`)
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    } catch {
      alert('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Announcements</h2>
          <p className="text-slate-500 text-sm mt-1">School-wide and course announcements</p>
        </div>
        {isAuthor && (
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
          >
            <Plus size={16} /> New Announcement
          </button>
        )}
      </motion.div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16">
          <Megaphone size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-800">{a.title}</h3>
                    {a.course ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{a.course.title}</span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">School-wide</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{a.body}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${roleColors[a.author?.role] || 'bg-slate-100 text-slate-600'}`}>
                      {a.author?.name}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {(isAuthor && (user?.role === 'admin' || a.author?.id === user?.id)) && (
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="New Announcement"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setCreateModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
            <button form="announcement-form" type="submit" disabled={creating} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 transition-colors">
              {creating ? 'Posting...' : 'Post'}
            </button>
          </div>
        }
      >
        <form id="announcement-form" onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input type="text" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="Announcement title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
            <textarea rows={4} required value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
              placeholder="Write your announcement..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Course (optional)</label>
            <select value={form.courseId} onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white">
              <option value="">School-wide (no specific course)</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  )
}
