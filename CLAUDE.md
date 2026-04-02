# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Virtual City School** — a digital learning platform MVP. Full spec in `project.txt`. Implementation is in `backend/` and `frontend/`.

Four user roles: `admin`, `student`, `teacher`, `parent`.

## Running the Project

### Prerequisites
- Node.js 18+, PostgreSQL running locally

### Backend

```bash
cd backend
cp .env.example .env          # then fill in DATABASE_URL and JWT_SECRET
npm install
npx prisma db push            # sync schema to DB (no migration history)
node src/seed.js              # seed demo data
npm run dev                   # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                   # starts on http://localhost:5173
```

The Vite dev server proxies `/api/*` → `http://localhost:5000`.

### Demo credentials

| Role    | Email                      | Password    |
|---------|----------------------------|-------------|
| Admin   | admin@virtualcity.edu      | admin123    |
| Teacher | sarah@virtualcity.edu      | teacher123  |
| Teacher | john@virtualcity.edu       | teacher123  |
| Student | alice@student.edu          | student123  |
| Student | bob@student.edu            | student123  |
| Parent  | parent@virtualcity.edu     | parent123   |

## Architecture

### Backend (`backend/`)

```
prisma/schema.prisma       ← 9 models + 2 enums
src/
  server.js                ← Express entry, mounts all routes, Prisma connect
  middleware/auth.js       ← authenticate (JWT verify) + authorize(...roles) factory
  routes/                  ← thin route files, one per domain
  controllers/             ← business logic (Prisma queries)
  seed.js                  ← demo data
```

**Route → Controller mapping:**

| Mount path          | Route file         | Controller file              |
|---------------------|--------------------|------------------------------|
| `/api/auth`         | routes/auth.js     | controllers/authController.js |
| `/api/courses`      | routes/courses.js  | controllers/courseController.js |
| `/api/enrollments`  | routes/enrollments.js | controllers/enrollmentController.js |
| `/api/assignments`  | routes/assignments.js | controllers/assignmentController.js |
| `/api/submissions`  | routes/submissions.js | controllers/submissionController.js |
| `/api/live-classes` | routes/liveClasses.js | controllers/liveClassController.js |
| `/api/attendance`   | routes/attendance.js | controllers/attendanceController.js |
| `/api/tutors`       | routes/tutors.js   | controllers/tutorController.js |
| `/api/tutor-requests` | routes/tutorRequests.js | controllers/tutorRequestController.js |
| `/api/admin`        | routes/admin.js    | controllers/adminController.js |

**Auth flow:** JWT signed with `JWT_SECRET`, 7-day expiry. Token sent as `Authorization: Bearer <token>`. `authenticate` middleware attaches decoded payload to `req.user`. `authorize(...roles)` checks `req.user.role`.

### Frontend (`frontend/src/`)

```
App.jsx                    ← React Router v6, lazy-loaded pages, ProtectedRoute/RoleRoute
context/AuthContext.jsx    ← user state, login/register/logout, token in localStorage
api/index.js               ← axios instance (baseURL /api), auth header interceptor, 401 → /login
components/
  Layout.jsx               ← Sidebar + Navbar shell for all protected pages
  Sidebar.jsx              ← collapsible, role-based nav items
  Navbar.jsx               ← top bar with user avatar/role
  StatCard.jsx             ← KPI cards used in dashboards
  CourseCard.jsx           ← course grid cards
  TutorCard.jsx            ← tutor grid cards
  Table.jsx                ← generic data table with loading skeleton
  Modal.jsx                ← reusable modal (sm/md/lg)
  ThreeBackground.jsx      ← Three.js 3D wireframe shapes for landing page hero
  LoadingSpinner.jsx       ← full-page Framer Motion spinner
pages/
  LandingPage.jsx          ← dark hero + 3D background + features + CTA
  LoginPage.jsx
  RegisterPage.jsx
  student/StudentDashboard.jsx
  teacher/TeacherDashboard.jsx
  admin/AdminDashboard.jsx
  parent/ParentDashboard.jsx
  CoursesPage.jsx
  CourseDetailPage.jsx
  AssignmentsPage.jsx
  TutorsPage.jsx
```

**Routing:** `/dashboard` redirects to the role-specific route. `RoleRoute` enforces role access. All protected pages are wrapped in `<Layout>`.

### Design System

- **Primary:** `#2563EB` (blue-600) — Tailwind token `primary-600`
- **Accent/CTA:** `#F97316` (orange-500) — Tailwind token `accent-500`
- **Background:** `#F8FAFC` (slate-50)
- **Text:** `#1E293B` (slate-800)
- **Landing dark bg:** `#0F172A`
- **Font:** Plus Jakarta Sans (400–800), loaded via Google Fonts in `index.html`
- **Icons:** Lucide React only
- **Animations:** Framer Motion, 150–300ms ease-out

### Key Design Decisions

- **Live classes:** No video. Teacher posts a Google Meet URL → stored in `LiveClass` table → student clicks "Join Class" which opens it in a new tab and auto-marks attendance as `present`.
- **WhatsApp:** No API. Just `course.whatsappGroupLink` field; students click to open.
- **Parent access:** Read-only. Linked to student via `user.parentId`.
- **Attendance:** Auto-set `present` on join; teacher can manually override.

### Out of Scope

Real-time chat, notifications, payment processing, video streaming, analytics, mobile apps.
