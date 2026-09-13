import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import StatusBadge from '../ui/StatusBadge';
import Modal from '../ui/Modal';
import { Input, Select, Textarea } from '../ui/Field';
import {
  acceptBooking, rejectBooking, completeBooking, markBookingPaid, cancelBookingAsProfessor,
  saveMeetingConfig, deleteMeetingConfig,
} from '../../services/api';
import {
  formatDateFR, formatTimeFR, formatLocationType, formatPaymentMethod, formatPaymentStatus,
  isSafeMeetingUrl, safeMeetingUrl, MEETING_PLATFORMS, ONLINE_ACCEPT_HINT,
} from '../../utils/labels';
import type { Booking, MeetingConfigData } from '../../types';

function paymentBadgeVariant(status: string | null | undefined): 'green' | 'yellow' | 'gray' {
  if (status === 'PAID') return 'green';
  if (status === 'PENDING') return 'yellow';
  return 'gray';
}

function formatPrice(p: number | null | undefined): string {
  return p == null ? '—' : `${Number(p).toFixed(2).replace(/\.00$/, '')} DH/h`;
}

interface BookingCardProps {
  booking: Booking;
  defaultPlatform?: string;
  onUpdated: () => Promise<void> | void;
}

export default function BookingCard({ booking, defaultPlatform, onUpdated }: BookingCardProps) {
  const navigate = useNavigate();
  const online = booking.locationType === 'ONLINE';
  const acceptedOrCompleted = booking.status === 'ACCEPTED' || booking.status === 'COMPLETED';

  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<MeetingConfigData>({});
  const [meetingSaving, setMeetingSaving] = useState(false);
  const [meetingError, setMeetingError] = useState('');
  const [actionError, setActionError] = useState('');

  const [acceptOpen, setAcceptOpen] = useState(false);
  const [acceptSaving, setAcceptSaving] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSaving, setRejectSaving] = useState(false);

  async function refresh(cb?: () => Promise<unknown>) {
    try {
      await cb?.();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur');
    }
    await onUpdated();
  }

  function openEditor() {
    setMeetingError('');
    setMeetingSaving(false);
    setDraft({
      meetingLink: booking.meetingLink || '',
      meetingPlatform: booking.meetingPlatform || defaultPlatform || '',
      meetingInstructions: booking.meetingInstructions || '',
    });
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
  }

  async function handleMeetingSave() {
    if (meetingSaving) return;
    setMeetingSaving(true);
    setMeetingError('');
    try {
      await saveMeetingConfig(booking.id, {
        meetingLink: draft.meetingLink?.trim() || undefined,
        meetingPlatform: draft.meetingPlatform?.trim() || undefined,
        meetingInstructions: draft.meetingInstructions?.trim() || undefined,
      });
      setEditorOpen(false);
      await onUpdated();
    } catch (err) {
      setMeetingError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setMeetingSaving(false);
    }
  }

  async function handleMeetingDelete() {
    if (!window.confirm('Supprimer le lien de cette séance ?')) return;
    setMeetingSaving(true);
    setMeetingError('');
    try {
      await deleteMeetingConfig(booking.id);
      setEditorOpen(false);
      await onUpdated();
    } catch (err) {
      setMeetingError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setMeetingSaving(false);
    }
  }

  function promptAccept() {
    setActionError('');
    if (online) {
      setAcceptOpen(true);
    } else {
      refresh(async () => {
        await acceptBooking(booking.id, {});
      });
    }
  }

  async function handleAcceptConfirm() {
    setAcceptSaving(true);
    setActionError('');
    try {
      await acceptBooking(booking.id, {});
      setAcceptOpen(false);
      await onUpdated();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setAcceptSaving(false);
    }
  }

  function promptReject() {
    setActionError('');
    setRejectReason('');
    setRejectOpen(true);
  }

  async function handleRejectConfirm() {
    if (!rejectReason.trim()) return;
    setRejectSaving(true);
    setActionError('');
    try {
      await rejectBooking(booking.id, rejectReason.trim());
      setRejectOpen(false);
      await onUpdated();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setRejectSaving(false);
    }
  }

  function handleComplete() {
    if (!window.confirm(`Marquer « ${booking.offerTitle} » comme terminé ?`)) return;
    setActionError('');
    refresh(() => completeBooking(booking.id));
  }

  function handleMarkPaid() {
    if (!window.confirm('Encaisser le paiement de cette séance ?')) return;
    setActionError('');
    refresh(() => markBookingPaid(booking.id));
  }

  function handleCancelAsProfessor() {
    if (!window.confirm('Annuler cette réservation ? L\'élève sera notifié.')) return;
    setActionError('');
    refresh(() => cancelBookingAsProfessor(booking.id));
  }

  return (
    <div className="booking-item">
      <div className="booking-item__head">
        <div className="booking-item__title">
          <h4>{booking.offerTitle}</h4>
          <span className="booking-item__prof">
            <Avatar name={booking.studentName} src={booking.studentProfilePhoto || undefined} size="sm" />
            {booking.studentName}{booking.subjectLabel ? ` · ${booking.subjectLabel}` : ''}
          </span>
        </div>
        <div className="pay-badge-row">
          <StatusBadge status={booking.status} kind="booking" />
          {booking.paymentMethod && (
            <Badge variant={paymentBadgeVariant(booking.paymentStatus)} icon={booking.paymentStatus === 'PAID' ? 'check-circle' : 'wallet'}>
              {formatPaymentMethod(booking.paymentMethod)} · {formatPaymentStatus(booking.paymentStatus)}
            </Badge>
          )}
        </div>
      </div>
      <div className="booking-item__meta">
        <span className="booking-meta-item"><Icon name="calendar" size={16} />{formatDateFR(booking.scheduledAt)}</span>
        <span className="booking-meta-item"><Icon name="clock" size={16} />{formatTimeFR(booking.scheduledAt)}{booking.durationMinutes ? ` · ${booking.durationMinutes} min` : ''}</span>
        {online ? (
          <span className="booking-meta-item"><Icon name="video" size={16} />{booking.meetingPlatform ? `${booking.meetingPlatform} · ` : ''}En ligne</span>
        ) : booking.locationType ? (
          <span className="booking-meta-item"><Icon name="map-pin" size={16} />{formatLocationType(booking.locationType)}</span>
        ) : null}
      </div>

      {(online && acceptedOrCompleted) && (
        <div className="booking-meeting">
          <div className="booking-meeting__head">
            <span className="booking-meeting__label">Cours en ligne</span>
            {isSafeMeetingUrl(booking.meetingLink) ? (
              <Badge variant="green" icon="check-circle">Lien ajouté</Badge>
            ) : (
              <Badge variant="yellow" icon="clock">Lien à ajouter</Badge>
            )}
          </div>
          {isSafeMeetingUrl(booking.meetingLink) ? (
            <>
              <a href={safeMeetingUrl(booking.meetingLink)} target="_blank" rel="noopener noreferrer">Rejoindre la séance</a>
              {booking.meetingPlatform ? <span className="muted"> · {booking.meetingPlatform}</span> : null}
              {booking.meetingInstructions ? <p className="booking-meeting__instr">{booking.meetingInstructions}</p> : null}
            </>
          ) : (
            <p className="muted">Aucun lien configuré pour cette séance. Ajoutez-le pour que l'élève puisse rejoindre le cours.</p>
          )}

          {editorOpen ? (
            <div className="meeting-editor">
              <Select
                label="Plateforme"
                id={`m-plat-${booking.id}`}
                value={draft.meetingPlatform || ''}
                onChange={(e) => setDraft((prev) => ({ ...prev, meetingPlatform: e.target.value }))}
              >
                <option value="">— Sélectionner —</option>
                {MEETING_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                {(booking.meetingPlatform && !MEETING_PLATFORMS.includes(booking.meetingPlatform as never)) && (
                  <option value={booking.meetingPlatform}>{booking.meetingPlatform}</option>
                )}
              </Select>
              <Input
                label="Lien de la séance (https)"
                id={`m-link-${booking.id}`}
                type="url"
                value={draft.meetingLink || ''}
                onChange={(e) => setDraft((prev) => ({ ...prev, meetingLink: e.target.value }))}
                placeholder="https://zoom.us/j/..."
                maxLength={500}
              />
              <Textarea
                label="Instructions pour l'élève (optionnel)"
                id={`m-instr-${booking.id}`}
                rows={2}
                value={draft.meetingInstructions || ''}
                onChange={(e) => setDraft((prev) => ({ ...prev, meetingInstructions: e.target.value }))}
                placeholder="Code d'accès, matériel à prévoir..."
                maxLength={2000}
              />
              {meetingError && <div className="error-banner"><p>{meetingError}</p></div>}
              <div className="booking-item__actions">
                <Button size="sm" icon="check" onClick={handleMeetingSave} loading={meetingSaving}>Enregistrer le lien</Button>
                {isSafeMeetingUrl(booking.meetingLink) && (
                  <Button size="sm" variant="danger-ghost" icon="trash" onClick={handleMeetingDelete} loading={meetingSaving}>Supprimer le lien</Button>
                )}
                <Button size="sm" variant="ghost" onClick={closeEditor}>Annuler</Button>
              </div>
            </div>
          ) : (
            <div className="booking-item__actions">
              <Button size="sm" variant="outline" icon="edit" onClick={openEditor}>
                {isSafeMeetingUrl(booking.meetingLink) ? 'Modifier le lien' : 'Ajouter le lien'}
              </Button>
              {isSafeMeetingUrl(booking.meetingLink) && (
                <Button size="sm" variant="danger-ghost" icon="trash" onClick={handleMeetingDelete} loading={meetingSaving}>Supprimer</Button>
              )}
            </div>
          )}
        </div>
      )}

      {booking.amount != null && (
        <div className="booking-price booking-price__meta">
          <span>
            <span className="booking-price__label">Montant</span>
            <span className="booking-price__value">
              {Number(booking.amount).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {booking.currency || 'DH'}
            </span>
          </span>
          {booking.negotiatedPrice != null ? (
            <span className="booking-price__sub">Tarif horaire négocié : {formatPrice(booking.negotiatedPrice)}</span>
          ) : (
            <span className="booking-price__sub">Cours en personne · tarif horaire</span>
          )}
          {booking.paidAt && <span className="booking-price__sub">Encaissé le {formatDateFR(booking.paidAt)}</span>}
        </div>
      )}
      {booking.studentMessage && <p className="booking-item__msg">Message : {booking.studentMessage}</p>}
      {actionError && <div className="error-banner"><p>{actionError}</p></div>}

      <div className="booking-item__actions">
        <Button size="sm" variant="link" onClick={() => navigate(`/professor/reservations/${booking.id}`)}>Voir les détails</Button>
        {booking.status === 'PENDING' && (
          <>
            <Button size="sm" icon="check" onClick={promptAccept}>Accepter</Button>
            <Button variant="danger" size="sm" icon="x" onClick={promptReject}>Refuser</Button>
          </>
        )}
        {booking.status === 'ACCEPTED' && (
          <>
            <Button variant="outline" size="sm" icon="check-circle" onClick={handleComplete}>Terminer</Button>
            <Button variant="danger-ghost" size="sm" icon="x" onClick={handleCancelAsProfessor}>Annuler</Button>
          </>
        )}
        {booking.status === 'COMPLETED' && booking.paymentMethod === 'CASH' && booking.paymentStatus !== 'PAID' && (
          <Button size="sm" icon="wallet" onClick={handleMarkPaid}>Encaisser le paiement</Button>
        )}
      </div>
      {booking.status === 'REJECTED' && booking.professorResponse && (
        <p className="booking-item__msg">Motif du refus : {booking.professorResponse}</p>
      )}
      {booking.status === 'CANCELLED' && (
        <p className="booking-item__msg">Réservation annulée.</p>
      )}

      <Modal
        open={acceptOpen}
        onClose={() => setAcceptOpen(false)}
        title="Accepter la réservation"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAcceptOpen(false)}>Annuler</Button>
            <Button onClick={handleAcceptConfirm} loading={acceptSaving}>
              {acceptSaving ? 'Acceptation...' : "Confirmer l'acceptation"}
            </Button>
          </>
        }
      >
        <p className="muted" style={{ marginBottom: '0.75rem' }}>
          {booking.studentName} a réservé « {booking.offerTitle} » (cours en ligne).
        </p>
        <p className="meeting-fields__help" style={{ marginBottom: '0.75rem' }}>
          {ONLINE_ACCEPT_HINT}
        </p>
        {actionError && <div className="error-banner" style={{ marginTop: '0.75rem' }}><p>{actionError}</p></div>}
      </Modal>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Refuser la réservation"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>Annuler</Button>
            <Button variant="danger" onClick={handleRejectConfirm} loading={rejectSaving} disabled={!rejectReason.trim()}>
              {rejectSaving ? 'Refus en cours...' : 'Confirmer le refus'}
            </Button>
          </>
        }
      >
        <p className="muted" style={{ marginBottom: '0.75rem' }}>
          {booking.studentName} a réservé « {booking.offerTitle} ».
          Indiquez le motif pour inviter l'élève à ajuster sa demande.
        </p>
        <Textarea
          label="Motif du refus *"
          id="reject-reason"
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Ex : Ce créneau n'est plus disponible, contactez-moi pour un autre horaire..."
          required
        />
        {actionError && <div className="error-banner" style={{ marginTop: '0.75rem' }}><p>{actionError}</p></div>}
      </Modal>
    </div>
  );
}