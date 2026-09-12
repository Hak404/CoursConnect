import type { CSSProperties } from 'react';
import Icon, { type IconName } from './Icon';

type StatTone = 'primary' | 'green' | 'yellow' | 'red' | 'info';

const TONES: Record<StatTone, { bg: string; color: string; tint: string }> = {
  primary: { bg: '#EEF2FF', color: '#4F46E5', tint: '#E0E7FF' },
  green: { bg: '#ECFDF5', color: '#047857', tint: '#D1FAE5' },
  yellow: { bg: '#FFFBEB', color: '#B45309', tint: '#FEF3C7' },
  red: { bg: '#FEF2F2', color: '#B91C1C', tint: '#FEE2E2' },
  info: { bg: '#EFF6FF', color: '#3B82F6', tint: '#DBEAFE' },
};

interface StatCardProps {
  icon: IconName;
  label: string;
  value: string | number;
  tone?: StatTone;
  style?: CSSProperties;
}

export default function StatCard({ icon, label, value, tone = 'primary', style }: StatCardProps) {
  const t = TONES[tone] || TONES.primary;
  return (
    <div className="stat-card" style={{ '--stat-bg': t.bg, '--stat-color': t.color, '--stat-tint': t.tint, ...style } as CSSProperties}>
      <div className="stat-card__icon">
        <Icon name={icon} size={20} />
      </div>
      <div className="stat-card__body">
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__label">{label}</div>
      </div>
    </div>
  );
}