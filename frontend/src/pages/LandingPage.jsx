import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Users, GraduationCap, BarChart3, Star, Cpu, FlaskConical, Palette } from 'lucide-react'
import ThreeBackground from '../components/ThreeBackground'

const features = [
  {
    icon: BookOpen,
    title: 'Rich Course Library',
    description: 'Access hundreds of courses across subjects, taught by qualified instructors.',
  },
  {
    icon: GraduationCap,
    title: 'Expert Tutors',
    description: 'One-on-one tutoring sessions with verified subject matter experts.',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Real-time dashboards to monitor student performance and growth.',
  },
  {
    icon: Users,
    title: 'Community Learning',
    description: 'Collaborative classrooms and group learning environments.',
  },
]

const categories = [
  { label: 'Tech', icon: Cpu, color: 'from-blue-500 to-cyan-500' },
  { label: 'Test Prep', icon: BarChart3, color: 'from-purple-500 to-violet-500' },
  { label: 'Arts', icon: Palette, color: 'from-orange-500 to-amber-500' },
]

export default function LandingPage() {
  const [featuredCourses, setFeaturedCourses] = useState([])

  useEffect(() => {
    fetch('/api/courses?featured=true')
      .then((r) => r.json())
      .then((data) => setFeaturedCourses(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <ThreeBackground />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">VC</span>
            </div>
            <span className="font-bold text-lg text-white">Virtual City School</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-150"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary-500 mb-4 px-3 py-1 rounded-full border border-primary-800 bg-primary-900/40">
              Next-Gen Education Platform
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-snug mb-6 max-w-4xl mx-auto">
              Education Built for the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
                Digital Age
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
              Virtual City School brings students, teachers, parents, and administrators together
              in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base transition-colors duration-150"
              >
                Start Learning Free
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold text-base transition-colors duration-150"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-900 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to learn
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              A complete school management and learning platform in one place.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 flex flex-col gap-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary-900/60 border border-primary-800 flex items-center justify-center">
                    <Icon size={20} className="text-primary-400" />
                  </div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-[#0F172A] py-16 px-6 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Browse by Category</h2>
            <p className="text-slate-400">Find courses that match your interests and goals</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.map((cat, i) => {
              const Icon = cat.icon
              return (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link
                    to="/register"
                    className={`flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r ${cat.color} hover:opacity-90 transition-opacity`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={22} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{cat.label}</p>
                      <p className="text-white/70 text-sm">Explore courses →</p>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="bg-slate-900 py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-10"
            >
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Featured Courses</h2>
                <p className="text-slate-400">Top-rated courses handpicked for you</p>
              </div>
              <Link to="/register" className="text-sm font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                View all <ArrowRight size={15} />
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredCourses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="bg-slate-800/70 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-500 transition-colors"
                >
                  {course.imageUrl && (
                    <img src={course.imageUrl} alt={course.title} className="w-full h-36 object-cover" />
                  )}
                  <div className="p-4">
                    {course.category && (
                      <span className="text-xs font-semibold text-primary-400 uppercase tracking-wide">{course.category}</span>
                    )}
                    <h3 className="font-semibold text-white mt-1 line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{course.instructor?.name}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs text-slate-300">{course.rating?.toFixed(1)}</span>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {course.price === 0 ? 'Free' : `$${Number(course.price).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-[#0F172A] py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
            Join thousands of students and educators on Virtual City School today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-base transition-colors duration-150"
          >
            Create Free Account
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Virtual City School. All rights reserved.</p>
      </footer>
    </div>
  )
}
