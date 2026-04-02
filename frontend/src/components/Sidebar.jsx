import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Users,
  GraduationCap,
  LogOut,
  Menu,
  MessageSquare,
  Megaphone,
  CalendarCheck,
  Settings,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const roleNavItems = {
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard/student' },
    { label: 'Courses', icon: BookOpen, to: '/courses' },
    { label: 'Assignments', icon: ClipboardList, to: '/assignments' },
    { label: 'Attendance', icon: CalendarCheck, to: '/attendance' },
    { label: 'Announcements', icon: Megaphone, to: '/announcements' },
    { label: 'Tutors', icon: GraduationCap, to: '/tutors' },
  ],
  teacher: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard/teacher' },
    { label: 'Courses', icon: BookOpen, to: '/courses' },
    { label: 'Assignments', icon: ClipboardList, to: '/assignments' },
    { label: 'Attendance', icon: CalendarCheck, to: '/attendance' },
    { label: 'Announcements', icon: Megaphone, to: '/announcements' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard/admin' },
    { label: 'Courses', icon: BookOpen, to: '/courses' },
    { label: 'Manage Courses', icon: Settings, to: '/admin/courses' },
    { label: 'Users', icon: Users, to: '/admin/users' },
    { label: 'Tutors', icon: GraduationCap, to: '/tutors' },
    { label: 'Tutor Requests', icon: MessageSquare, to: '/tutor-requests' },
    { label: 'Announcements', icon: Megaphone, to: '/announcements' },
  ],
  parent: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard/parent' },
    { label: 'Courses', icon: BookOpen, to: '/courses' },
    { label: 'Attendance', icon: CalendarCheck, to: '/attendance' },
    { label: 'Announcements', icon: Megaphone, to: '/announcements' },
  ],
}

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = roleNavItems[user?.role] || roleNavItems.student

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-full bg-white border-r border-slate-100 shadow-sm z-40 flex flex-col overflow-hidden"
      style={{ minWidth: collapsed ? 64 : 256 }}
    >
      {/* Logo / Header with toggle */}
      <div className="flex items-center justify-between h-16 px-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">VC</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="text-slate-800 font-semibold text-sm whitespace-nowrap overflow-hidden"
              >
                Virtual City School
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-150 flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              end={item.to.includes('/dashboard')}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors duration-150 group ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:bg-primary-50 hover:text-primary-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-primary-600'}`}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom: Logout */}
      <div className="px-2 py-3 border-t border-slate-100 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-2 py-2.5 rounded-lg w-full text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 group"
        >
          <LogOut size={18} className="flex-shrink-0 text-slate-500 group-hover:text-red-500" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
