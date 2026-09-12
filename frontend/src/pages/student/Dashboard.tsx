import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getStudentProfile, updateStudentProfile, getMyStudentBookings,
  cancelBooking, createReview, fetchCities,
  getMyProposals, cancelProposal, createBooking,
} from '../../services/api';
import DashboardShell from '../../components/dashboard/DashboardShell';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import ReviewModal from '../../components/ui/ReviewModal';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { Input, Select } from '../../components/ui/Field';
import { formatDateFR, formatTimeFR, formatLocationType, formatPaymentMethod, formatPaymentStatus } from '../../utils/labels';
import type { StudentProfile, Booking, City, PriceProposal, BookingStatus } from '../../types';

type Tab = 'profile' | 'bookings' | 'proposals' | 'settings';
type BookingFilter = 'ALL' | BookingStatus;

function toLocalIsoInput(value: string): string {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}

function formatPrice(p: number | null | undefined): string {
  return p == null ? '—' : `${Number(p).toFixed(2).replace(/\.00$/, '')} DH/h`;
}

function paymentBadgeVariant(status: string | null | undefined): 'green' | 'yellow' | 'gray' {
  if (status === 'PAID') return 'green';
  if (status === 'PENDING') return 'yellow';
  return 'gray';
}

const FILTER_TABS: { id: BookingFilter; label: string }[] = [
  { id: 'ALL', label: 'Toutes' },
  { id: 'PENDING', label: 'En attente' },
  { id: 'ACCEPTED', label: 'Confirmées' },
  { id: 'COMPLETED', label: 'Terminées' },
  { id: 'CANCELLED', label: 'Annulées' },
  { id: 'REJECTED', label: 'Refusées' },
];

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get('tab');
  const initialTab: Tab = queryTab === 'profile' || queryTab === 'bookings' || queryTab === 'proposals' || queryTab === 'settings' ? queryTab : 'profile';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [proposals, setProposals] = useState<PriceProposal[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [phone, setPhone] = useState('');
  const [cityId, setCityId] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [reserveState, setReserveState] = useState<Record<number, { scheduledAt: string; message: string; meetingLocation: string; open: boolean }>>({});
  const [proposalError, setProposalError] = useState('');

  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [notice, setNotice] = useState('');
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>('ALL');

  function loadAll() {
    getStudentProfile()
      .then((p) => {
        setProfile(p);
        setPhone(p.phone || '');
        setCityId(p.cityId || '');
      })
      .catch(() => {});
    getMyStudentBookings().then(setBookings).catch(() => {});
    getMyProposals().then(setProposals).catch(() => {});
  }

  useEffect(() => {
    fetchCities().then(setCities).catch(() => {});
    loadAll();
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const updated = await updateStudentProfile({
        phone,
        cityId: cityId !== '' ? Number(cityId) : undefined,
      });
      setProfile(updated);
      setMessage('Profil mis à jour');
    } catch {
      setMessage('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(id: number) {
    if (!window.confirm('Annuler cette réservation ?')) return;
    try {
      await cancelBooking(id);
      setBookings(await getMyStudentBookings());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  }

  async function handleReviewSubmit(rating: number, comment: string) {
    if (!reviewTarget) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      await createReview(reviewTarget.id, { rating, comment: comment || undefined });
      setNotice('Avis publié. Merci !');
      setReviewTarget(null);
      setBookings(await getMyStudentBookings());
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Erreur lors de la publication');
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function handleCancelProposal(id: number) {
    if (!window.confirm('Annuler cette proposition de tarif ?')) return;
    setProposalError('');
    try {
      await cancelProposal(id);
      setProposals(await getMyProposals());
    } catch (err) {
      setProposalError(err instanceof Error ? err.message : 'Erreur');
    }
  }

  async function handleReserveSubmit(proposalId: number) {
    const state = reserveState[proposalId];
    if (!state || !state.scheduledAt) {
      setProposalError('Veuillez choisir une date et heure');
      return;
    }
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return;
    setProposalError('');
    try {
      const booking = await createBooking({
        offerId: proposal.offerId,
        scheduledAt: toLocalIsoInput(state.scheduledAt),
        studentMessage: state.message || undefined,
        proposalId,
        paymentMethod: 'CASH',
        meetingLocation: state.meetingLocation?.trim() || undefined,
      });
      if (booking.negotiatedPrice) {
        alert(`Réservation créée au tarif négocié de ${booking.negotiatedPrice} DH/h.`);
      }
      setReserveState(prev => ({ ...prev, [proposalId]: { ...prev[proposalId], open: false } }));
      setProposals(await getMyProposals());
      setBookings(await getMyStudentBookings());
    } catch (err) {
      setProposalError(err instanceof Error ? err.message : 'Erreur');
    }
  }

  const pendingProposals = proposals.filter((p) => p.status === 'PENDING').length;
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING').length;
  const reviewsGiven = bookings.filter((b) => b.hasReview).length;

  const filteredBookings = useMemo(
    () => (bookingFilter === 'ALL' ? bookings : bookings.filter((b) => b.status === bookingFilter)),
    [bookings, bookingFilter],
  );

  const nextLesson = useMemo(() => {
    const upcoming = bookings
      .filter((b) => b.status === 'ACCEPTED' && new Date(b.scheduledAt).getTime() >= Date.now())
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    return upcoming[0] || null;
  }, [bookings]);

  const navItems = [
    { id: 'profile' as Tab, label: 'Mon Profil', icon: 'users' as const },
    { id: 'bookings' as Tab, label: 'Mes Réservations', icon: 'calendar' as const, badge: pendingBookings },
    { id: 'proposals' as Tab, label: 'Mes Propositions', icon: 'wallet' as const, badge: pendingProposals },
    { id: 'settings' as Tab, label: 'Paramètres', icon: 'settings' as const },
  ];

  return (
    <DashboardShell
      navItems={navItems}
      active={tab}
      onSelect={(id) => setTab(id as Tab)}
      onLogout={handleLogout}
      user={user}
      roleLabel="Élève"
      pageTitle={`Bonjour, ${user?.firstName || ''} !`}
      subtitle="Bienvenue dans votre espace élève."
      action={tab === 'bookings' && bookings.length === 0 ? (
        <Button to="/recherche" icon="search">Trouver un professeur</Button>
      ) : undefined}
    >
      <div className="stats-grid">
        <StatCard icon="calendar" label="Réservations totales" value={bookings.length} tone="primary" />
        <StatCard icon="clock" label={pendingBookings > 0 ? 'En attente' : 'Aucune en attente'} value={pendingBookings} tone="yellow" />
        <StatCard icon="wallet" label="Propositions de tarif" value={proposals.length} tone="info" />
        <StatCard icon="star" label="Avis publiés" value={reviewsGiven} tone="green" />
      </div>

      {tab === 'profile' && profile && (
        <>
          {nextLesson ? (
            <section className="dash-card cta-card">
              <div className="cta-card__icon"><Icon name="grad-hat" size={20} /></div>
              <div className="cta-card__content">
                <h2>Prochain cours</h2>
                <p className="cta-card__main">{nextLesson.offerTitle}</p>
                <p className="cta-card__sub">
                  <Icon name="calendar" size={14} /> {formatDateFR(nextLesson.scheduledAt)}
                  <span className="cta-card__sep">·</span>
                  <Icon name="clock" size={14} /> {formatTimeFR(nextLesson.scheduledAt)}
                  {nextLesson.durationMinutes ? <><span className="cta-card__sep">·</span>{nextLesson.durationMinutes} min</> : null}
                </p>
                <p className="cta-card__sub">Avec <strong>{nextLesson.professorName}</strong></p>
              </div>
              <Button variant="outline" icon="calendar" onClick={() => setTab('bookings')}>
                Voir mes réservations
              </Button>
            </section>
          ) : (
            <section className="dash-card cta-card">
              <div className="cta-card__icon"><Icon name="compass" size={20} /></div>
              <div className="cta-card__content">
                <h2>Prêt à commencer ?</h2>
                <p className="cta-card__sub">Parcourez les professeurs, comparez leurs offres et réservez votre premier cours en quelques clics.</p>
              </div>
              <Button to="/recherche" icon="search">Trouver un professeur</Button>
            </section>
          )}

          <div className="dash-grid">
            <section className="dash-card profile-card">
            <div className="profile-card__head">
              <Avatar size="lg" name={`${profile.firstName} ${profile.lastName}`} />
              <div className="profile-card__id">
                <h2 className="profile-card__name">{profile.firstName} {profile.lastName}</h2>
                <p className="profile-card__email">{profile.email}</p>
              </div>
              <Button variant="outline" size="sm" icon="edit" onClick={() => setEditingProfile((v) => !v)}>
                {editingProfile ? 'Fermer' : 'Modifier le profil'}
              </Button>
            </div>

            {editingProfile ? (
              <div className="profile-edit">
                <div className="form-row">
                  <Input label="Téléphone" id="phone" type="tel" icon="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <Select label="Ville" id="city" value={cityId} onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : '')}>
                    <option value="">—</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </div>
                {message && (
                  <div className={message.includes('Erreur') ? 'error-banner' : 'success-banner'}><p>{message}</p></div>
                )}
                <div className="booking-item__actions">
                  <Button onClick={handleSave} loading={saving}>
                    {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </Button>
                  <Button variant="ghost" onClick={() => setEditingProfile(false)} disabled={saving}>Annuler</Button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <div className="profile-field">
                  <span>Nom complet</span>
                  <p>{profile.firstName} {profile.lastName}</p>
                </div>
                <div className="profile-field">
                  <span>Email</span>
                  <p>{profile.email}</p>
                </div>
                <div className="profile-field">
                  <span>Téléphone</span>
                  <p>{profile.phone || 'Non renseigné'}</p>
                </div>
                <div className="profile-field">
                  <span>Ville</span>
                  <p>{profile.cityName || 'Non renseignée'}</p>
                </div>
              </div>
            )}
          </section>

          <section className="dash-card">
            <div className="dash-card__title">
              <h2>Mes activités</h2>
            </div>
            <div className="summary-list">
              <button type="button" className="summary-item" onClick={() => setTab('bookings')}>
                <span className="summary-item__ic"><Icon name="calendar" size={18} /></span>
                <span className="summary-item__meta">
                  <span className="summary-item__value">{bookings.length}</span>
                  <span className="summary-item__label">Réservations</span>
                </span>
              </button>
              <button type="button" className="summary-item" onClick={() => setTab('bookings')}>
                <span className="summary-item__ic"><Icon name="clock" size={18} /></span>
                <span className="summary-item__meta">
                  <span className="summary-item__value">{pendingBookings}</span>
                  <span className="summary-item__label">En attente de confirmation</span>
                </span>
              </button>
              <button type="button" className="summary-item" onClick={() => setTab('proposals')}>
                <span className="summary-item__ic"><Icon name="wallet" size={18} /></span>
                <span className="summary-item__meta">
                  <span className="summary-item__value">{proposals.length}</span>
                  <span className="summary-item__label">Propositions de tarif</span>
                </span>
              </button>
              <button type="button" className="summary-item" onClick={() => setTab('proposals')}>
                <span className="summary-item__ic"><Icon name="star" size={18} /></span>
                <span className="summary-item__meta">
                  <span className="summary-item__value">{reviewsGiven}</span>
                  <span className="summary-item__label">Avis publiés</span>
                </span>
              </button>
            </div>
          </section>
          </div>
        </>
      )}

      {tab === 'bookings' && (
        <section className="dash-card">
          <div className="dash-card__title">
            <h2>Mes Réservations ({bookings.length})</h2>
          </div>
          <div className="seg-tabs" role="tablist" aria-label="Filtrer les réservations">
            {FILTER_TABS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={bookingFilter === f.id}
                className={`seg-tab ${bookingFilter === f.id ? 'is-active' : ''}`}
                onClick={() => setBookingFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {notice && <div className="success-banner"><p>{notice}</p></div>}
          {filteredBookings.length === 0 ? (
            <EmptyState
              emoji="📅"
              title={bookingFilter === 'ALL' ? 'Aucune réservation' : 'Aucune réservation ' + FILTER_TABS.find((f) => f.id === bookingFilter)?.label.toLowerCase()}
              text="Parcourez les professeurs et réservez votre premier cours en quelques clics."
              action={<Button to="/recherche" icon="search">Découvrir les professeurs</Button>}
            />
          ) : (
            <div className="booking-list">
              {filteredBookings.map((b) => (
                <div key={b.id} className="booking-item">
                  <div className="booking-item__head">
                    <div className="booking-item__title">
                      <h4>{b.offerTitle}</h4>
                      <span className="booking-item__prof">
                        <Avatar size="sm" name={b.professorName} />
                        {b.professorName}
                      </span>
                    </div>
                    <div className="pay-badge-row">
                      <StatusBadge status={b.status} kind="booking" />
                      {b.paymentMethod && (
                        <Badge variant={paymentBadgeVariant(b.paymentStatus)} icon={b.paymentStatus === 'PAID' ? 'check-circle' : 'wallet'}>
                          {formatPaymentMethod(b.paymentMethod)} · {formatPaymentStatus(b.paymentStatus)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="booking-item__meta">
                    <span className="booking-meta-item">
                      <Icon name="calendar" size={16} />
                      {formatDateFR(b.scheduledAt)}
                    </span>
                    <span className="booking-meta-item">
                      <Icon name="clock" size={16} />
                      {formatTimeFR(b.scheduledAt)}
                      {b.durationMinutes ? ` · ${b.durationMinutes} min` : ''}
                    </span>
                  </div>

                  {b.locationType && b.locationType !== 'ONLINE' && (
                    <div className="booking-item__meta">
                      <span className="booking-meta-item">
                        <Icon name="map-pin" size={16} />
                        {formatLocationType(b.locationType)}
                      </span>
                    </div>
                  )}

                  {(b.status === 'ACCEPTED' || b.status === 'COMPLETED') && (b.meetingLink || b.meetingLocation) && (
                    <div className="booking-meeting">
                      {b.meetingLink && (
                        <span>
                          <Icon name="video" size={15} className="cc-icon" />
                          Lien de la séance :{' '}
                          <a href={b.meetingLink} target="_blank" rel="noopener noreferrer">{b.meetingLink}</a>
                        </span>
                      )}
                      {b.meetingLocation && (
                        <span><Icon name="map-pin" size={15} className="cc-icon" /> {b.meetingLocation}</span>
                      )}
                    </div>
                  )}

                  {b.amount != null && (
                    <div className="booking-price booking-price__meta">
                      <span>
                        <span className="booking-price__label">Montant</span>
                        <span className="booking-price__value">
                          {Number(b.amount).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} DH
                        </span>
                      </span>
                      {b.negotiatedPrice != null && (
                        <span className="booking-price__sub">Tarif horaire négocié : {formatPrice(b.negotiatedPrice)}</span>
                      )}
                      {b.paidAt && (
                        <span className="booking-price__sub">Payé le {formatDateFR(b.paidAt)}</span>
                      )}
                    </div>
                  )}

                  {b.studentMessage && <p className="booking-item__msg">Message : {b.studentMessage}</p>}
                  {b.status === 'REJECTED' && b.professorResponse && (
                    <p className="booking-item__msg">Réponse du professeur : {b.professorResponse}</p>
                  )}

                  <div className="booking-item__actions">
                    {(b.status === 'PENDING' || b.status === 'ACCEPTED') && (
                      <Button variant="danger-ghost" size="sm" onClick={() => handleCancel(b.id)}>
                        {b.status === 'ACCEPTED' ? 'Annuler ce cours' : 'Annuler la réservation'}
                      </Button>
                    )}
                    {b.status === 'COMPLETED' && !b.hasReview && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon="star"
                        onClick={() => setReviewTarget(b)}
                      >
                        Laisser un avis
                      </Button>
                    )}
                    {b.status === 'COMPLETED' && b.hasReview && (
                      <span className="review-stars-status">
                        <Icon name="check-circle" size={16} /> Avis publié pour ce cours
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'proposals' && (
        <section className="dash-card">
          <div className="dash-card__title">
            <h2>Mes Propositions de tarif ({proposals.length})</h2>
          </div>
          {proposalError && <div className="error-banner"><p>{proposalError}</p></div>}
          {proposals.length === 0 ? (
            <EmptyState
              emoji="💬"
              title="Aucune proposition pour le moment"
              text="Sur la fiche d'un professeur, cliquez sur « Proposer un autre tarif » pour négocier le prix d'un cours."
              action={<Button to="/recherche" icon="search">Explorer les professeurs</Button>}
            />
          ) : (
            <div className="proposal-list">
              {proposals.map((p) => (
                <div key={p.id} className="proposal-item">
                  <div className="booking-item__head">
                    <div className="booking-item__title">
                      <h4>{p.offerTitle}</h4>
                      <span className="booking-item__prof">
                        <Avatar size="sm" name={p.professorName} />
                        {p.professorName}
                      </span>
                    </div>
                    <StatusBadge status={p.status} kind="proposal" />
                  </div>
                  <div className="proposal-compare">
                    <span className="proposal-price">
                      <span className="tag">Prix affiché</span>
                      <span className="amount strike">{formatPrice(p.initialPrice)}</span>
                    </span>
                    <Icon name="arrow-right" size={18} className="cc-icon proposal-arrow" />
                    <span className="proposal-price">
                      <span className="tag">Prix proposé</span>
                      <span className="amount" style={{ color: 'var(--primary)' }}>{formatPrice(p.proposedPrice)}</span>
                    </span>
                  </div>
                  {p.message && <p className="booking-item__msg">Message : {p.message}</p>}

                  <div className="booking-item__actions">
                    {p.status === 'PENDING' && (
                      <Button variant="danger-ghost" size="sm" onClick={() => handleCancelProposal(p.id)}>
                        Annuler la proposition
                      </Button>
                    )}
                    {p.status === 'ACCEPTED' && !p.bookingId && (
                      reserveState[p.id]?.open ? (
                        <div className="review-form">
                          <div className="form-group">
                            <span className="form-label">Date et heure du cours</span>
                            <input
                              type="datetime-local"
                              className="form-input"
                              value={reserveState[p.id].scheduledAt}
                              onChange={(e) => setReserveState(prev => ({ ...prev, [p.id]: { ...prev[p.id], scheduledAt: e.target.value } }))}
                            />
                          </div>
                          <div className="form-group">
                            <span className="form-label">Message (optionnel)</span>
                            <input
                              className="form-input"
                              value={reserveState[p.id].message}
                              onChange={(e) => setReserveState(prev => ({ ...prev, [p.id]: { ...prev[p.id], message: e.target.value } }))}
                            />
                          </div>
                          <div className="form-group">
                            <span className="form-label">Adresse du cours (si le cours a lieu chez vous)</span>
                            <input
                              className="form-input"
                              value={reserveState[p.id].meetingLocation}
                              onChange={(e) => setReserveState(prev => ({ ...prev, [p.id]: { ...prev[p.id], meetingLocation: e.target.value } }))}
                            />
                          </div>
                          <div className="form-row">
                            <Button size="sm" onClick={() => handleReserveSubmit(p.id)}>Confirmer la réservation</Button>
                            <Button variant="ghost" size="sm" onClick={() => setReserveState(prev => ({ ...prev, [p.id]: { ...prev[p.id], open: false } }))}>
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" icon="calendar" onClick={() => setReserveState(prev => ({ ...prev, [p.id]: { scheduledAt: '', message: '', meetingLocation: '', open: true } }))}>
                          Réserver à ce tarif
                        </Button>
                      )
                    )}
                    {p.status === 'ACCEPTED' && p.bookingId && (
                      <span className="booking-meta-item">
                        <Icon name="check-circle" size={15} className="cc-icon" />
                        Déjà utilisé pour la réservation n°{p.bookingId}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'settings' && (
        <section className="dash-card">
          <div className="dash-card__title"><h2>Paramètres</h2></div>
          <div className="form-row">
            <div className="form-group">
              <span className="form-label">Email</span>
              <p>{user?.email}</p>
            </div>
            <div className="form-group">
              <span className="form-label">Rôle</span>
              <p>Élève</p>
            </div>
          </div>
        </section>
      )}

      <ReviewModal
        open={Boolean(reviewTarget)}
        professorName={reviewTarget?.professorName || ''}
        offerTitle={reviewTarget?.offerTitle}
        submitting={reviewSubmitting}
        error={reviewError}
        onClose={() => setReviewTarget(null)}
        onSubmit={handleReviewSubmit}
      />
    </DashboardShell>
  );
}