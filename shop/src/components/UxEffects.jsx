import { useEffect, useState } from 'react';

// Global UX effektlar qatlami — bir marta mount qilinadi (PublicLayout ichida).
//  • Toast      — window 'ssmart:toast'  ({ text, icon }) hodisasiga javoban
//  • Fly-to-cart— window 'ssmart:fly'    ({ rect, img }) — rasm savatga uchadi
//  • Ripple     — [data-ripple] tugmalarda bosilgan nuqtadan to'lqin
// Hodisalar orqali bog'langani uchun komponentlar bir-biriga qaram emas.

let nextToastId = 0;

export default function UxEffects() {
  const [toasts, setToasts] = useState([]);

  // ── Toast ──
  useEffect(() => {
    const onToast = (e) => {
      const { text, icon = 'check_circle' } = e.detail || {};
      if (!text) return;
      const id = ++nextToastId;
      setToasts((p) => [...p, { id, text, icon, leaving: false }]);
      // 2.2s ko'rinadi, keyin chiqib ketadi
      window.setTimeout(() => {
        setToasts((p) => p.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
        window.setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 300);
      }, 2200);
    };
    window.addEventListener('ssmart:toast', onToast);
    return () => window.removeEventListener('ssmart:toast', onToast);
  }, []);

  // ── Fly-to-cart ──
  useEffect(() => {
    const onFly = (e) => {
      const { rect, img } = e.detail || {};
      if (!rect || !img) return;

      // Ko'rinadigan savat nishonini topamiz (header yoki mobil pastki nav)
      const targets = Array.from(document.querySelectorAll('[data-cart-target]'));
      const target =
        targets.find((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.top >= 0 && r.bottom <= window.innerHeight + 1;
        }) || targets[0];
      if (!target) return;

      const tr = target.getBoundingClientRect();
      const size = 76;
      const clone = document.createElement('img');
      clone.src = img;
      clone.className = 'fly-clone';
      clone.style.width = `${size}px`;
      clone.style.height = `${size}px`;
      clone.style.left = `${rect.left + rect.width / 2 - size / 2}px`;
      clone.style.top = `${rect.top + rect.height / 2 - size / 2}px`;
      clone.style.opacity = '0.95';
      clone.style.transition =
        'transform 0.8s cubic-bezier(0.5, -0.25, 0.3, 1.2), opacity 0.8s ease';
      document.body.appendChild(clone);

      const dx = tr.left + tr.width / 2 - (rect.left + rect.width / 2);
      const dy = tr.top + tr.height / 2 - (rect.top + rect.height / 2);

      // ikki rAF — boshlang'ich holat brauzerga "yozilsin", keyin animatsiya
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          clone.style.transform = `translate(${dx}px, ${dy}px) scale(0.16)`;
          clone.style.opacity = '0.25';
        });
      });

      let done = false;
      const cleanup = () => {
        if (done) return;
        done = true;
        clone.remove();
      };
      clone.addEventListener('transitionend', cleanup, { once: true });
      window.setTimeout(cleanup, 1000); // kafolatli tozalash
    };
    window.addEventListener('ssmart:fly', onFly);
    return () => window.removeEventListener('ssmart:fly', onFly);
  }, []);

  // ── Ripple ──
  useEffect(() => {
    const onClick = (e) => {
      const host = e.target.closest('[data-ripple]');
      if (!host) return;
      const r = host.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const ink = document.createElement('span');
      ink.className = 'ripple-ink';
      ink.style.width = ink.style.height = `${size}px`;
      ink.style.left = `${e.clientX - r.left - size / 2}px`;
      ink.style.top = `${e.clientY - r.top - size / 2}px`;
      host.appendChild(ink);
      ink.addEventListener('animationend', () => ink.remove(), { once: true });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div className="toast-wrap" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.leaving ? 'leaving' : ''}`}>
          <span className="material-symbols-outlined toast-ico">{t.icon}</span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
