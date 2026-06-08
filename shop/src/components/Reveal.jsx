import { useRef, useEffect, useState } from 'react';

// Scroll-reveal — element ko'rinish maydoniga kirganda paydo bo'ladi.
// group=true bo'lsa, ichidagi bolalar ketma-ket (stagger) chiqadi.
// Bir marta ko'ringach kuzatuv to'xtaydi (qayta animatsiya bo'lmaydi).
export default function Reveal({ as: Tag = 'div', group = false, className = '', children, ...rest }) {
  const ref = useRef(null);
  // IntersectionObserver bo'lmasa — darhol ko'rsatamiz (graceful fallback)
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { setSeen(true); io.disconnect(); }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const base = group ? 'reveal-group' : 'reveal';
  return (
    <Tag ref={ref} className={`${base} ${seen ? 'is-in' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
