import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ClipboardList, TrendingUp, UserCheck } from 'lucide-react'
import StatCard from '../../components/StatCard'
import Table from '../../components/Table'
import api from '../../api'
import { useAuth } from '../../context/AuthContext'

const progressColumns = [
  { key: 'studentName', label: 'Student' },
  { key: 'courseName', label: 'Course' },
  { key: 'grade', label: 'Avg. Grade' },
  { key: 'attendance', label: 'Attendance' },
]

export default function ParentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ children: 0, courses: 0, assignments: 0 })
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/parent/dashboard')
        const data = res.data
        setStats({
          children: data.childrenCount,
          courses: data.totalCourses,
          assignments: data.totalAssignments,
        })
        setRows(data.rows || [])
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
          Welcome, {user?.name?.split(' ')[0] || 'Parent'}
        </h2>
        <p className="text-slate-500 text-sm mt-1">Monitor your children&apos;s academic progress</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Children" value={stats.children} icon={UserCheck} color="blue" />
        <StatCard title="Enrolled Courses" value={stats.courses} icon={BookOpen} color="green" />
        <StatCard title="Submissions" value={stats.assignments} icon={ClipboardList} color="purple" />
      </div>

      <div>
        <h3 className="text-base font-semibold text-slate-700 mb-3">Student Progress</h3>
        <Table
          columns={progressColumns}
          data={rows}
          loading={loading}
          emptyMessage="No children linked to your account yet"
        />
      </div>
    </div>
  )
}
