import RatingStarsDisplay from './RatingStarsDisplay';

interface RatingSummaryProps {
  average: number | null | undefined;
  count: number;
  distribution?: Partial<Record<number, number>>;
}

function defaultDistribution(count: number): Record<number, number> {
  if (count <= 0) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  return { 5: count, 4: 0, 3: 0, 2: 0, 1: 0 };
}

export default function RatingSummary({ average, count, distribution }: RatingSummaryProps) {
  const dist = distribution && count > 0 ? distribution : defaultDistribution(count);
  const total = count > 0 ? count : 1;

  return (
    <div className="review-summary">
      <div className="review-summary__score">
        <p className="review-summary__label">Note moyenne</p>
        <div className="review-summary__avg">
          {average != null ? average.toFixed(1) : '—'}
          <small> / 5</small>
        </div>
        <RatingStarsDisplay value={average ?? 0} size={18} />
        <p className="review-summary__total">{count} avis</p>
      </div>
      <div className="rating-summary">
        {[5, 4, 3, 2, 1].map((n) => {
          const c = dist[n] || 0;
          const pct = ((c / total) * 100).toFixed(0);
          return (
            <div className="rating-summary__row" key={n}>
              <span className="rating-summary__label">{n}</span>
              <span className="rating-summary__track">
                <span className="rating-summary__fill" style={{ width: `${Math.max(Number(pct), c > 0 ? 4 : 0)}%` }} />
              </span>
              <span className="rating-summary__count">{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}