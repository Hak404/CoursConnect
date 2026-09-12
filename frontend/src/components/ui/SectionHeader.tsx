import type { ReactNode } from 'react';
import Icon, { type IconName } from './Icon';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  action?: ReactNode;
}

export default function SectionHeader({ title, subtitle, icon, action }: SectionHeaderProps) {
  return (
    <div className="dash-welcome" style={{ marginBottom: '1.5rem' }}>
      <div>
        <h2 className="dash-welcome__title" style={{ marginBottom: 0 }}>
          {icon && <span style={{ verticalAlign: '-3px', marginRight: '0.4rem' }}><Icon name={icon} size={22} className="cc-icon" /></span>}
          {title}
        </h2>
        {subtitle && <p className="dash-welcome__subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}