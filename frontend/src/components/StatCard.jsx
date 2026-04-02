import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

const colorMap = {
  blue: {
    bg: 'bg-primary-50',
    icon: 'text-primary-600',
    ring: 'ring-primary-100',
  },
  green: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    ring: 'ring-emerald-100',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-500',
    ring: 'ring-orange-100',
  },
  purple: {
    bg: 'bg-violet-50',
    icon: 'text-violet-600',
    ring: 'ring-violet-100',
  },
}

export default function StatCard({ title, value, icon: Icon, trend, color = 'blue' }) {
  const colors = colorMap[color] || colorMap.blue

  const trendValue = parseFloat(trend)
  const isPositive = trendValue >= 0

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-xl ${colors.bg} ring-1 ${colors.ring} flex items-center justify-center flex-shrink-0`}
        >
          {Icon && <Icon size={20} className={colors.icon} />}
        </div>
        {trend !== undefined && trend !== null && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? '+' : ''}
            {trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{title}</p>
      </div>
    </motion.div>
  )
}
