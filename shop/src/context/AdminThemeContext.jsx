import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'ssmart_admin_theme';
const AdminThemeContext = createContext(null);

export const useAdminTheme = () => {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error('useAdminTheme AdminThemeProvider ichida ishlatilishi kerak');
  return ctx;
};

export function AdminThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* skip */ }
    return () => {
      // Komponent unmount bo'lganda dark klassini olib tashlaymiz
      // (admin sahifadan chiqib, asosiy saytga o'tganda dark qolib ketmasligi uchun)
      root.classList.remove('dark');
    };
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <AdminThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggle, setTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}
