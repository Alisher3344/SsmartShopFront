const BASE = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets';

const ASSETS = {
  card: 'Credit%20card/3D/credit_card_3d.png',
  cash: 'Dollar%20banknote/3D/dollar_banknote_3d.png',
  check: 'Check%20mark%20button/3D/check_mark_button_3d.png',
};

export default function FluentEmoji({ name, size = 16, className = '' }) {
  const path = ASSETS[name];
  if (!path) return null;
  return (
    <img
      src={`${BASE}/${path}`}
      alt=""
      style={{ width: size, height: size }}
      className={`inline-block object-contain align-middle ${className}`}
      draggable={false}
    />
  );
}
