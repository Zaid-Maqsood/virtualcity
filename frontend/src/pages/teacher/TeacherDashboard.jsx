import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ClipboardList, Users, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/StatCard'
import Table from '../../components/Table'
import api from '../../api'
import { useAuth } from '../../context/AuthContext'

const courseColumns = [
  {
    key: 'title',
    label: 'Course',
    render: (val, row) => (
      <span className="text-primary-600 font-medium cursor-pointer hover:underline">{val}</span>
    ),
  },
  { key: 'enrollmentCount', label: 'Students', render: (val) => val ?? 0 },
  {
    key: 'createdAt',
    label: 'Created',
    render: (val) => val ? new Date(val).toLocaleDateString() : '-',
  },
]

const assignmentColumns = [
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
]

export default function TeacherDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ courses: 0, students: 0, assignments: 0, graded: 0 })
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, assignRes] = await Promise.allSettled([
          api.get('/courses/my'),
          api.get('/assignments/my'),
        ])

        const coursesData = coursesRes.status === 'fulfilled' ? (coursesRes.value.data?.courses || coursesRes.value.data || []) : []
        const assignmentsData = assignRes.status === 'fulfilled' ? (assignRes.value.data?.assignments || assignRes.value.data || []) : []

        const totalStudents = coursesData.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0)

        setStats({
          courses: coursesData.length,
          students: totalStudents,
          assignments: assignmentsData.length,
          graded: assignmentsData.filter((a) => a.status === 'graded').length,
        })
        setCourses(coursesData.slice(0, 5))
        setAssignments(assignmentsData.slice(0, 5))
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h2 className="text-2xl font-bold text-slate-800">
          Welcome, {user?.name?.split(' ')[0] || 'Teacher'}
        </h2>
        <p className="text-slate-500 text-sm mt-1">Manage your courses and track student progress</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Courses" value={stats.courses} icon={BookOpen} color="blue" />
        <StatCard title="Total Students" value={stats.students} icon={Users} color="green" />
        <StatCard title="Assignments" value={stats.assignments} icon={ClipboardList} color="orange" />
        <StatCard title="Graded" value={stats.graded} icon={CheckCircle} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-base font-semibold text-slate-700 mb-3">My Courses</h3>
          <Table columns={courseColumns} data={courses} loading={loading} emptyMessage="No courses created yet" onRowClick={(row) => navigate(`/courses/${row.id}`)} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-700 mb-3">Recent Assignments</h3>
          <Table columns={assignmentColumns} data={assignments} loading={loading} emptyMessage="No assignments yet" />
        </div>
      </div>
    </div>
  )
}
