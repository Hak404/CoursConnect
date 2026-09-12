import Icon from './Icon';

interface RatingStarsDisplayProps {
  value: number | null | undefined;
  size?: number;
  showValue?: boolean;
  count?: number;
  className?: string;
}

function StarRow({ size }: { size: number }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={size} className="cc-icon" />
      ))}
    </>
  );
}

export default function RatingStarsDisplay({ value, size = 16, showValue, count, className }: RatingStarsDisplayProps) {
  const rating = value || 0;
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));

  return (
    <span className={['stars', className].filter(Boolean).join(' ')}>
      <span className="stars__box" style={{ width: size * 5, height: size }}>
        <span className="stars__track" aria-hidden="true">
          <StarRow size={size} />
        </span>
        <span className="stars__fill" style={{ width: pct }} aria-hidden="true">
          <StarRow size={size} />
        </span>
      </span>
      <span className="sr-only">{rating.toFixed(1)} sur 5</span>
      {showValue && <span className="stars__value">{rating.toFixed(1)}</span>}
      {count != null && (
        <span className="stars__count">
          ({count} avis)
        </span>
      )}
    </span>
  );
}