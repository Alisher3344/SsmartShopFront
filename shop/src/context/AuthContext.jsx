import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, clearToken, getToken, setToken } from '../api/client';

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sahifa yuklanganda — token bo'lsa, /me chaqirib joriy userni olamiz
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.me()
      .then(setUser)
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (loginField, password) => {
    try {
      const res = await authApi.login(loginField, password);
      setToken(res.access_token);
      setUser(res.user);
      return { success: true, user: res.user };
    } catch (e) {
      return { success: false, error: e.message || "Login yoki parol noto'g'ri" };
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const isSuperAdmin = user?.role === 'superadmin';
  const isStaff = user?.role === 'staff';
  // isAdmin — admin paneliga kira oladigan har qanday rol
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'staff';

  return (
    <AuthContext.Provider value={{
      user: user ? { ...user, name: user.full_name || user.email } : null,
      login,
      logout,
      isAdmin,
      isSuperAdmin,
      isStaff,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
