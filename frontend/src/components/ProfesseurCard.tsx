import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ProfessorCard } from '../types';
import { formatLocationType } from '../utils/labels';
import { useFavorites } from '../utils/favorites';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './ui/Avatar';
import Icon from './ui/Icon';
import RatingStarsDisplay from './ui/RatingStarsDisplay';

interface ProfesseurCardProps {
  professor: ProfessorCard;
}

export default function ProfesseurCard({ professor }: ProfesseurCardProps) {
  const fullName = `${professor.firstName} ${professor.lastName}`;
  const mainSubjects = professor.subjects
    .slice(0, 3)
    .map((s) => s.name)
    .join(' · ');
  const levelNames = professor.levels
    .slice(0, 3)
    .map((l) => l.name)
    .join(', ');
  const locationTypes = [...new Set(professor.offers.map((o) => formatLocationType(o.locationType)))];
  const locationsLabel = locationTypes.filter(Boolean).join(' · ');
  const { isFav, toggle } = useFavorites();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFavorite = isFav(professor.id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFav() {
    if (busy) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'STUDENT') {
      setError('Les favoris sont réservés aux élèves.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const result = await toggle(professor.id);
      if (result === 'error') {
        setError('Impossible de mettre à jour les favoris. Veuillez réessayer.');
      } else if (result === 'needs-auth') {
        navigate('/login');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="prof-card">
      <div className="prof-card__cover">
        <Avatar className="prof-card__avatar" name={fullName} src={professor.profilePhoto} size="xl" />
        <button
          type="button"
          className={`prof-card__fav${isFavorite ? ' is-active' : ''}${busy ? ' is-busy' : ''}`}
          onClick={handleFav}
          disabled={busy}
          aria-pressed={isFavorite}
          aria-busy={busy}
          aria-label={
            isFavorite
              ? `Retirer ${fullName} des favoris`
              : `Ajouter ${fullName} aux favoris`
          }
        >
          <Icon name="heart" size={20} className="cc-icon" />
        </button>
        {error && (
          <p className="prof-card__fav-error" role="alert">{error}</p>
        )}
      </div>

      <div className="prof-card__body">
        <div className="prof-card__title">
          <h3 className="prof-card__name">
            <Link to={`/professeur/${professor.id}`}>{fullName}</Link>
          </h3>
          {professor.verified && (
            <span className="prof-card__verified" title="Profil vérifié">
              <Icon name="badge-check" size={15} className="cc-icon" />
              Profil vérifié
            </span>
          )}
        </div>

        <div className="prof-card__rating">
          {professor.averageRating != null ? (
            <>
              <RatingStarsDisplay value={professor.averageRating} size={15} />
              <span className="prof-card__rating-value">{Number(professor.averageRating).toFixed(1)}</span>
              <span className="prof-card__rating-count">
                {professor.totalReviews > 0 ? `${professor.totalReviews} avis` : 'Aucun avis'}
              </span>
            </>
          ) : (
            <span className="muted" style={{ fontSize: '0.85rem' }}>Nouveau professeur</span>
          )}
        </div>

        {mainSubjects && <p className="prof-card__subjects">{mainSubjects}</p>}

        <div className="prof-card__meta">
          {professor.cityName && (
            <span className="prof-card__meta-item">
              <Icon name="map-pin" size={14} className="cc-icon" />
              {professor.cityName}
            </span>
          )}
          {levelNames && (
            <span className="prof-card__meta-item">
              <Icon name="grad-hat" size={14} className="cc-icon" />
              {levelNames}
            </span>
          )}
          {locationsLabel && (
            <span className="prof-card__meta-item">
              <Icon name="home" size={14} className="cc-icon" />
              {locationsLabel}
            </span>
          )}
        </div>

        {professor.bio && <p className="prof-card__bio">{professor.bio}</p>}
      </div>

      <div className="prof-card__foot">
        <div className="prof-card__price">
          {professor.minPrice != null ? (
            <>
              <span className="prof-card__price-from">À partir de</span>
              <span className="prof-card__price-amount">{professor.minPrice} DH</span>
              <span className="prof-card__price-unit">/ heure</span>
            </>
          ) : (
            <span className="prof-card__price-unit">Tarif non publié</span>
          )}
        </div>
        <Link to={`/professeur/${professor.id}`} className="btn btn--primary btn--sm">
          Voir le profil
          <Icon name="arrow-right" size={15} />
        </Link>
      </div>
    </article>
  );
}