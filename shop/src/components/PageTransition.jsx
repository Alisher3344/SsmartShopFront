import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Sahifa o'tishi — har route almashganda kontent silliq fade/slide bilan kiradi.
// pathname'ga key berilgani uchun yangi sahifa qayta mount bo'lib animatsiya o'ynaydi.
// Query (?q=, ?category=) o'zgarsa qayta mount bo'lmaydi — bu ataylab (filtrlar uchun).
export default function PageTransition({ children }) {
  const location = useLocation();

  // Yangi sahifaga o'tganda yuqoriga ko'tarilamiz
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  );
}
