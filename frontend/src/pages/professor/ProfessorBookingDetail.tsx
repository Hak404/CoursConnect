import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfessorShell from '../../components/dashboard/ProfessorShell';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { Input, Select, Textarea } from '../../components/ui/Field';
import {
  getBooking, getMyOffers, acceptBooking, rejectBooking, completeBooking, markBookingPaid,
  cancelBookingAsProfessor, saveMeetingConfig, deleteMeetingConfig,
} from '../../services/api';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import {
  formatDateFR, formatTimeFR, formatLocationType, formatPaymentMethod, formatPaymentStatus,
  isSafeMeetingUrl, safeMeetingUrl, MEETING_PLATFORMS, isMeetingPlatformKnown, ONLINE_ACCEPT_HINT,
} from '../../utils/labels';
import type { Booking, MeetingConfigData, Offer } from '../../types';

export default function ProfessorBookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const unreadCount = useUnreadCount();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<MeetingConfigData>({});
  const [meetingSaving, setMeetingSaving] = useState(false);
  const [meetingError, setMeetingError] = useState('');

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSaving, setRejectSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getBooking(Number(id)), getMyOffers()])
      .then(([b, o]) => {
        setBooking(b);
        setOffers(o);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Réservation introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(''), 6000);
    return () => window.clearTimeout(t);
  }, [notice]);

  async function reload() {
    if (!id) return;
    setBooking(await getBooking(Number(id)));
  }

  async function runAction(action: () => Promise<unknown>, successMessage: string) {
    setActionError('');
    try {
      await action();
      await reload();
      setNotice(successMessage);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur');
    }
  }

  function handleAccept() {
    const b = booking;
    if (!b) return;
    const ok = b.locationType === 'ONLINE'
      ? window.confirm(`${ONLINE_ACCEPT_HINT}\n\nVous pourrez ajouter le lien de la séance juste après. Accepter cette réservation ?`)
      : window.confirm(`Accepter la réservation de ${b.studentName} ?`);
    if (ok) runAction(() => acceptBooking(b.id, {}), 'Réservation acceptée.');
  }

  function handleRejectConfirm() {
    if (!booking || !rejectReason.trim()) return;
    setRejectSaving(true);
    setActionError('');
    rejectBooking(booking.id, rejectReason.trim())
      .then(() => reload())
      .then(() => { setRejectOpen(false); setNotice('Réservation refusée.'); })
      .catch((err) => setActionError(err instanceof Error ? err.message : 'Erreur'))
      .finally(() => setRejectSaving(false));
  }

  function handleCancelAsProfessor() {
    if (!booking || !window.confirm("Annuler cette réservation ? L'élève sera notifié.")) return;
    runAction(() => cancelBookingAsProfessor(booking.id), 'Réservation annulée, l\'élève a été notifié.');
  }

  function openEditor() {
    if (!booking) return;
    setMeetingError('');
    setDraft({
      meetingLink: booking.meetingLink || '',
      meetingPlatform: booking.meetingPlatform || defaultPlatform || '',
      meetingInstructions: booking.meetingInstructions || '',
    });
    setEditorOpen(true);
  }

  const defaultPlatform = offers.find((o) => o.id === booking?.offerId)?.meetingPlatform || '';

  async function handleMeetingSave() {
    if (!booking || meetingSaving) return;
    setMeetingSaving(true);
    setMeetingError('');
    try {
      await saveMeetingConfig(booking.id, {
        meetingLink: draft.meetingLink?.trim() || undefined,
        meetingPlatform: draft.meetingPlatform?.trim() || undefined,
        meetingInstructions: draft.meetingInstructions?.trim() || undefined,
      });
      setEditorOpen(false);
      await reload();
      setNotice('Lien du cours en ligne enregistré.');
    } catch (err) {
      setMeetingError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setMeetingSaving(false);
    }
  }

  async function handleMeetingDelete() {
    if (!booking || !window.confirm('Supprimer le lien de cette séance ?')) return;
    setMeetingSaving(true);
    setMeetingError('');
    try {
      await deleteMeetingConfig(booking.id);
      setEditorOpen(false);
      await reload();
      setNotice('Lien supprimé.');
    } catch (err) {
      setMeetingError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setMeetingSaving(false);
    }
  }

  const online = booking?.locationType === 'ONLINE';
  const canJoin = online && (booking?.status === 'ACCEPTED' || booking?.status === 'COMPLETED') && isSafeMeetingUrl(booking?.meetingLink);
  const accepedOrCompleted = booking && (booking.status === 'ACCEPTED' || booking.status === 'COMPLETED');
  const startDT = booking ? new Date(booking.scheduledAt) : null;
  const endDT = startDT && booking?.durationMinutes ? new Date(startDT.getTime() + booking.durationMinutes * 60000) : null;

  return (
    <ProfessorShell
      pageTitle="Détail de la réservation"
      subtitle={booking ? `${booking.offerTitle} — ${booking.studentName}` : 'Chargement...'}
      unreadCount={unreadCount}
    >
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
          action={<Button variant="outline" to="/professor/reservations">Retour à mes réservations</Button>}
        />
      ) : (
        <div className="booking-detail">
          <section className="dash-card">
            <h3>Élève</h3>
            <div className="booking-item__prof" style={{ marginTop: '0.75rem' }}>
              <Avatar name={booking.studentName} src={booking.studentProfilePhoto || undefined} size="lg" />
              <div>
                <h2 style={{ margin: 0 }}>{booking.studentName}</h2>
                <p className="muted">Réservation n°{booking.id}</p>
              </div>
              <Badge variant={booking.status === 'COMPLETED' ? 'green' : booking.status === 'ACCEPTED' ? 'blue' : 'neutral'}>
                {booking.paymentMethod ? `${formatPaymentMethod(booking.paymentMethod)} · ${formatPaymentStatus(booking.paymentStatus)}` : formatPaymentStatus(booking.paymentStatus)}
              </Badge>
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
              {booking.studentMessage && <div className="detail-row"><span className="detail-row__label">Message</span><span className="detail-row__value">{booking.studentMessage}</span></div>}
            </div>
          </section>

          <section className="dash-card">
            <h3>Paiement</h3>
            <div className="detail-rows" style={{ marginTop: '0.75rem' }}>
              <div className="detail-row"><span className="detail-row__label">Moyen de paiement</span><span className="detail-row__value">{formatPaymentMethod(booking.paymentMethod)}</span></div>
              <div className="detail-row"><span className="detail-row__label">Statut</span><span className="detail-row__value">{formatPaymentStatus(booking.paymentStatus)}</span></div>
              {booking.paidAt && <div className="detail-row"><span className="detail-row__label">Encaissé le</span><span className="detail-row__value">{formatDateFR(booking.paidAt)} à {formatTimeFR(booking.paidAt)}</span></div>}
            </div>
            {booking.status === 'COMPLETED' && booking.paymentMethod === 'CASH' && booking.paymentStatus !== 'PAID' && (
              <div style={{ marginTop: '0.75rem' }}>
                <Button size="sm" icon="wallet" onClick={() => runAction(() => markBookingPaid(booking.id), 'Paiement encaissé.')}>Encaisser le paiement</Button>
              </div>
            )}
          </section>

          <section className="dash-card">
            <h3>Statut de la réservation</h3>
            <div style={{ marginTop: '0.75rem' }}>
              <StatusBadge status={booking.status} kind="booking" />
            </div>
            {booking.status === 'PENDING' && (
              <p className="muted" style={{ marginTop: '0.5rem' }}>En attente de votre confirmation. L'élève recevra une notification dès que vous aurez accepté.</p>
            )}
            {booking.status === 'ACCEPTED' && !online && (
              <p className="muted" style={{ marginTop: '0.5rem' }}>Réservation confirmée. {booking.meetingLocation ? `Lieu : ${booking.meetingLocation}` : ''}</p>
            )}
            {booking.status === 'ACCEPTED' && online && !canJoin && (
              <p className="muted" style={{ marginTop: '0.5rem' }}>Réservation confirmée. Ajoutez le lien de la séance pour que l'élève puisse rejoindre le cours.</p>
            )}
            {booking.status === 'REJECTED' && (
              <p className="muted" style={{ marginTop: '0.5rem' }}>{booking.professorResponse ? `Motif du refus : ${booking.professorResponse}` : 'Réservation refusée.'}</p>
            )}
            {booking.status === 'CANCELLED' && (
              <p className="muted" style={{ marginTop: '0.5rem' }}>Réservation annulée.</p>
            )}
            {booking.status === 'COMPLETED' && (
              <p className="muted" style={{ marginTop: '0.5rem' }}>Cours terminé. Pensez à encaisser le paiement si ce n'est pas déjà fait.</p>
            )}
          </section>

          {online && accepedOrCompleted && (
            <section className="dash-card">
              <h3>Cours en ligne</h3>
              <div className="booking-meeting" style={{ marginTop: '0.75rem' }}>
                <div className="booking-meeting__head">
                  <span className="booking-meeting__label">Session</span>
                  {canJoin ? <Badge variant="green" icon="check-circle">Lien ajouté</Badge> : <Badge variant="yellow" icon="clock">Lien à ajouter</Badge>}
                </div>
                {booking.meetingPlatform ? <p className="muted">Plateforme préférée : <strong>{booking.meetingPlatform}</strong></p> : null}

                {editorOpen ? (
                  <div className="meeting-editor">
                    <Select
                      label="Plateforme"
                      id="meeting-platform"
                      value={draft.meetingPlatform || ''}
                      onChange={(e) => setDraft((prev) => ({ ...prev, meetingPlatform: e.target.value }))}
                    >
                      <option value="">— Sélectionner —</option>
                      {MEETING_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                      {(booking.meetingPlatform && !isMeetingPlatformKnown(booking.meetingPlatform)) && (
                        <option value={booking.meetingPlatform}>{booking.meetingPlatform}</option>
                      )}
                    </Select>
                    <Input
                      label="Lien de la séance (https uniquement)"
                      id="meeting-link"
                      type="url"
                      value={draft.meetingLink || ''}
                      onChange={(e) => setDraft((prev) => ({ ...prev, meetingLink: e.target.value }))}
                      placeholder="https://zoom.us/j/..."
                      maxLength={500}
                      required
                    />
                    <Textarea
                      label="Instructions pour l'élève (optionnel)"
                      id="meeting-instr"
                      rows={3}
                      value={draft.meetingInstructions || ''}
                      onChange={(e) => setDraft((prev) => ({ ...prev, meetingInstructions: e.target.value }))}
                      placeholder="Code d'accès, matériel à prévoir..."
                      maxLength={2000}
                    />
                    {meetingError && <div className="error-banner"><p>{meetingError}</p></div>}
                    <div className="booking-item__actions">
                      <Button size="sm" icon="check" onClick={handleMeetingSave} loading={meetingSaving}>Enregistrer le lien</Button>
                      {isSafeMeetingUrl(booking.meetingLink) && (
                        <Button size="sm" variant="danger-ghost" icon="trash" onClick={handleMeetingDelete} loading={meetingSaving}>Supprimer</Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setEditorOpen(false)}>Annuler</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {canJoin ? (
                      <>
                        <a href={safeMeetingUrl(booking.meetingLink)} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--sm" style={{ marginTop: '0.5rem', width: 'fit-content' }}>
                          <Icon name="video" size={18} className="cc-icon" /> Ouvrir la séance
                        </a>
                        {booking.meetingInstructions ? <p className="booking-meeting__instr" style={{ marginTop: '0.5rem' }}>{booking.meetingInstructions}</p> : null}
                      </>
                    ) : (
                      <p className="muted">Aucun lien configuré. Ajoutez-le pour que l'élève puisse rejoindre le cours.</p>
                    )}
                    <div className="booking-item__actions" style={{ marginTop: '0.75rem' }}>
                      <Button size="sm" variant="outline" icon="edit" onClick={openEditor}>
                        {canJoin ? 'Modifier le lien' : 'Ajouter le lien'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {!online && (booking.status === 'ACCEPTED' || booking.status === 'COMPLETED') && (
            <section className="dash-card">
              <h3>Lieu du rendez-vous</h3>
              <p style={{ marginTop: '0.5rem' }}>{booking.meetingLocation || 'À définir'}</p>
            </section>
          )}

          {actionError && <div className="error-banner"><p>{actionError}</p></div>}

          <div className="booking-item__actions" style={{ justifyContent: 'flex-start', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <Button variant="outline" icon="arrow-left" onClick={() => navigate('/professor/reservations')}>Retour à mes réservations</Button>
            {booking.status === 'PENDING' && (
              <>
                <Button icon="check" onClick={handleAccept}>Accepter</Button>
                <Button variant="danger" icon="x" onClick={() => { setRejectReason(''); setActionError(''); setRejectOpen(true); }}>Refuser</Button>
              </>
            )}
            {booking.status === 'ACCEPTED' && (
              <>
                <Button variant="outline" icon="check-circle" onClick={() => runAction(() => completeBooking(booking.id), 'Cours marqué comme terminé.')}>Terminer le cours</Button>
                <Button variant="danger-ghost" icon="x" onClick={handleCancelAsProfessor}>Annuler la réservation</Button>
              </>
            )}
          </div>
        </div>
      )}

      <ModalReject
        open={rejectOpen}
        studentName={booking?.studentName || ''}
        offerTitle={booking?.offerTitle || ''}
        reason={rejectReason}
        saving={rejectSaving}
        errorMessage={actionError}
        onReasonChange={setRejectReason}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleRejectConfirm}
      />
    </ProfessorShell>
  );
}

interface ModalRejectProps {
  open: boolean;
  studentName: string;
  offerTitle: string;
  reason: string;
  saving: boolean;
  errorMessage: string;
  onReasonChange: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

function ModalReject({ open, studentName, offerTitle, reason, saving, errorMessage, onReasonChange, onClose, onConfirm }: ModalRejectProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Refuser la réservation"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="danger" onClick={onConfirm} loading={saving} disabled={!reason.trim()}>
            {saving ? 'Refus en cours...' : 'Confirmer le refus'}
          </Button>
        </>
      }
    >
      <p className="muted" style={{ marginBottom: '0.75rem' }}>
        {studentName} a réservé « {offerTitle} ». Indiquez le motif pour inviter l'élève à ajuster sa demande.
      </p>
      <Textarea
        label="Motif du refus *"
        id="reject-reason"
        rows={3}
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        placeholder="Ex : Ce créneau n'est plus disponible, contactez-moi pour un autre horaire..."
        required
      />
      {errorMessage && <div className="error-banner" style={{ marginTop: '0.75rem' }}><p>{errorMessage}</p></div>}
    </Modal>
  );
}