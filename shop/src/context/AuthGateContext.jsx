import { createContext, useCallback, useContext, useRef, useState } from 'react';
import LoginModal from '../components/LoginModal';

const AuthGateContext = createContext(null);

export const useAuthGate = () => {
  const ctx = useContext(AuthGateContext);
  if (!ctx) throw new Error('useAuthGate must be used within AuthGateProvider');
  return ctx;
};

/**
 * Foydalanuvchi ro'yxatdan o'tmagan bo'lsa - LoginModal ochadi.
 * Login muvaffaqiyatli bo'lganda - kutilayotgan amalni bajaradi.
 */
export const AuthGateProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const pendingAction = useRef(null);

  const requireAuth = useCallback((action) => {
    if (localStorage.getItem('ssmart_user')) {
      action?.();
      return true;
    }
    pendingAction.current = action || null;
    setOpen(true);
    return false;
  }, []);

  const handleClose = () => {
    pendingAction.current = null;
    setOpen(false);
  };

  const handleSuccess = () => {
    const action = pendingAction.current;
    pendingAction.current = null;
    setOpen(false);
    action?.();
  };

  return (
    <AuthGateContext.Provider value={{ requireAuth }}>
      {children}
      <LoginModal open={open} onClose={handleClose} onSuccess={handleSuccess} />
    </AuthGateContext.Provider>
  );
};
