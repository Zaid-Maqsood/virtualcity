import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ClipboardList, GraduationCap, TrendingUp, Megaphone, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/StatCard'
import Table from '../../components/Table'
import api from '../../api'
import { useAuth } from '../../context/AuthContext'

const assignmentColumns = [
  { key: 'title', label: 'Assignment' },
  { key: 'courseName', label: 'Course' },
  {
    key: 'dueDate',
    label: 'Due Date',
    render: (val) => val ? new Date(val).toLocaleDateString() : '-',
  },
  {
    key: 'status',
    label: 'Status',
    render: (val) => {
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
    },
  },
]

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ enrolledCourses: 0, assignments: 0, completed: 0, avgGrade: 0 })
  const [assignments, setAssignments] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [liveClasses, setLiveClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollRes, assignRes, announcementsRes, liveClassesRes] = await Promise.allSettled([
          api.get('/enrollments/my'),
          api.get('/assignments/my'),
          api.get('/announcements'),
          api.get('/live-classes/my'),
        ])

        const enrollments = enrollRes.status === 'fulfilled' ? (enrollRes.value.data?.enrollments || enrollRes.value.data || []) : []
        const assignmentsData = assignRes.status === 'fulfilled' ? (assignRes.value.data?.assignments || assignRes.value.data || []) : []
        const announcementsData = announcementsRes.status === 'fulfilled' ? (announcementsRes.value.data || []) : []
        const liveClassesData = liveClassesRes.status === 'fulfilled' ? (liveClassesRes.value.data || []) : []

        const submittedAssignments = assignmentsData.filter((a) => a.status === 'submitted' || a.status === 'graded')
        const gradedAssignments = assignmentsData.filter((a) => a.status === 'graded' && a.grade != null)
        const avgGrade = gradedAssignments.length > 0
          ? Math.round(gradedAssignments.reduce((sum, a) => sum + Number(a.grade), 0) / gradedAssignments.length)
          : 0

        setStats({
          enrolledCourses: enrollments.length,
          assignments: assignmentsData.length,
          completed: submittedAssignments.length,
          avgGrade,
        })
        setAssignments(assignmentsData.slice(0, 5))
        setAnnouncements(announcementsData.slice(0, 3))
        setLiveClasses(liveClassesData.slice(0, 5))
      } catch {
        // keep defaults
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h2 className="text-2xl font-bold text-slate-800">
          Welcome back, {user?.name?.split(' ')[0] || 'Student'}
        </h2>
        <p className="text-slate-500 text-sm mt-1">Here&apos;s your learning overview</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Enrolled Courses" value={stats.enrolledCourses} icon={BookOpen} color="blue" />
        <StatCard title="Assignments" value={stats.assignments} icon={ClipboardList} color="orange" />
        <StatCard title="Completed" value={stats.completed} icon={GraduationCap} color="green" />
        <StatCard title="Avg. Grade" value={`${stats.avgGrade}%`} icon={TrendingUp} color="purple" />
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-slate-700">Announcements</h3>
            <Link to="/announcements" className="text-xs text-primary-600 hover:text-primary-800 font-medium">View all</Link>
          </div>
          <div className="space-y-2">
            {announcements.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Megaphone size={13} className="text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{a.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{a.body}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Live Classes */}
      {liveClasses.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-slate-700 mb-3">Upcoming Live Classes</h3>
          <div className="space-y-2">
            {liveClasses.map((lc) => (
              <div key={lc.id} className="flex items-center justify-between gap-4 bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Video size={15} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{lc.title || 'Live Session'}</p>
                    <p className="text-xs text-slate-500">{lc.course?.title}</p>
                    {lc.scheduledAt && (
                      <p className="text-xs text-slate-400">{new Date(lc.scheduledAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <a
                  href={lc.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  Join
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent assignments */}
      <div>
        <h3 className="text-base font-semibold text-slate-700 mb-3">Recent Assignments</h3>
        <Table
          columns={assignmentColumns}
          data={assignments}
          loading={loading}
          emptyMessage="No assignments yet"
        />
      </div>
    </div>
  )
}
