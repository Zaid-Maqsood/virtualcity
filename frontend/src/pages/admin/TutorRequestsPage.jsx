import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Check, X } from 'lucide-react'
import api from '../../api'

const statusBadge = (val) => {
  const colors = {
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
  }
  const label = val || 'pending'
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[label] || 'bg-slate-100 text-slate-600'}`}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  )
}

export default function TutorRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/tutor-requests')
        const data = res.data?.requests || res.data || []
        setRequests(data.map((r) => ({
          ...r,
          studentName: r.student?.name || '-',
          tutorName: r.tutor?.name || '-',
          subject: r.tutor?.subject || '-',
        })))
      } catch {
        // keep empty
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [])

  const updateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/tutor-requests/${id}`, { status })
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: res.data.status } : r))
    } catch {
      // ignore
    }
  }

  const filtered = requests.filter((r) =>
    !search ||
    r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    r.tutorName?.toLowerCase().includes(search.toLowerCase()) ||
    r.subject?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tutor Requests</h2>
          <p className="text-slate-500 text-sm mt-1">All student tutor requests</p>
        </div>
        <div className="sm:ml-auto relative max-w-xs w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student or tutor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-base font-medium">No tutor requests yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Student', 'Tutor', 'Subject', 'Message', 'Status', 'Requested', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{r.studentName}</td>
                  <td className="px-4 py-3 text-slate-600">{r.tutorName}</td>
                  <td className="px-4 py-3 text-slate-600">{r.subject}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{r.message || <span className="italic">No message</span>}</td>
                  <td className="px-4 py-3">{statusBadge(r.status)}</td>
                  <td className="px-4 py-3 text-slate-500">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">
                    {r.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateStatus(r.id, 'approved')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                        >
                          <Check size={13} /> Approve
                        </button>
                        <button
                          onClick={() => updateStatus(r.id, 'rejected')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors"
                        >
                          <X size={13} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
