import { Link } from 'react-router-dom';
import type { ProfessorCard } from '../types';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import Icon from './ui/Icon';
import RatingStarsDisplay from './ui/RatingStarsDisplay';

interface ProfesseurCardProps {
  professor: ProfessorCard;
}

export default function ProfesseurCard({ professor }: ProfesseurCardProps) {
  const displayedSubjects = professor.subjects.slice(0, 3);
  const overflowCount = professor.subjects.length - 3;
  const teacherLabel = displayedSubjects.length > 0 ? [...new Set(displayedSubjects.map((s) => s.name))].join(' · ') : 'Professeur';

  return (
    <Link to={`/professeur/${professor.id}`} className="prof-card" aria-label={`Voir le profil de ${professor.firstName} ${professor.lastName}`}>
      <div className="prof-card__cover" />
      <div className="prof-card__body">
        <div className="prof-card__header">
          <Avatar name={`${professor.firstName} ${professor.lastName}`} src={professor.profilePhoto} size="md" />
          <div style={{ minWidth: 0 }}>
            <p className="prof-card__teacher">{teacherLabel}</p>
            <h3 className="prof-card__name">
              {professor.firstName} {professor.lastName}
            </h3>
          </div>
        </div>

        <p className="prof-card__ville">
          <Icon name="map-pin" size={15} className="cc-icon" />
          {professor.cityName || 'Cours en ligne ou à domicile'}
        </p>

        <div className="prof-card__rating" style={{ justifyContent: 'flex-start' }}>
          {professor.averageRating != null ? (
            <>
              <RatingStarsDisplay value={professor.averageRating} size={15} />
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{Number(professor.averageRating).toFixed(1)}</span>
              {professor.totalReviews > 0 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                  ({professor.totalReviews})
                </span>
              )}
            </>
          ) : (
            <span className="muted" style={{ fontSize: '0.85rem' }}>Nouveau professeur</span>
          )}
        </div>

        {professor.bio && <p className="prof-card__bio">{professor.bio}</p>}

        {displayedSubjects.length > 0 && (
          <div className="prof-card__levels">
            {displayedSubjects.map((s) => (
              <Badge key={s.id} variant="blue">{s.name}</Badge>
            ))}
            {overflowCount > 0 && <Badge variant="gray">+{overflowCount}</Badge>}
          </div>
        )}
      </div>

      <div className="prof-card__foot">
        <div className="prof-card__tarif">
          {professor.minPrice != null ? (
            <>
              <span className="amount">{professor.minPrice} DH</span>
              <span className="unit">par heure</span>
            </>
          ) : (
            <>
              <span className="amount">—</span>
              <span className="unit">tarif non publié</span>
            </>
          )}
        </div>
        <span className="btn btn--outline btn--sm">
          Voir le profil
          <Icon name="arrow-right" size={15} />
        </span>
      </div>
    </Link>
  );
}