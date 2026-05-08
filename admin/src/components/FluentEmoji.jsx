const BASE = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets';

const ASSETS = {
  fire: 'Fire/3D/fire_3d.png',
  card: 'Credit%20card/3D/credit_card_3d.png',
  cash: 'Dollar%20banknote/3D/dollar_banknote_3d.png',
  phone: 'Telephone%20receiver/3D/telephone_receiver_3d.png',
  pin: 'Round%20pushpin/3D/round_pushpin_3d.png',
  pushpin: 'Pushpin/3D/pushpin_3d.png',
  clock: 'Alarm%20clock/3D/alarm_clock_3d.png',
  package: 'Package/3D/package_3d.png',
  user: 'Bust%20in%20silhouette/3D/bust_in_silhouette_3d.png',
  wave: 'Waving%20hand/3D/waving_hand_3d.png',
  check: 'Check%20mark%20button/3D/check_mark_button_3d.png',
  cross: 'Cross%20mark/3D/cross_mark_3d.png',
  warning: 'Warning/3D/warning_3d.png',
  search: 'Magnifying%20glass%20tilted%20right/3D/magnifying_glass_tilted_right_3d.png',
  shield: 'Shield/3D/shield_3d.png',
  speech: 'Speech%20balloon/3D/speech_balloon_3d.png',
  numbers: 'Input%20numbers/3D/input_numbers_3d.png',
  star: 'Star/3D/star_3d.png',
  'flag-uz': 'Flag%20Uzbekistan/Flat/flag_uzbekistan_flat.svg',
  'flag-ru': 'Flag%20Russia/Flat/flag_russia_flat.svg',
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
