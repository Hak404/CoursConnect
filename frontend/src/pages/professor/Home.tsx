import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessorShell from '../../components/dashboard/ProfessorShell';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  getMyProfessorProfile, getMyProfessorBookings, getMyOffers, getProfessorProposals, getMyReviews,
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import {
  formatDateFR, formatTimeFR, formatDateTimeRange, formatCourseType, formatLocationType,
  isSafeMeetingUrl, safeMeetingUrl,
} from '../../utils/labels';
import type { ProfessorProfile, Booking, Offer, PriceProposal, Review } from '../../types';

function UpcomingCard({ booking, onOpen }: { booking: Booking; onOpen: () => void }) {
  const online = booking.locationType === 'ONLINE';
  const canJoin = online && (booking.status === 'ACCEPTED' || booking.status === 'COMPLETED') && safeMeetingUrl(booking.meetingLink);
  return (
    <div className="next-course-card">
      <div className="next-course-card__head">
        <Avatar name={booking.studentName} src={booking.studentProfilePhoto || undefined} size="md" />
        <div className="next-course-card__info">
          <h3>{booking.offerTitle}</h3>
          <p className="muted">
            {booking.studentName} · {booking.subjectLabel || ''}
          </p>
        </div>
        <StatusBadge status={booking.status} kind="booking" />
      </div>
      <div className="next-course-card__body">
        <p className="next-course-card__when">
          <Icon name="calendar" size={16} /> {formatDateTimeRange(booking.scheduledAt, booking.durationMinutes || 60)}
        </p>
        <p className="muted">
          <Icon name={online ? 'video' : 'map-pin'} size={15} /> {online ? 'Cours en ligne' : formatLocationType(booking.locationType || undefined)}
        </p>
      </div>
      <div className="next-course-card__actions">
        <Button size="sm" variant="outline" onClick={onOpen}>Voir les détails</Button>
        {canJoin ? (
          <a href={safeMeetingUrl(booking.meetingLink)} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--sm">
            <Icon name="video" size={18} className="cc-icon" /> Rejoindre la séance
          </a>
        ) : online && booking.status === 'ACCEPTED' ? (
          <Button size="sm" icon="edit" onClick={onOpen}>Ajouter le lien</Button>
        ) : null}
      </div>
    </div>
  );
}

interface TodoItem {
  icon: 'clock' | 'video' | 'wallet' | 'bell';
  title: string;
  text: string;
  cta: string;
  to: string;
}

export default function ProfessorHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const unreadCount = useUnreadCount();
  const [profile, setProfile] = useState<ProfessorProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [proposals, setProposals] = useState<PriceProposal[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getMyProfessorProfile(),
      getMyProfessorBookings(),
      getMyOffers(),
      getProfessorProposals(),
      getMyReviews(),
    ])
      .then(([p, b, o, pr, rv]) => {
        if (!mounted) return;
        setProfile(p);
        setBookings(b);
        setOffers(o);
        setProposals(pr);
        setReviews(rv);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const now = Date.now();
  const stats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === 'PENDING').length;
    const confirmed = bookings.filter((b) => b.status === 'ACCEPTED').length;
    const upcoming = bookings.filter(
      (b) => b.status === 'ACCEPTED' && new Date(b.scheduledAt).getTime() >= now,
    ).length;
    const activeOffers = offers.filter((o) => o.active).length;
    return { pending, confirmed, upcoming, activeOffers };
  }, [bookings, offers, now]);

  const onlineConfirmed = useMemo(
    () =>
      bookings.filter(
        (b) => b.locationType === 'ONLINE' && (b.status === 'ACCEPTED' || b.status === 'COMPLETED'),
      ),
    [bookings],
  );
  const onlineMissingLink = onlineConfirmed.filter((b) => !isSafeMeetingUrl(b.meetingLink)).length;
  const pendingProposals = proposals.filter((p) => p.status === 'PENDING').length;

  const todos = useMemo<TodoItem[]>(() => {
    const list: TodoItem[] = [];
    if (stats.pending > 0) {
      list.push({
        icon: 'clock',
        title: `${stats.pending} demande(s) de réservation en attente`,
        text: 'De nouvelles demandes attendent votre réponse.',
        cta: 'Voir les demandes',
        to: '/professor/reservations?filter=PENDING',
      });
    }
    if (onlineMissingLink > 0) {
      list.push({
        icon: 'video',
        title: `${onlineMissingLink} cours en ligne confirmé(s) sans lien de séance`,
        text: 'Ajoutez le lien pour que vos élèves puissent rejoindre leur cours.',
        cta: 'Ajouter les liens',
        to: '/professor/reservations?filter=ACCEPTED',
      });
    }
    if (pendingProposals > 0) {
      list.push({
        icon: 'wallet',
        title: `${pendingProposals} proposition(s) de tarif en attente`,
        text: 'Des élèves vous ont proposé un tarif à examiner.',
        cta: 'Voir les propositions',
        to: '/professor/reservations?tab=proposals',
      });
    }
    if (unreadCount > 0) {
      list.push({
        icon: 'bell',
        title: `${unreadCount} notification(s) non lue(s)`,
        text: 'Les annulations et nouvelles demandes apparaissent ici.',
        cta: 'Voir les notifications',
        to: '/professor/notifications',
      });
    }
    return list;
  }, [stats.pending, onlineMissingLink, pendingProposals, unreadCount]);

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

  if (loading) {
    return (
      <ProfessorShell pageTitle={`Bonjour${firstName ? ` ${firstName}` : ''}`} subtitle="Voici un aperçu de votre activité." unreadCount={unreadCount}>
        <div className="dash-card">
          <div className="skeleton skeleton--line skeleton--wide" />
          <div className="skeleton skeleton--line" />
        </div>
      </ProfessorShell>
    );
  }

  return (
    <ProfessorShell
      pageTitle={`Bonjour${firstName ? ` ${firstName}` : ''}`}
      subtitle={
        profile?.verified ? (
          <span><Icon name="badge-check" size={15} /> Profil vérifié</span>
        ) : (
          <span className="dash__header-subtitle--muted">Profil en attente de vérification</span>
        )
      }
      action={
        profile ? (
          <Button to={`/professeur/${profile.id}`} variant="outline" icon="eye">Voir ma fiche publique</Button>
        ) : undefined
      }
      unreadCount={unreadCount}
    >
      <div className="stats-grid">
        <StatCard icon="clock" label="Demandes en attente" value={stats.pending} tone="yellow" />
        <StatCard icon="check-circle" label="Réservations confirmées" value={stats.confirmed} tone="green" />
        <StatCard icon="calendar" label="Cours à venir" value={stats.upcoming} tone="info" />
        <StatCard icon="book" label="Offres publiées" value={stats.activeOffers} tone="primary" />
      </div>

      <section className="dash-card">
        <div className="dash-card__title">
          <h2>À faire</h2>
        </div>
        {todos.length === 0 ? (
          <div className="todo-empty">
            <Icon name="check-circle" size={20} />
            <span><strong>Tout est à jour.</strong> Aucune action requise pour le moment.</span>
          </div>
        ) : (
          <div className="todo-list">
            {todos.map((t) => (
              <div key={t.title} className="todo-item">
                <span className="todo-item__icon"><Icon name={t.icon} size={18} /></span>
                <div className="todo-item__body">
                  <p className="todo-item__title">{t.title}</p>
                  <span className="muted">{t.text}</span>
                </div>
                <Button size="sm" variant="outline" to={t.to}>{t.cta}</Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dash-card">
        <div className="dash-card__title">
          <h2>Prochains cours</h2>
          <Button size="sm" variant="link" to="/professor/reservations?filter=UPCOMING">Tout voir</Button>
        </div>
        {nextCourses.length === 0 ? (
          <EmptyState
            emoji="📅"
            title="Aucun cours à venir"
            text="Vos prochaines séances confirmées apparaîtront ici."
          />
        ) : (
          <div className="next-course-grid">
            {nextCourses.map((b) => (
              <UpcomingCard key={b.id} booking={b} onOpen={() => navigate(`/professor/reservations/${b.id}`)} />
            ))}
          </div>
        )}
      </section>

      <section className="dash-card">
        <div className="dash-card__title">
          <h2>Dernières réservations</h2>
          <Button size="sm" variant="link" to="/professor/reservations">Tout voir</Button>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            emoji="📋"
            title="Aucune réservation"
            text="Les réservations de vos élèves apparaîtront ici."
          />
        ) : (
          <div className="booking-list">
            {recent.map((b) => (
              <div key={b.id} className="booking-item">
                <div className="booking-item__head">
                  <div className="booking-item__prof">
                    <Avatar name={b.studentName} src={b.studentProfilePhoto || undefined} size="sm" />
                    <div>
                      <strong>{b.studentName}</strong>
                      <span className="muted"> · {b.offerTitle}</span>
                    </div>
                  </div>
                  <StatusBadge status={b.status} kind="booking" />
                </div>
                <div className="booking-item__meta">
                  <span className="booking-meta-item"><Icon name="calendar" size={15} /> {formatDateFR(b.scheduledAt)} · {formatTimeFR(b.scheduledAt)}{b.durationMinutes ? ` · ${b.durationMinutes} min` : ''}</span>
                </div>
                <div className="booking-item__actions">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/professor/reservations/${b.id}`)}>Voir les détails</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dash-card">
        <div className="dash-card__title">
          <h2>Aperçu des offres</h2>
          <Button size="sm" variant="link" to="/professor/offers">Gérer mes offres</Button>
        </div>
        {offers.length === 0 ? (
          <EmptyState
            emoji="📘"
            title="Aucune offre"
            text="Créez votre première offre pour apparaître dans les recherches d'élèves."
            action={<Button icon="plus" to="/professor/offers/new">Créer une offre</Button>}
          />
        ) : (
          <div className="booking-list">
            {offers.slice(0, 4).map((o) => (
              <div key={o.id} className="booking-item">
                <div className="booking-item__head">
                  <div className="booking-item__title">
                    <h4>{o.title}</h4>
                    <span className="booking-item__meta">
                      <span className="booking-meta-item"><Icon name="wallet" size={16} />{o.price} DH/heure</span>
                      <span className="booking-meta-item"><Icon name="clock" size={16} />{o.durationMinutes} min</span>
                      <span className="booking-meta-item"><Icon name="compass" size={16} />{formatCourseType(o.courseType)} · {formatLocationType(o.locationType)}</span>
                    </span>
                  </div>
                  <Badge variant={o.active ? 'green' : 'neutral'}>{o.active ? 'Active' : 'Inactive'}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </ProfessorShell>
  );
}