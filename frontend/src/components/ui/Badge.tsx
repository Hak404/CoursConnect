import type { ReactNode } from 'react';
import Icon, { type IconName } from './Icon';

type BadgeVariant = 'blue' | 'green' | 'yellow' | 'gray' | 'red' | 'neutral' | 'accent';

const VARIANTS: BadgeVariant[] = ['blue', 'green', 'yellow', 'gray', 'red', 'neutral', 'accent'];

interface BadgeProps {
  variant?: BadgeVariant;
  icon?: IconName;
  children: ReactNode;
  className?: string;
}

export default function Badge({ variant = 'blue', icon, children, className }: BadgeProps) {
  const safeVariant = VARIANTS.includes(variant) ? variant : 'blue';
  const variantClass = safeVariant === 'accent' ? 'badge--yellow' : `badge--${safeVariant}`;
  return (
    <span className={['badge', variantClass, className].filter(Boolean).join(' ')}>
      {icon && <Icon name={icon} size={14} className="cc-icon" />}
      {children}
    </span>
  );
}