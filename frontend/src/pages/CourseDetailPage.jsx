import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Star, MessageCircle, CheckCircle, Video, Plus, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function CourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')
  const [liveClasses, setLiveClasses] = useState([])
  const [createClassModal, setCreateClassModal] = useState(false)
  const [classForm, setClassForm] = useState({ title: '', meetingLink: '', scheduledAt: '' })
  const [creatingClass, setCreatingClass] = useState(false)

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin'

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const promises = [api.get(`/courses/${id}`)]
        if (user?.role === 'student') promises.push(api.get('/enrollments/my'))

        const [courseRes, enrollRes] = await Promise.allSettled(promises)

        if (courseRes.status === 'fulfilled') {
          const c = courseRes.value.data?.course || courseRes.value.data
          setCourse(c)
          setLiveClasses(c?.liveClasses || [])
        }
        if (enrollRes?.status === 'fulfilled') {
          const enrollments = enrollRes.value.data?.enrollments || enrollRes.value.data || []
          const enrolled = enrollments.some((e) => (e.courseId || e.course?.id) === parseInt(id))
          setIsEnrolled(enrolled)
        }
      } catch {
        setError('Failed to load course details')
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [id])

  const handleCreateClass = async (e) => {
    e.preventDefault()
    setCreatingClass(true)
    try {
      const res = await api.post('/live-classes', { ...classForm, courseId: id })
      setLiveClasses((prev) => [res.data, ...prev])
      setCreateClassModal(false)
      setClassForm({ title: '', meetingLink: '', scheduledAt: '' })
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to create class')
    } finally {
      setCreatingClass(false)
    }
  }

  const handleDeleteClass = async (classId) => {
    if (!confirm('Delete this live class?')) return
    try {
      await api.delete(`/live-classes/${classId}`)
      setLiveClasses((prev) => prev.filter((c) => c.id !== classId))
    } catch {
      alert('Failed to delete')
    }
  }

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      await api.post('/enrollments', { courseId: id })
      setIsEnrolled(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-48 bg-slate-200 rounded-xl" />
        <div className="h-4 w-2/3 bg-slate-200 rounded" />
        <div className="h-4 w-1/2 bg-slate-200 rounded" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Course not found.</p>
        <button onClick={() => navigate('/courses')} className="mt-4 text-primary-600 text-sm font-medium hover:underline">
          Back to Courses
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Courses
        </button>

        {/* Course banner */}
        <div className="h-40 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center mb-6">
          <span className="text-white text-6xl font-bold select-none">
            {course.title?.charAt(0)?.toUpperCase() || 'C'}
          </span>
        </div>

        {/* Title and meta */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{course.title}</h1>
              {course.instructor && (
                <p className="text-sm text-slate-500 mt-1">
                  Instructor: {typeof course.instructor === 'object' ? course.instructor.name : course.instructor}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-800">
                {course.price === 0 ? 'Free' : course.price != null ? `$${Number(course.price).toFixed(2)}` : ''}
              </p>
              {course.rating != null && (
                <div className="flex items-center gap-1 justify-end mt-1">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm text-slate-600">{Number(course.rating).toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{error}</p>
          )}

          {course.description && (
            <p className="text-slate-600 leading-relaxed text-sm">{course.description}</p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {!isTeacher && (isEnrolled ? (
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-sm border border-emerald-100">
                <CheckCircle size={16} />
                Enrolled
              </span>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            ))}

            {course.whatsappGroupLink && isEnrolled && (
              <a
                href={course.whatsappGroupLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors"
              >
                <MessageCircle size={16} />
                Join WhatsApp Group
              </a>
            )}
          </div>
        </div>
      {/* Live Classes */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-slate-700">Live Classes</h3>
          {isTeacher && (
            <button
              onClick={() => setCreateClassModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              <Plus size={13} /> Schedule Class
            </button>
          )}
        </div>
        {liveClasses.length === 0 ? (
          <p className="text-sm text-slate-400">No live classes scheduled yet</p>
        ) : (
          <div className="space-y-2">
            {liveClasses.map((lc) => (
              <div key={lc.id} className="flex items-center justify-between gap-4 bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Video size={15} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{lc.title || 'Live Session'}</p>
                    {lc.scheduledAt && (
                      <p className="text-xs text-slate-400">{new Date(lc.scheduledAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/classroom/${lc.id}`)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    {isTeacher ? 'Manage' : 'Join'}
                  </button>
                  {isTeacher && (
                    <button onClick={() => handleDeleteClass(lc.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Live Class Modal */}
      <Modal isOpen={createClassModal} onClose={() => setCreateClassModal(false)} title="Schedule Live Class"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setCreateClassModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
            <button form="create-class-form" type="submit" disabled={creatingClass} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 transition-colors">
              {creatingClass ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        }
      >
        <form id="create-class-form" onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Session Title</label>
            <input type="text" required value={classForm.title} onChange={(e) => setClassForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="e.g. Week 3 - Algebra Review" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Google Meet / Zoom Link</label>
            <input type="url" required value={classForm.meetingLink} onChange={(e) => setClassForm((p) => ({ ...p, meetingLink: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="https://meet.google.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Scheduled Date & Time (optional)</label>
            <input type="datetime-local" value={classForm.scheduledAt} onChange={(e) => setClassForm((p) => ({ ...p, scheduledAt: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" />
          </div>
        </form>
      </Modal>
      </motion.div>
    </div>
  )
}
