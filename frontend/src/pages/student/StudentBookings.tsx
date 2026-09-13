import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StudentShell from '../../components/dashboard/StudentShell';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import ReviewModal from '../../components/ui/ReviewModal';
import StatusBadge from '../../components/ui/StatusBadge';
import { getMyStudentBookings, cancelBooking, createReview } from '../../services/api';
import { formatDateTimeRange, formatLocationType, formatPaymentMethod, formatPaymentStatus, safeMeetingUrl } from '../../utils/labels';
import type { Booking } from '../../types';

type Filter = 'ALL' | 'PENDING' | 'ACCEPTED' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

const TABS: { id: Filter; label: string }[] = [
  { id: 'ALL', label: 'Toutes' },
  { id: 'PENDING', label: 'En attente' },
  { id: 'ACCEPTED', label: 'Confirmées' },
  { id: 'UPCOMING', label: 'À venir' },
  { id: 'COMPLETED', label: 'Terminées' },
  { id: 'CANCELLED', label: 'Annulées' },
];

function matchesFilter(b: Booking, f: Filter, nowMs: number): boolean {
  if (f === 'ALL') return true;
  if (f === 'UPCOMING') return (b.status === 'PENDING' || b.status === 'ACCEPTED') && new Date(b.scheduledAt).getTime() >= nowMs;
  if (f === 'CANCELLED') return b.status === 'CANCELLED' || b.status === 'REJECTED';
  return b.status === f;
}

function bookingSort(a: Booking, b: Booking): number {
  const sa = new Date(a.scheduledAt).getTime();
  const sb = new Date(b.scheduledAt).getTime();
  return sb - sa;
}

export default function StudentBookings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFilter = searchParams.get('filter') as Filter | null;
  const initial = TABS.some((t) => t.id === queryFilter) ? queryFilter! : 'ALL' as Filter;
  const [filter, setFilter] = useState<Filter>(initial);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let mounted = true;
    getMyStudentBookings()
      .then((b) => mounted && setBookings(b))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(''), 6000);
    return () => window.clearTimeout(t);
  }, [notice]);

  const now = Date.now();
  const filtered = useMemo(() => bookings.filter((b) => matchesFilter(b, filter, now)).sort(bookingSort), [bookings, filter, now]);
  const pendingCount = useMemo(() => bookings.filter((b) => b.status === 'PENDING').length, [bookings]);

  function setFilterAndParams(f: Filter) {
    setFilter(f);
    const sp = new URLSearchParams(searchParams);
    if (f === 'ALL') sp.delete('filter');
    else sp.set('filter', f);
    setSearchParams(sp, { replace: true });
  }

  async function handleCancel(id: number) {
    if (!window.confirm('Annuler cette réservation ?')) return;
    try {
      await cancelBooking(id);
      setBookings(await getMyStudentBookings());
      setNotice('Réservation annulée.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Erreur lors de l\'annulation.');
    }
  }

  function openReview(b: Booking) {
    setReviewError('');
    setReviewTarget(b);
  }

  async function handleSubmitReview(rating: number, comment: string) {
    if (!reviewTarget) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      await createReview(reviewTarget.id, { rating, comment: comment.trim() || undefined });
      setBookings(await getMyStudentBookings());
      setReviewTarget(null);
      setNotice('Avis publié. Merci !');
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Erreur lors de la publication.');
    } finally {
      setReviewSubmitting(false);
    }
  }

  return (
    <StudentShell pageTitle="Mes Réservations" subtitle={`${filtered.length} réservation(s)${filter !== 'ALL' ? ` · filtre : ${TABS.find((t) => t.id === filter)?.label}` : ''}`} pendingCount={pendingCount}>
      {notice && <div className="success-banner">{notice}</div>}

      <div className="seg-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={filter === t.id} className={`seg-tab${filter === t.id ? ' is-active' : ''}`} onClick={() => setFilterAndParams(t.id)}>
            {t.label}{t.id === 'ALL' ? ` (${bookings.length})` : ''}
          </button>
        ))}
      </div>

      <div className="booking-list">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="booking-item booking-item--skeleton"><div className="skeleton skeleton--line skeleton--wide" /></div>)
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filter === 'ALL' ? 'Aucune réservation' : `Aucune réservation ${TABS.find((t) => t.id === filter)?.label.toLowerCase() || ''}`}
            text="Réservez votre prochain cours depuis la page du professeur."
            action={<Button icon="search" to="/recherche">Rechercher un professeur</Button>}
          />
        ) : (
          filtered.map((b) => {
            const canCancel = b.status === 'PENDING' || b.status === 'ACCEPTED';
            const online = b.locationType === 'ONLINE';
            const canJoin = online && (b.status === 'ACCEPTED' || b.status === 'COMPLETED') && safeMeetingUrl(b.meetingLink);
            return (
              <article key={b.id} className="booking-item">
                <div className="booking-item__head">
                  <div className="booking-item__prof">
                    <Avatar name={b.professorName} src={b.professorProfilePhoto || undefined} size="md" />
                    <div>
                      <h3>{b.offerTitle}</h3>
                      <p className="muted">
                        {b.professorName} · {b.subjectLabel} · Niveau {b.levelLabel}
                        {b.professorRating != null ? (
                          <span className="rating-inline"><Icon name="star" size={13} /> {Number(b.professorRating).toFixed(1)} ({b.professorReviewCount ?? 0})</span>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={b.status} kind="booking" />
                </div>

                <div className="booking-item__meta">
                  <span className="booking-meta-item"><Icon name="calendar" size={15} /> {formatDateTimeRange(b.scheduledAt, b.durationMinutes || 60)}</span>
                  <span className="booking-meta-item"><Icon name="video" size={15} /> {online ? `Cours en ligne${b.meetingPlatform ? ` · ${b.meetingPlatform}` : ''}` : formatLocationType(b.locationType || undefined)}</span>
                  <span className="booking-meta-item"><Icon name="wallet" size={15} /> {Number(b.amount).toFixed(2)} DH · {formatPaymentMethod(b.paymentMethod)} · {formatPaymentStatus(b.paymentStatus)}</span>
                </div>

                {online && (b.status === 'ACCEPTED' || b.status === 'COMPLETED') && (
                  <div className="booking-meeting">
                    <div className="booking-meeting__head">
                      <span className="booking-meeting__label">Cours en ligne</span>
                      {canJoin ? <Badge variant="green" icon="check-circle">Prêt</Badge> : <Badge variant="yellow" icon="clock">Lien à venir</Badge>}
                    </div>
                    {canJoin ? (
                      <>
                        <a href={safeMeetingUrl(b.meetingLink)} target="_blank" rel="noopener noreferrer" className="booking-meeting__link">
                          Rejoindre la séance{b.meetingPlatform ? ` (${b.meetingPlatform})` : ''}
                        </a>
                        {b.meetingInstructions ? <p className="booking-meeting__instr">{b.meetingInstructions}</p> : null}
                      </>
                    ) : (
                      <p className="muted">Le lien du cours sera ajouté prochainement par le professeur. Vous recevrez une notification.</p>
                    )}
                  </div>
                )}

                {b.meetingLocation && (b.status === 'ACCEPTED' || b.status === 'COMPLETED') && !online && (
                  <div className="booking-meeting">
                    <span className="booking-meeting__label">Lieu</span>
                    <p>{b.meetingLocation}</p>
                  </div>
                )}

                <div className="booking-item__actions">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/student/reservations/${b.id}`)}>Voir les détails</Button>
                  {canJoin ? (
                    <a href={safeMeetingUrl(b.meetingLink)} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--sm"><Icon name="video" size={18} className="cc-icon" /> Rejoindre</a>
                  ) : null}
                  {canCancel ? (
                    <Button size="sm" variant="danger-ghost" icon="x" onClick={() => handleCancel(b.id)}>Annuler</Button>
                  ) : null}
                  {b.status === 'COMPLETED' && (
                    <Button size="sm" variant="outline" icon="star" onClick={() => openReview(b)}>
                      Laisser un avis
                    </Button>
                  )}
                </div>

                {b.status === 'COMPLETED' && b.hasReview && (
                  <div className="booking-review-badge"><Badge variant="green" icon="check">Avis publié pour ce cours</Badge></div>
                )}
              </article>
            );
          })
        )}
      </div>

      {reviewTarget && (
        <ReviewModal
          open
          professorName={reviewTarget.professorName}
          offerTitle={reviewTarget.offerTitle}
          submitting={reviewSubmitting}
          error={reviewError}
          onClose={() => setReviewTarget(null)}
          onSubmit={handleSubmitReview}
        />
      )}
    </StudentShell>
  );
}