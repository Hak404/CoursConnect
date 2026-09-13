import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentShell from '../../components/dashboard/StudentShell';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Icon from '../../components/ui/Icon';
import ReviewModal from '../../components/ui/ReviewModal';
import StatusBadge from '../../components/ui/StatusBadge';
import { getBooking, cancelBooking, createReview } from '../../services/api';
import { formatDateFR, formatTimeFR, formatLocationType, formatPaymentMethod, formatPaymentStatus, safeMeetingUrl, isSafeMeetingUrl } from '../../utils/labels';
import type { Booking } from '../../types';

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBooking(Number(id))
      .then(setBooking)
      .catch((err) => setError(err instanceof Error ? err.message : 'Réservation introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(''), 6000);
    return () => window.clearTimeout(t);
  }, [notice]);

  async function handleCancel() {
    if (!booking || !window.confirm('Annuler cette réservation ?')) return;
    setCancelling(true);
    try {
      const updated = await cancelBooking(booking.id);
      setBooking(updated);
      setNotice('Réservation annulée.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setCancelling(false);
    }
  }

  async function handleSubmitReview(rating: number, comment: string) {
    if (!booking) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      await createReview(booking.id, { rating, comment: comment.trim() || undefined });
      setBooking(await getBooking(booking.id));
      setReviewOpen(false);
      setNotice('Avis publié. Merci !');
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setReviewSubmitting(false);
    }
  }

  const now = Date.now();
  const online = booking?.locationType === 'ONLINE';
  const canCancel = booking && (booking.status === 'PENDING' || booking.status === 'ACCEPTED');
  const canJoin = online && booking && (booking.status === 'ACCEPTED' || booking.status === 'COMPLETED') && isSafeMeetingUrl(booking.meetingLink);
  const isFuture = booking ? new Date(booking.scheduledAt).getTime() >= now : false;
  const isCompleted = booking?.status === 'COMPLETED';
  const startDT = booking ? new Date(booking.scheduledAt) : null;
  const endDT = startDT && booking?.durationMinutes ? new Date(startDT.getTime() + booking.durationMinutes * 60000) : null;

  return (
    <StudentShell pageTitle="Détail de la réservation" subtitle={booking ? `${booking.offerTitle} — ${booking.professorName}` : ''}>
      {notice && <div className="success-banner">{notice}</div>}
      {error && <div className="error-banner"><p>{error}</p></div>}

      {loading ? (
        <div className="booking-list">
          <div className="booking-item booking-item--skeleton"><div className="skeleton skeleton--line skeleton--wide" /></div>
        </div>
      ) : !booking ? (
        <EmptyState
          title="Réservation introuvable"
          text="Cette réservation n'existe pas ou vous n'y avez pas accès."
          action={<Button variant="outline" to="/student/reservations">Retour à mes réservations</Button>}
        />
      ) : (
        <div className="booking-detail">
          <section className="dash-card">
            <h3>Professeur</h3>
            <div className="booking-item__prof" style={{ marginTop: '0.75rem' }}>
              <Avatar name={booking.professorName} src={booking.professorProfilePhoto || undefined} size="lg" />
              <div>
                <h2 style={{ margin: 0 }}>{booking.professorName}</h2>
                {booking.professorRating != null && (
                  <p className="muted"><Icon name="star" size={15} /> {Number(booking.professorRating).toFixed(1)} · {booking.professorReviewCount} avis</p>
                )}
                <Button size="sm" variant="link" to={`/professeur/${booking.professorId}`} style={{ paddingLeft: 0 }}>Voir le profil</Button>
              </div>
            </div>
          </section>

          <section className="dash-card">
            <h3>Cours réservé</h3>
            <div className="detail-rows" style={{ marginTop: '0.75rem' }}>
              <div className="detail-row"><span className="detail-row__label">Offre</span><span className="detail-row__value">{booking.offerTitle}</span></div>
              <div className="detail-row"><span className="detail-row__label">Matière</span><span className="detail-row__value">{booking.subjectLabel}</span></div>
              <div className="detail-row"><span className="detail-row__label">Niveau</span><span className="detail-row__value">{booking.levelLabel}</span></div>
              <div className="detail-row"><span className="detail-row__label">Date</span><span className="detail-row__value">{formatDateFR(booking.scheduledAt)}</span></div>
              <div className="detail-row"><span className="detail-row__label">Horaires</span><span className="detail-row__value">{formatTimeFR(booking.scheduledAt)}{endDT ? ` — ${formatTimeFR(endDT.toISOString())}` : ''} · {booking.durationMinutes} min</span></div>
              <div className="detail-row"><span className="detail-row__label">Type</span><span className="detail-row__value">{formatLocationType(booking.locationType || undefined)}{booking.meetingPlatform ? ` · ${booking.meetingPlatform}` : ''}</span></div>
              <div className="detail-row"><span className="detail-row__label">Prix horaire</span><span className="detail-row__value">{Number(booking.negotiatedPrice != null ? booking.negotiatedPrice : (booking.amount != null && booking.durationMinutes ? booking.amount * 60 / booking.durationMinutes : 0)).toFixed(2)} DH</span></div>
              <div className="detail-row"><span className="detail-row__label">Montant total</span><span className="detail-row__value"><strong>{Number(booking.amount).toFixed(2)} {booking.currency}</strong></span></div>
            </div>
          </section>

          <section className="dash-card">
            <h3>Paiement</h3>
            <div className="detail-rows" style={{ marginTop: '0.75rem' }}>
              <div className="detail-row"><span className="detail-row__label">Moyen de paiement</span><span className="detail-row__value">{formatPaymentMethod(booking.paymentMethod)}</span></div>
              <div className="detail-row"><span className="detail-row__label">Statut</span><span className="detail-row__value">{formatPaymentStatus(booking.paymentStatus)}</span></div>
              {booking.paidAt && <div className="detail-row"><span className="detail-row__label">Réglé le</span><span className="detail-row__value">{formatDateFR(booking.paidAt)} à {formatTimeFR(booking.paidAt)}</span></div>}
            </div>
          </section>

          <section className="dash-card">
            <h3>Statut de la réservation</h3>
            <div style={{ marginTop: '0.75rem' }}>
              <StatusBadge status={booking.status} kind="booking" />
            </div>
            {booking.status === 'PENDING' && (
              <p className="muted" style={{ marginTop: '0.5rem' }}>
                En attente de confirmation du professeur. Vous recevrez une notification lorsqu'il aura accepté.
              </p>
            )}
            {booking.status === 'ACCEPTED' && !online && (
              <p className="muted" style={{ marginTop: '0.5rem' }}>
                Réservation confirmée. Pensez à vous rendre au lieu indiqué à l'heure prévue.
              </p>
            )}
            {booking.status === 'ACCEPTED' && online && !canJoin && (
              <p className="muted" style={{ marginTop: '0.5rem' }}>
                Réservation confirmée. Le lien du cours en ligne sera ajouté prochainement par le professeur. Vous recevrez une notification.
              </p>
            )}
            {booking.status === 'REJECTED' && (
              <p className="muted" style={{ marginTop: '0.5rem' }}>
                {booking.professorResponse ? `Motif du refus : ${booking.professorResponse}` : 'Cette réservation a été refusée par le professeur.'}
              </p>
            )}
            {booking.status === 'CANCELLED' && (
              <p className="muted" style={{ marginTop: '0.5rem' }}>Cette réservation a été annulée.</p>
            )}
            {booking.status === 'COMPLETED' && (
              <p className="muted" style={{ marginTop: '0.5rem' }}>Cours terminé. Merci d'avoir partagé votre expérience !</p>
            )}
          </section>

          {online && (booking.status === 'ACCEPTED' || booking.status === 'COMPLETED') && (
            <section className="dash-card">
              <h3>Cours en ligne</h3>
              <div className="booking-meeting" style={{ marginTop: '0.75rem' }}>
                <div className="booking-meeting__head">
                  <span className="booking-meeting__label">Session</span>
                  {canJoin ? <Badge variant="green" icon="check">Prêt</Badge> : <Badge variant="yellow" icon="clock">Lien à venir</Badge>}
                </div>
                {booking.meetingPlatform ? <p className="muted">Plateforme : <strong>{booking.meetingPlatform}</strong></p> : null}
                {canJoin ? (
                  <a href={safeMeetingUrl(booking.meetingLink)} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--sm" style={{ marginTop: '0.5rem', width: 'fit-content' }}>
                    <Icon name="video" size={18} className="cc-icon" /> Rejoindre la séance
                  </a>
                ) : (
                  <p className="muted">Le lien du cours sera ajouté prochainement par le professeur. Vous recevrez une notification.</p>
                )}
                {booking.meetingInstructions ? <p className="booking-meeting__instr" style={{ marginTop: '0.5rem' }}>{booking.meetingInstructions}</p> : null}
              </div>
            </section>
          )}

          {!online && booking.meetingLocation && (booking.status === 'ACCEPTED' || booking.status === 'COMPLETED') && (
            <section className="dash-card">
              <h3>Lieu du rendez-vous</h3>
              <p style={{ marginTop: '0.5rem' }}>{booking.meetingLocation}</p>
            </section>
          )}

          <div className="booking-item__actions" style={{ justifyContent: 'flex-start', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <Button variant="outline" icon="arrow-left" onClick={() => navigate('/student/reservations')}>Retour à mes réservations</Button>
            {canJoin ? (
              <a href={safeMeetingUrl(booking.meetingLink)} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                <Icon name="video" size={18} className="cc-icon" /> Rejoindre la séance
              </a>
            ) : null}
            {canCancel && isFuture ? (
              <Button variant="danger-ghost" icon="x" onClick={handleCancel} loading={cancelling}>Annuler la réservation</Button>
            ) : null}
            {isCompleted && (
              <Button variant="primary" icon="star" onClick={() => { setReviewError(''); setReviewOpen(true); }}>Laisser un avis</Button>
            )}
          </div>
        </div>
      )}

      {reviewOpen && booking && (
        <ReviewModal
          open
          professorName={booking.professorName}
          offerTitle={booking.offerTitle}
          submitting={reviewSubmitting}
          error={reviewError}
          onClose={() => setReviewOpen(false)}
          onSubmit={handleSubmitReview}
        />
      )}
    </StudentShell>
  );
}