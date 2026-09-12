import { useRef, useState } from 'react';

const STAR_PATH = 'M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z';

const LABELS: Record<number, string> = {
  1: 'Très mauvais',
  2: 'Mauvais',
  3: 'Moyen',
  4: 'Très bien',
  5: 'Excellent',
};

function StarIcon({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      style={{ width: size, height: size, display: 'block' }}
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
  showLabel?: boolean;
  id?: string;
}

export default function RatingStars({ value, onChange, readonly = false, size = 32, showLabel = true, id }: RatingStarsProps) {
  const [hovered, setHovered] = useState(0);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const isReadonly = readonly || !onChange;
  const active = hovered > 0 ? hovered : value;

  function setValue(n: number) {
    if (isReadonly) return;
    onChange?.(n);
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (isReadonly) return;
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = Math.min(5, index + 1);
    else if (e.key === 'ArrowLeft') next = Math.max(1, index - 1);
    else if (e.key === 'Home') next = 1;
    else if (e.key === 'End') next = 5;
    if (next == null) return;
    e.preventDefault();
    setValue(next);
    btnRefs.current[next - 1]?.focus();
  }

  return (
    <div className="stars-rating" id={id} role="radiogroup" aria-label="Note">
      <div className="stars-rating__row">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            ref={(el) => { btnRefs.current[n - 1] = el; }}
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} étoile${n > 1 ? 's' : ''} : ${LABELS[n]}`}
            className={n <= active ? 'stars-rating__btn on' : 'stars-rating__btn'}
            tabIndex={isReadonly || (value !== n && (value !== 0 || n !== 1)) ? -1 : 0}
            disabled={isReadonly}
            onMouseEnter={() => !isReadonly && setHovered(n)}
            onMouseLeave={() => !isReadonly && setHovered(0)}
            onFocus={() => !isReadonly && setHovered(n)}
            onBlur={() => !isReadonly && setHovered(0)}
            onClick={() => setValue(n)}
            onKeyDown={(e) => handleKeyDown(e, n)}
          >
            <StarIcon size={size} />
          </button>
        ))}
      </div>

      {showLabel && (
        <p className={`stars-rating__label ${active >= 1 ? '' : 'is-muted'}`} aria-hidden="true">
          {active >= 1 ? LABELS[active] : 'Sélectionnez une note'}
        </p>
      )}
      <span className="sr-only" role="status">
        {value >= 1 ? `Note sélectionnée : ${LABELS[value]}` : 'Aucune note sélectionnée'}
      </span>
    </div>
  );
}