import { createContext, useContext, useEffect, useState } from 'react'
import { authApi, clearToken, getToken, setToken } from '../api/client'

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth AuthProvider ichida ishlatilishi kerak')
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => {
        clearToken()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    try {
      const res = await authApi.login(username, password)
      if (res.user.role !== 'pickup_admin') {
        return { success: false, error: "Bu hisob punkt admini emas" }
      }
      setToken(res.access_token)
      setUser(res.user)
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message || "Login yoki parol noto'g'ri" }
    }
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
