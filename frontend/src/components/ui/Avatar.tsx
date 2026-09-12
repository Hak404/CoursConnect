type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}

function initials(name?: string): string {
  if (!name) return 'C';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const classes = ['avatar', size !== 'md' ? `avatar--${size}` : '', className || ''].filter(Boolean).join(' ');
  return (
    <span className={classes}>
      {src ? <img src={src} alt={name || ''} /> : <span>{initials(name)}</span>}
    </span>
  );
}