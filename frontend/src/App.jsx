import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoadingSpinner from './components/LoadingSpinner'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'))
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const ParentDashboard = lazy(() => import('./pages/parent/ParentDashboard'))
const CoursesPage = lazy(() => import('./pages/CoursesPage'))
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'))
const AssignmentsPage = lazy(() => import('./pages/AssignmentsPage'))
const TutorsPage = lazy(() => import('./pages/TutorsPage'))
const TutorRequestsPage = lazy(() => import('./pages/admin/TutorRequestsPage'))
const SubmissionsPage = lazy(() => import('./pages/teacher/SubmissionsPage'))
const AttendancePage = lazy(() => import('./pages/AttendancePage'))
const AnnouncementsPage = lazy(() => import('./pages/AnnouncementsPage'))
const ClassroomPage = lazy(() => import('./pages/ClassroomPage'))
const AdminCoursesPage = lazy(() => import('./pages/admin/AdminCoursesPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const Layout = lazy(() => import('./components/Layout'))

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

function RoleRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/dashboard" replace />
  return children
}

function DashboardRedirect() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />

  const roleRoutes = {
    student: '/dashboard/student',
    teacher: '/dashboard/teacher',
    admin: '/dashboard/admin',
    parent: '/dashboard/parent',
  }

  return <Navigate to={roleRoutes[user.role] || '/dashboard/student'} replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute>
              <RoleRoute role="student">
                <Layout>
                  <StudentDashboard />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher"
          element={
            <ProtectedRoute>
              <RoleRoute role="teacher">
                <Layout>
                  <TeacherDashboard />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <RoleRoute role="admin">
                <Layout>
                  <AdminDashboard />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent"
          element={
            <ProtectedRoute>
              <RoleRoute role="parent">
                <Layout>
                  <ParentDashboard />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Layout>
                <CoursesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <CourseDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignments"
          element={
            <ProtectedRoute>
              <Layout>
                <AssignmentsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutors"
          element={
            <ProtectedRoute>
              <Layout>
                <TutorsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor-requests"
          element={
            <ProtectedRoute>
              <RoleRoute role="admin">
                <Layout>
                  <TutorRequestsPage />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/assignments/:id/submissions"
          element={
            <ProtectedRoute>
              <Layout>
                <SubmissionsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Layout>
                <AttendancePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/announcements"
          element={
            <ProtectedRoute>
              <Layout>
                <AnnouncementsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/classroom/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ClassroomPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute>
              <RoleRoute role="admin">
                <Layout>
                  <AdminCoursesPage />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <RoleRoute role="admin">
                <Layout>
                  <AdminUsersPage />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
