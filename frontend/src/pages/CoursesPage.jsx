import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CourseCard from '../components/CourseCard'
import Modal from '../components/Modal'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function CoursesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [enrolledIds, setEnrolledIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [enrollModal, setEnrollModal] = useState(null)
  const [enrolling, setEnrolling] = useState(false)

  const CATEGORIES = ['All', 'Tech', 'Test Prep', 'Arts']

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [api.get(user?.role === 'teacher' ? '/courses/my' : '/courses')]
        if (user?.role === 'student') promises.push(api.get('/enrollments/my'))

        const [coursesRes, enrollRes] = await Promise.allSettled(promises)

        const coursesData = coursesRes.status === 'fulfilled'
          ? (coursesRes.value.data?.courses || coursesRes.value.data || [])
          : []
        const enrollData = enrollRes?.status === 'fulfilled'
          ? (enrollRes.value.data?.enrollments || enrollRes.value.data || [])
          : []

        setCourses(coursesData)
        setEnrolledIds(new Set(enrollData.map((e) => e.courseId || e.course?.id)))
      } catch {
        // keep empty
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleEnroll = (course) => {
    setEnrollModal(course)
  }

  const confirmEnroll = async () => {
    if (!enrollModal) return
    setEnrolling(true)
    try {
      await api.post('/enrollments', { courseId: enrollModal.id })
      setEnrolledIds((prev) => new Set([...prev, enrollModal.id]))
      setEnrollModal(null)
    } catch (err) {
      alert(err?.response?.data?.message || 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !activeCategory || c.category === activeCategory
    return matchSearch && matchCategory
  })

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Courses</h2>
          <p className="text-slate-500 text-sm mt-1">Browse and enroll in available courses</p>
        </div>
        <div className="sm:ml-auto flex items-center gap-3">
          <div className="flex gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === 'All' ? '' : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  (cat === 'All' && !activeCategory) || cat === activeCategory
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden animate-pulse">
              <div className="h-28 bg-slate-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-base font-medium">No courses found</p>
          {search && <p className="text-sm mt-1">Try a different search term</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isStudent={user?.role === 'student'}
              isEnrolled={enrolledIds.has(course.id)}
              isOwner={user?.role === 'teacher' && course.instructor?.id === user.id}
              onEnroll={handleEnroll}
              onClick={() => navigate(`/courses/${course.id}`)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!enrollModal}
        onClose={() => setEnrollModal(null)}
        title="Confirm Enrollment"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setEnrollModal(null)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmEnroll}
              disabled={enrolling}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
            >
              {enrolling ? 'Enrolling...' : 'Confirm Enroll'}
            </button>
          </div>
        }
      >
        <p className="text-slate-600 text-sm">
          Are you sure you want to enroll in{' '}
          <span className="font-semibold text-slate-800">{enrollModal?.title}</span>?
        </p>
        {enrollModal?.price > 0 && (
          <p className="text-slate-500 text-sm mt-2">
            Cost: <span className="font-semibold text-slate-800">${Number(enrollModal.price).toFixed(2)}</span>
          </p>
        )}
      </Modal>
    </div>
  )
}
