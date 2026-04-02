import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import TutorCard from '../components/TutorCard'
import Modal from '../components/Modal'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function TutorsPage() {
  const { user } = useAuth()
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [requestModal, setRequestModal] = useState(null)
  const [requesting, setRequesting] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await api.get('/tutors')
        setTutors(res.data?.tutors || res.data || [])
      } catch {
        // keep empty
      } finally {
        setLoading(false)
      }
    }
    fetchTutors()
  }, [])

  const handleRequest = (tutor) => {
    setRequestModal(tutor)
    setMessage('')
    setSuccess('')
  }

  const confirmRequest = async () => {
    if (!requestModal) return
    setRequesting(true)
    try {
      await api.post('/tutor-requests', { tutorId: requestModal.id, message })
      setSuccess('Tutor request sent successfully!')
      setTimeout(() => {
        setRequestModal(null)
        setSuccess('')
      }, 1500)
    } catch (err) {
      alert(err?.response?.data?.message || 'Request failed')
    } finally {
      setRequesting(false)
    }
  }

  const filtered = tutors.filter((t) =>
    !search ||
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.subject?.toLowerCase().includes(search.toLowerCase())
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
          <h2 className="text-2xl font-bold text-slate-800">Tutors</h2>
          <p className="text-slate-500 text-sm mt-1">Find and request expert tutors</p>
        </div>
        <div className="sm:ml-auto relative max-w-xs w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tutors or subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 animate-pulse space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
              <div className="h-9 bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-base font-medium">No tutors found</p>
          {search && <p className="text-sm mt-1">Try a different search term</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} onRequest={user?.role === 'student' ? handleRequest : null} />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!requestModal}
        onClose={() => setRequestModal(null)}
        title="Request Tutor"
        footer={
          !success ? (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRequestModal(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRequest}
                disabled={requesting}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-accent-500 text-white hover:bg-accent-600 disabled:opacity-60 transition-colors"
              >
                {requesting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          ) : null
        }
      >
        {success ? (
          <div className="text-center py-4">
            <p className="text-emerald-600 font-semibold">{success}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-600 text-sm">
              Send a tutoring request to{' '}
              <span className="font-semibold text-slate-800">{requestModal?.name}</span>
              {requestModal?.subject && (
                <> for <span className="font-semibold text-slate-800">{requestModal.subject}</span></>
              )}.
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Message <span className="text-slate-400">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what you need help with..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
