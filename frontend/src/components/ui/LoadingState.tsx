interface LoadingStateProps {
  message?: string;
  skeleton?: boolean;
  cards?: number;
}

export default function LoadingState({ message = 'Chargement...', skeleton, cards = 3 }: LoadingStateProps) {
  if (skeleton) {
    return (
      <div className="prof-grid" aria-busy="true" aria-label="Chargement">
        {Array.from({ length: cards }).map((_, i) => (
          <div className="card-skeleton" key={i}>
            <div className="skeleton card-skeleton__avatar" />
            <div className="skeleton card-skeleton__line card-skeleton__line--sm" />
            <div className="skeleton card-skeleton__line card-skeleton__line--xs" />
            <div className="skeleton card-skeleton__line" />
            <div className="skeleton card-skeleton__cta" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="loading" role="status">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}