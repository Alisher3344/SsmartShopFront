// Scroll-reveal O'CHIRILGAN: kartalar darhol ko'rinadi.
// Avval scroll'da ketma-ket paydo bo'lardi (IntersectionObserver + reveal-group),
// bu sayt sekin ishlayotgandek taassurot qoldirardi. Endi passthrough —
// faqat className va layout saqlanadi, animatsiya/opacity:0 yo'q.
// `group` propi call-site'lar buzilmasligi uchun qabul qilinadi, lekin ishlatilmaydi.
export default function Reveal({ as: Tag = 'div', group = false, className = '', children, ...rest }) {
  return (
    <Tag className={className} {...rest}>
      {children}
    </Tag>
  );
}
