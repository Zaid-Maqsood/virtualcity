import React from 'react'
import { motion } from 'framer-motion'

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50 z-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="w-12 h-12 rounded-full"
        style={{
          border: '3px solid #eff6ff',
          borderTopColor: '#2563EB',
        }}
      />
    </div>
  )
}
