import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Users, GraduationCap, DollarSign } from 'lucide-react'
import StatCard from '../../components/StatCard'
import Table from '../../components/Table'
import api from '../../api'

const userColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  {
    key: 'role',
    label: 'Role',
    render: (val) => {
      const colors = {
        student: 'bg-blue-50 text-blue-700',
        teacher: 'bg-green-50 text-green-700',
        admin: 'bg-purple-50 text-purple-700',
        parent: 'bg-orange-50 text-orange-700',
      }
      return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[val] || 'bg-slate-100 text-slate-600'}`}>
          {val ? val.charAt(0).toUpperCase() + val.slice(1) : '-'}
        </span>
      )
    },
  },
  {
    key: 'createdAt',
    label: 'Joined',
    render: (val) => val ? new Date(val).toLocaleDateString() : '-',
  },
]

const courseColumns = [
  { key: 'title', label: 'Course' },
  { key: 'instructorName', label: 'Instructor' },
  { key: 'enrollmentCount', label: 'Students', render: (val) => val ?? 0 },
  {
    key: 'price',
    label: 'Price',
    render: (val) => val === 0 ? 'Free' : val != null ? `$${Number(val).toFixed(2)}` : '-',
  },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, courses: 0, tutors: 0, revenue: 0 })
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, coursesRes, tutorsRes, statsRes] = await Promise.allSettled([
          api.get('/admin/users'),
          api.get('/courses'),
          api.get('/tutors'),
          api.get('/admin/stats'),
        ])

        const usersData = usersRes.status === 'fulfilled' ? (usersRes.value.data?.users || usersRes.value.data || []) : []
        const rawCourses = coursesRes.status === 'fulfilled' ? (coursesRes.value.data?.courses || coursesRes.value.data || []) : []
        const tutorsData = tutorsRes.status === 'fulfilled' ? (tutorsRes.value.data?.tutors || tutorsRes.value.data || []) : []
        const statsData = statsRes.status === 'fulfilled' ? statsRes.value.data : {}

        const coursesData = rawCourses.map((c) => ({
          ...c,
          instructorName: c.instructor?.name || '-',
          enrollmentCount: c._count?.enrollments ?? 0,
        }))

        setStats({
          users: usersData.length,
          courses: coursesData.length,
          tutors: tutorsData.length,
          revenue: statsData?.revenue ?? 0,
        })
        setUsers(usersData.slice(0, 5))
        setCourses(coursesData.slice(0, 5))
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
        <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Platform overview and management</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.users} icon={Users} color="blue" />
        <StatCard title="Courses" value={stats.courses} icon={BookOpen} color="green" />
        <StatCard title="Tutors" value={stats.tutors} icon={GraduationCap} color="orange" />
        <StatCard title="Revenue" value={`$${Number(stats.revenue).toFixed(2)}`} icon={DollarSign} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-base font-semibold text-slate-700 mb-3">Recent Users</h3>
          <Table columns={userColumns} data={users} loading={loading} emptyMessage="No users yet" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-700 mb-3">Recent Courses</h3>
          <Table columns={courseColumns} data={courses} loading={loading} emptyMessage="No courses yet" />
        </div>
      </div>
    </div>
  )
}
