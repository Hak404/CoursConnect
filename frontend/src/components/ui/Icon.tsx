export type IconName =
  | 'search'
  | 'map-pin'
  | 'calendar'
  | 'clock'
  | 'wallet'
  | 'star'
  | 'check'
  | 'check-circle'
  | 'menu'
  | 'x'
  | 'users'
  | 'logout'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'edit'
  | 'trash'
  | 'plus'
  | 'shield'
  | 'mail'
  | 'phone'
  | 'arrow-left'
  | 'arrow-right'
  | 'bell'
  | 'book'
  | 'video'
  | 'home'
  | 'settings'
  | 'eye'
  | 'trend-up'
  | 'award'
  | 'info'
  | 'compass'
  | 'grad-hat'
  | 'badge-check'
  | 'heart'
  | 'camera';

interface IconDef {
  d: string | string[];
  filled?: boolean;
}

const ICONS: Record<IconName, IconDef> = {
  search: { d: ['M11 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10z', 'm21 21-4.35-4.35'] },
  'map-pin': { d: ['M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z', 'M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'] },
  calendar: { d: ['M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z', 'M16 2v4', 'M8 2v4', 'M3 10h18'] },
  clock: { d: ['M12 12a10 10 0 1 0 0 0z', 'M12 6v6l4 2'] },
  wallet: { d: ['M21 12V7H5a2 2 0 0 1 0-4h14v4', 'M3 5v14a2 2 0 0 0 2 2h16v-5', 'M18 12a2 2 0 0 0 0 4h4v-4Z'] },
  star: { d: 'M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z', filled: true },
  check: { d: 'M20 6 9 17l-5-5', filled: true },
  'check-circle': { d: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'm9 12 2 2 4-4', 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z'] },
  menu: { d: ['M4 6h16', 'M4 12h16', 'M4 18h16'] },
  x: { d: ['M18 6 6 18', 'M6 6l12 12'] },
  users: { d: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M21 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'] },
  logout: { d: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'] },
  'chevron-down': { d: 'm6 9 6 6 6-6' },
  'chevron-left': { d: 'm15 18-6-6 6-6' },
  'chevron-right': { d: 'm9 18 6-6-6-6' },
  edit: { d: ['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', 'M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'] },
  trash: { d: ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'] },
  plus: { d: ['M12 5v14', 'M5 12h14'] },
  shield: { d: ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'm9 12 2 2 4-4'] },
  mail: { d: ['M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Z', 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'] },
  phone: { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z' },
  'arrow-left': { d: ['m12 19-7-7 7-7', 'M19 12H5'] },
  'arrow-right': { d: ['M5 12h14', 'm12 5 7 7-7 7'] },
  bell: { d: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'] },
  book: { d: ['M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z', 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'] },
  video: { d: ['m22 8-6 4 6 4V8Z', 'M14 6H2.5C1.7 6 1 6.7 1 7.5v9c0 .8.7 1.5 1.5 1.5H14c.8 0 1.5-.7 1.5-1.5v-9C15.5 6.7 14.8 6 14 6Z'] },
  home: { d: ['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'] },
  settings: { d: ['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2.13 2.13 0 0 0-2.73.73l-.22.38a2.13 2.13 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2.13 2.13 0 0 0-.73 2.73l.22.38a2.13 2.13 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2.13 2.13 0 0 0 2.73-.73l.22-.39a2.13 2.13 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2.13 2.13 0 0 0 .73-2.73l-.22-.38a2.13 2.13 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'] },
  eye: { d: ['M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z', 'M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'] },
  'trend-up': { d: ['M22 7 13.5 15.5 8.5 10.5 2 17', 'M16 7h6v6'] },
  award: { d: ['M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M15.477 12.89 17 22l-5-3-5 3 1.523-9.11'] },
  info: { d: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 16v-4', 'M12 8h.01'] },
  compass: { d: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'm16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z'] },
  'grad-hat': { d: ['M22 10 12 5 2 10l10 5 10-5z', 'M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5', 'M22 10v6'] },
  'badge-check': { d: ['M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z', 'm9 12 2 2 4-4'] },
  heart: { d: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z' },
  camera: { d: ['M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z', 'M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'] },
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 24, className }: IconProps) {
  const def = ICONS[name];
  const paths = Array.isArray(def.d) ? def.d : [def.d];
  const common = {
    width: size,
    height: size,
    className,
    style: { width: size, height: size, flexShrink: 0, display: 'inline-block' as const },
    'aria-hidden': true,
  } as const;

  return def.filled ? (
    <svg viewBox="0 0 24 24" fill="currentColor" {...common}>
      {paths.map((p) => <path key={p} d={p} />)}
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...common}
    >
      {paths.map((p) => <path key={p} d={p} />)}
    </svg>
  );
}