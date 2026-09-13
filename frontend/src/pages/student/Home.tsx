import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentShell from '../../components/dashboard/StudentShell';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { getMyStudentBookings, getMyFavoriteIds } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateTimeRange, formatLocationType, safeMeetingUrl } from '../../utils/labels';
import type { Booking } from '../../types';

function NextCourseCard({ booking, onOpen }: { booking: Booking; onOpen: () => void }) {
  const online = booking.locationType === 'ONLINE';
  const canJoin = online && (booking.status === 'ACCEPTED' || booking.status === 'COMPLETED') && safeMeetingUrl(booking.meetingLink);
  return (
    <div className="next-course-card">
      <div className="next-course-card__head">
        <Avatar name={booking.professorName} src={booking.professorProfilePhoto || undefined} size="md" />
        <div className="next-course-card__info">
          <h3>{booking.offerTitle}</h3>
          <p className="muted">
            {booking.professorName} · {booking.subjectLabel}
            {booking.professorRating != null ? (
              <span className="rating-inline"><Icon name="star" size={13} /> {Number(booking.professorRating).toFixed(1)}</span>
            ) : null}
          </p>
        </div>
        <StatusBadge status={booking.status} kind="booking" />
      </div>
      <div className="next-course-card__body">
        <p className="next-course-card__when">
          <Icon name="calendar" size={16} /> {formatDateTimeRange(booking.scheduledAt, booking.durationMinutes || 60)}
        </p>
        <p className="muted"><Icon name="video" size={15} /> {online ? `Cours en ligne${booking.meetingPlatform ? ` · ${booking.meetingPlatform}` : ''}` : formatLocationType(booking.locationType || undefined)}</p>
      </div>
      <div className="next-course-card__actions">
        <Button size="sm" variant="outline" onClick={onOpen}>Voir la réservation</Button>
        {canJoin ? (
          <a href={safeMeetingUrl(booking.meetingLink)} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--sm">
            <Icon name="video" size={18} className="cc-icon" /> Rejoindre le cours
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default function StudentHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getMyStudentBookings(), getMyFavoriteIds()])
      .then(([b, f]) => {
        if (!mounted) return;
        setBookings(b);
        setFavorites(f);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const now = Date.now();
  const stats = useMemo(() => {
    const upcoming = bookings.filter((b) => (b.status === 'PENDING' || b.status === 'ACCEPTED') && new Date(b.scheduledAt).getTime() >= now).length;
    const pending = bookings.filter((b) => b.status === 'PENDING').length;
    const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
    return { total: bookings.length, upcoming, pending, completed };
  }, [bookings, now]);

  const nextCourses = useMemo(
    () =>
      bookings
        .filter((b) => b.status === 'ACCEPTED' && new Date(b.scheduledAt).getTime() >= now)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 3),
    [bookings, now],
  );

  const recent = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => new Date(b.createdAt || b.scheduledAt).getTime() - new Date(a.createdAt || a.scheduledAt).getTime())
        .slice(0, 3),
    [bookings],
  );

  const firstName = user?.firstName || '';

  return (
    <StudentShell pageTitle="Tableau de bord" subtitle="Bienvenue dans votre espace élève" pendingCount={stats.pending}>
      <div className="dash-hero">
        <div className="dash-hero__content">
          <h2>Bonjour{firstName ? ` ${firstName}` : ''}</h2>
          <p>Trouvez un professeur, réservez vos cours particuliers et suivez vos séances en ligne.</p>
          <div className="dash-hero__actions">
            <Button icon="search" to="/recherche">Rechercher un professeur</Button>
            <Button variant="outline" icon="calendar" to="/student/reservations">Mes réservations</Button>
          </div>
        </div>
      </div>

      {!loading && bookings.length === 0 ? (
        <EmptyState
          title="Aucune réservation pour le moment"
          text="Commencez par trouver un professeur qui vous correspond, puis réservez votre premier cours."
          action={<Button icon="search" to="/recherche">Rechercher un professeur</Button>}
        />
      ) : (
        <>
          <div className="stats-grid">
            <StatCard icon="calendar" label="Réservations" value={stats.total} tone="primary" />
            <StatCard icon="clock" label="À venir" value={stats.upcoming} tone="info" />
            <StatCard icon="star" label="En attente" value={stats.pending} tone="yellow" />
            <StatCard icon="heart" label="Favoris" value={favorites.length} tone="green" />
          </div>

          <section className="dash-card">
            <div className="dash-card__title">
              <h2>Prochains cours</h2>
              <Button size="sm" variant="link" to="/student/reservations?filter=UPCOMING">Tout voir</Button>
            </div>
            {nextCourses.length === 0 ? (
              <EmptyState
                title="Aucun cours à venir"
                text="Vos prochaines séances confirmées apparaîtront ici."
              />
            ) : (
              <div className="next-course-grid">
                {nextCourses.map((b) => (
                  <NextCourseCard key={b.id} booking={b} onOpen={() => navigate(`/student/reservations/${b.id}`)} />
                ))}
              </div>
            )}
          </section>

          <section className="dash-card">
            <div className="dash-card__title">
              <h2>Dernières réservations</h2>
              <Button size="sm" variant="link" to="/student/reservations">Tout voir</Button>
            </div>
            <div className="booking-list">
              {recent.map((b) => (
                <div key={b.id} className="booking-item">
                  <div className="booking-item__head">
                    <div className="booking-item__prof">
                      <Avatar name={b.professorName} src={b.professorProfilePhoto || undefined} size="sm" />
                      <div>
                        <strong>{b.professorName}</strong>
                        <span className="muted"> · {b.subjectLabel} · Niveau {b.levelLabel}</span>
                      </div>
                    </div>
                    <StatusBadge status={b.status} kind="booking" />
                  </div>
                  <div className="booking-item__meta">
                    <span className="booking-meta-item"><Icon name="calendar" size={15} /> {formatDateTimeRange(b.scheduledAt, b.durationMinutes || 60)}</span>
                    <span className="booking-meta-item"><Icon name="video" size={15} /> {b.locationType === 'ONLINE' ? `Cours en ligne${b.meetingPlatform ? ` · ${b.meetingPlatform}` : ''}` : formatLocationType(b.locationType || undefined)}</span>
                    <span className="booking-meta-item"><Icon name="wallet" size={15} /> {Number(b.amount).toFixed(2)} DH</span>
                  </div>
                  <div className="booking-item__actions">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/student/reservations/${b.id}`)}>Voir les détails</Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </StudentShell>
  );
}