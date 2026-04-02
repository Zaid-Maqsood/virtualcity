import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const gradients = [
  'from-primary-600 to-primary-500',
  'from-violet-600 to-violet-500',
  'from-emerald-600 to-emerald-500',
  'from-amber-500 to-orange-500',
]

function getInitials(name) {
  if (!name) return 'T'
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          className={star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
        />
      ))}
      {rating != null && (
        <span className="text-xs text-slate-500 ml-1">{Number(rating).toFixed(1)}</span>
      )}
    </div>
  )
}

export default function TutorCard({ tutor, onRequest }) {
  const { name, subject, rating, bio } = tutor || {}
  const initials = getInitials(name)

  // Pick a gradient based on name hash for consistency
  const gradientIndex =
    name ? name.charCodeAt(0) % gradients.length : 0
  const gradient = gradients[gradientIndex]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}
      className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-3"
    >
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-white text-xl font-bold select-none">{initials}</span>
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-800 text-base leading-tight truncate">
            {name || 'Tutor'}
          </h3>
          {subject && (
            <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
              {subject}
            </span>
          )}
          {rating != null && (
            <div className="mt-1">
              <StarRating rating={rating} />
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{bio}</p>
      )}

      {/* CTA */}
      {onRequest && (
        <button
          onClick={() => onRequest(tutor)}
          className="mt-auto w-full py-2.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold transition-colors duration-150"
        >
          Request Tutor
        </button>
      )}
    </motion.div>
  )
}
