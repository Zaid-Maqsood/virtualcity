import React from 'react'
import { useAuth } from '../context/AuthContext'

const roleColors = {
  student: 'bg-blue-100 text-blue-700',
  teacher: 'bg-green-100 text-green-700',
  admin: 'bg-purple-100 text-purple-700',
  parent: 'bg-orange-100 text-orange-700',
}

function getInitials(name) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function Navbar({ pageTitle }) {
  const { user } = useAuth()

  const initials = getInitials(user?.name)
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : ''
  const roleBadgeClass = roleColors[user?.role] || 'bg-slate-100 text-slate-700'

  return (
    <header className="h-16 bg-white border-b border-slate-100 shadow-sm flex items-center px-4 gap-4 sticky top-0 z-30">
      {/* Page title */}
      <h1 className="text-slate-800 font-semibold text-lg flex-1 truncate">
        {pageTitle || 'Dashboard'}
      </h1>

      {/* User info */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-semibold text-slate-800 leading-tight">
            {user?.name || 'User'}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadgeClass}`}>
            {roleLabel}
          </span>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">{initials}</span>
        </div>
      </div>
    </header>
  )
}
