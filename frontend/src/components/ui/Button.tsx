import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Icon, { type IconName } from './Icon';

type Variant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'danger-ghost' | 'link';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Variant[] = ['primary', 'accent', 'secondary', 'outline', 'ghost', 'danger', 'danger-ghost', 'link'];

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  loading?: boolean;
  icon?: IconName;
  to?: string;
  children?: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  full,
  loading,
  icon,
  to,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  const safeVariant = VARIANTS.includes(variant) ? variant : 'primary';
  const classes = [
    'btn',
    `btn--${safeVariant}`,
    size !== 'md' ? `btn--${size}` : '',
    full ? 'btn--full' : '',
    className || '',
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {loading ? (
        <span className="btn--spinner" aria-hidden="true" />
      ) : (
        icon && <Icon name={icon} size={18} className="cc-icon" />
      )}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} aria-busy={loading || undefined}>
        {content}
      </Link>
    );
  }

  return (
    <button {...rest} className={classes} disabled={disabled || loading} aria-busy={loading || undefined}>
      {content}
    </button>
  );
}