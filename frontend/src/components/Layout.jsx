import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import AIAssistant from './AIAssistant'

const pageTitles = {
  '/dashboard/student': 'Student Dashboard',
  '/dashboard/teacher': 'Teacher Dashboard',
  '/dashboard/admin': 'Admin Dashboard',
  '/dashboard/parent': 'Parent Dashboard',
  '/courses': 'Courses',
  '/assignments': 'Assignments',
  '/tutors': 'Tutors',
  '/attendance': 'Attendance',
  '/announcements': 'Announcements',
  '/tutor-requests': 'Tutor Requests',
  '/admin/courses': 'Course Management',
}

function getPageTitle(pathname) {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.startsWith('/courses/')) return 'Course Details'
  if (pathname.startsWith('/assignments/')) return 'Submissions'
  if (pathname.startsWith('/classroom/')) return 'Live Classroom'
  return 'Dashboard'
}

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()

  // Detect mobile and auto-collapse sidebar
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setCollapsed(true)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const sidebarWidth = collapsed ? 64 : 256
  const pageTitle = getPageTitle(location.pathname)

  const handleToggle = () => setCollapsed((prev) => !prev)

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobile && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-30"
            onClick={() => setCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />

      {/* Main content */}
      <motion.div
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex-1 flex flex-col min-w-0"
      >
        <Navbar pageTitle={pageTitle} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </motion.div>
      <AIAssistant />
    </div>
  )
}
