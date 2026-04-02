import React from 'react'
import { motion } from 'framer-motion'
import { Star, CheckCircle, BookOpen } from 'lucide-react'

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

export default function CourseCard({ course, onEnroll, isEnrolled, isOwner, isStudent = true, onClick }) {
  const { title, description, instructor, price, rating } = course || {}

  const initial = title ? title.charAt(0).toUpperCase() : 'C'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Banner */}
      <div className="h-28 bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-4xl font-bold select-none">{initial}</span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <h3 className="font-semibold text-slate-800 text-base leading-snug line-clamp-1">
            {title || 'Untitled Course'}
          </h3>
          {instructor && (
            <p className="text-sm text-slate-500 mt-0.5">
              {typeof instructor === 'object' ? instructor.name : instructor}
            </p>
          )}
        </div>
        {description && (
          <p className="text-sm text-slate-600 line-clamp-2 flex-1">{description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
          <div className="flex flex-col gap-0.5">
            {price != null && (
              <span className="text-base font-bold text-slate-800">
                {price === 0 ? 'Free' : `$${Number(price).toFixed(2)}`}
              </span>
            )}
            {rating != null && <StarRating rating={rating} />}
          </div>

          {isOwner ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              <BookOpen size={13} />
              Your Course
            </span>
          ) : isStudent ? (
            isEnrolled ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                <CheckCircle size={13} />
                Enrolled
              </span>
            ) : (
              <button
                onClick={() => onEnroll && onEnroll(course)}
                className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors duration-150"
              >
                Enroll
              </button>
            )
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
