// Material Symbols Outlined ikonkasi uchun qulay komponent.
// Tailwind klasslari (matn rangi, hajm) bilan ishlaydi.
// Hajm: `text-base` = 16px, `text-xl` = 20px, `text-2xl` = 24px va h.k.
export default function MIcon({ name, className = '', size, fill = false, weight = 400, style, ...rest }) {
  const inlineStyle = {
    fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
    fontSize: size ? `${size}px` : undefined,
    ...style,
  };
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={inlineStyle}
      aria-hidden="true"
      {...rest}
    >
      {name}
    </span>
  );
}
