import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Set axios default Authorization header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // On mount, validate stored token
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
        const response = await axios.get('/api/auth/me')
        setUser(response.data.user || response.data)
        setToken(storedToken)
      } catch (error) {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        delete axios.defaults.headers.common['Authorization']
      } finally {
        setLoading(false)
      }
    }

    validateToken()
  }, [])

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password })
    const { token: newToken, user: newUser } = response.data

    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(newUser)
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

    return newUser
  }

  const register = async (name, email, password, role, grade) => {
    const response = await axios.post('/api/auth/register', {
      name,
      email,
      password,
      role,
      grade,
    })
    const { token: newToken, user: newUser } = response.data

    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(newUser)
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

    return newUser
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
