import type { ReactNode } from 'react';

interface EmptyStateProps {
  emoji?: string;
  title?: string;
  text?: string;
  action?: ReactNode;
}

export default function EmptyState({ emoji = '🔍', title, text, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {emoji && <div className="empty-state__icon">{emoji}</div>}
      {title && <h3 className="empty-state__title">{title}</h3>}
      {text && <p className="empty-state__text">{text}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}