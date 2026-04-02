import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck } from 'lucide-react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const statusColors = {
  present: 'bg-emerald-50 text-emerald-700',
  absent: 'bg-red-50 text-red-700',
  late: 'bg-amber-50 text-amber-700',
}

function StatusSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`text-xs font-semibold px-2 py-0.5 rounded-full border-0 focus:ring-2 focus:ring-primary-500 cursor-pointer ${statusColors[value]}`}
    >
      <option value="present">Present</option>
      <option value="absent">Absent</option>
      <option value="late">Late</option>
    </select>
  )
}

export default function AttendancePage() {
  const { user } = useAuth()
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin'
  const isStudentOrParent = user?.role === 'student' || user?.role === 'parent'

  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState({})

  // student/parent: load all attendance at once
  useEffect(() => {
    if (isStudentOrParent) {
      setLoading(true)
      api.get('/attendance/my')
        .then((r) => setRecords(r.data || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [isStudentOrParent])

  // teacher/admin: load their courses
  useEffect(() => {
    if (isTeacher) {
      api.get('/courses/my')
        .then((r) => setCourses(r.data?.courses || r.data || []))
        .catch(() => {})
    }
  }, [isTeacher])

  // teacher: load attendance when course selected
  useEffect(() => {
    if (isTeacher && selectedCourse) {
      setLoading(true)
      api.get(`/attendance/course/${selectedCourse}`)
        .then((r) => setRecords(r.data || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [isTeacher, selectedCourse])

  const handleStatusChange = async (recordId, newStatus) => {
    setUpdating((p) => ({ ...p, [recordId]: true }))
    try {
      await api.put(`/attendance/${recordId}`, { status: newStatus })
      setRecords((prev) => prev.map((r) => r.id === recordId ? { ...r, status: newStatus } : r))
    } catch {
      alert('Failed to update attendance')
    } finally {
      setUpdating((p) => ({ ...p, [recordId]: false }))
    }
  }

  // Group records by course for student/parent view
  const byCourse = records.reduce((acc, r) => {
    const key = r.course?.id
    if (!key) return acc
    if (!acc[key]) acc[key] = { title: r.course.title, records: [] }
    acc[key].records.push(r)
    return acc
  }, {})

  const courseGroups = Object.values(byCourse)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <h2 className="text-2xl font-bold text-slate-800">Attendance</h2>
        <p className="text-slate-500 text-sm mt-1">
          {isTeacher ? 'View and adjust student attendance' : 'Your attendance history'}
        </p>
      </motion.div>

      {/* Teacher: course picker */}
      {isTeacher && (
        <div className="flex items-center gap-3">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white"
          >
            <option value="">Select a course</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
      )}

      {/* Student/Parent: per-course percentage cards + detail table */}
      {isStudentOrParent && (
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : courseGroups.length === 0 ? (
          <div className="text-center py-16">
            <CalendarCheck size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No attendance records found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Per-course summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courseGroups.map((group) => {
                const total = group.records.length
                const present = group.records.filter((r) => r.status === 'present').length
                const absent = group.records.filter((r) => r.status === 'absent').length
                const late = group.records.filter((r) => r.status === 'late').length
                const pct = total > 0 ? Math.round((present / total) * 100) : 0
                const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'
                return (
                  <div key={group.title} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-slate-800 text-sm">{group.title}</h3>
                      <span className={`text-lg font-bold ${pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                      <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-emerald-600 font-semibold">{present} Present</span>
                      <span className="text-red-500 font-semibold">{absent} Absent</span>
                      <span className="text-amber-500 font-semibold">{late} Late</span>
                      <span className="text-slate-400">{total} Total</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Detailed records table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Course</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-700">{r.course?.title || '-'}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[r.status]}`}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Teacher: records table */}
      {isTeacher && (
        loading ? (
          <div className="text-sm text-slate-500">Loading attendance...</div>
        ) : selectedCourse ? (
          records.length === 0 ? (
            <div className="text-center py-16">
              <CalendarCheck size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No attendance records found</p>
            </div>
          ) : (
            <>
              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700">{records.filter(r=>r.status==='present').length} Present</span>
                <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-red-50 text-red-700">{records.filter(r=>r.status==='absent').length} Absent</span>
                <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-50 text-amber-700">{records.filter(r=>r.status==='late').length} Late</span>
                <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-600">{records.length} Total</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{r.student?.name || '-'}</div>
                          <div className="text-xs text-slate-400">{r.student?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{new Date(r.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          {updating[r.id] ? (
                            <span className="text-xs text-slate-400">Saving...</span>
                          ) : (
                            <StatusSelect value={r.status} onChange={(v) => handleStatusChange(r.id, v)} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        ) : (
          <div className="text-center py-16 text-slate-400 text-sm">Select a course to view attendance</div>
        )
      )}
    </div>
  )
}
