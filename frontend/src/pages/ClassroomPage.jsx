import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Video, Users, CheckCircle, ExternalLink, Trash2 } from 'lucide-react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function ClassroomPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [liveClass, setLiveClass] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [joined, setJoined] = useState(false)
  const [joining, setJoining] = useState(false)

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin'

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/live-classes/${id}`)
        setLiveClass(res.data)
        // load attendance for teachers
        if (isTeacher) {
          const attRes = await api.get(`/attendance/course/${res.data.courseId}`)
          setAttendance(attRes.data || [])
        }
      } catch {
        // class not found, go back
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isTeacher])

  const handleJoin = async () => {
    if (joined) {
      window.open(liveClass.meetingLink, '_blank')
      return
    }
    setJoining(true)
    try {
      await api.post(`/attendance/join/${id}`)
      setJoined(true)
    } catch (err) {
      // 409 = already marked, still allow join
      if (err?.response?.status === 409) setJoined(true)
    } finally {
      setJoining(false)
      window.open(liveClass.meetingLink, '_blank')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this live class?')) return
    try {
      await api.delete(`/live-classes/${id}`)
      navigate(-1)
    } catch {
      alert('Failed to delete')
    }
  }

  if (loading) {
    return <div className="text-sm text-slate-500 p-4">Loading classroom...</div>
  }

  if (!liveClass) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Class not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary-600 text-sm font-medium">Go back</button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
          <ArrowLeft size={15} /> Back
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Video size={16} className="text-primary-200" />
                  <span className="text-primary-200 text-sm font-medium">Live Class</span>
                </div>
                <h2 className="text-2xl font-bold">{liveClass.title || 'Live Session'}</h2>
                <p className="text-primary-200 mt-1">{liveClass.course?.title}</p>
              </div>
              {isTeacher && (
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span className="font-medium text-slate-800">Hosted by:</span>
              {liveClass.createdBy?.name}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span className="font-medium text-slate-800">Created:</span>
              {new Date(liveClass.createdAt).toLocaleString()}
            </div>
            {liveClass.scheduledAt && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span className="font-medium text-slate-800">Scheduled:</span>
                {new Date(liveClass.scheduledAt).toLocaleString()}
              </div>
            )}

            {/* Join / Teacher view meeting link */}
            <div className="pt-2">
              {isTeacher ? (
                <div className="flex items-center gap-3">
                  <a
                    href={liveClass.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
                  >
                    <Video size={16} /> Start Class
                    <ExternalLink size={13} />
                  </a>
                  <span className="text-xs text-slate-400">{liveClass.meetingLink}</span>
                </div>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-colors ${
                    joined ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary-600 hover:bg-primary-700'
                  } disabled:opacity-60`}
                >
                  {joined ? <CheckCircle size={16} /> : <Video size={16} />}
                  {joining ? 'Joining...' : joined ? 'Join Again' : 'Join Class'}
                  <ExternalLink size={13} />
                </button>
              )}
              {joined && (
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                  <CheckCircle size={12} /> Attendance marked as present
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Attendance panel for teachers */}
      {isTeacher && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-slate-500" />
            <h3 className="text-base font-semibold text-slate-700">Attendance ({attendance.length})</h3>
          </div>
          {attendance.length === 0 ? (
            <p className="text-sm text-slate-400">No attendance records yet</p>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {attendance.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-slate-800">{r.student?.name}</div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          r.status === 'present' ? 'bg-emerald-50 text-emerald-700' :
                          r.status === 'absent' ? 'bg-red-50 text-red-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
