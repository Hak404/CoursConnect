import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  hover?: boolean;
}

export default function Card({ padded = true, hover = false, className, children, ...rest }: CardProps) {
  const classes = ['card', padded ? 'card--padded' : '', hover ? 'card--hover' : '', className || '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export { type CardProps };

export interface CardSectionTitleProps {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
  className?: string;
}

export function CardSectionTitle({ icon, title, action, className }: CardSectionTitleProps) {
  return (
    <div className={['dash-card__title', className].filter(Boolean).join(' ')}>
      <h2>
        {icon}
        {title}
      </h2>
      {action}
    </div>
  );
}