import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getMyProfessorProfile, updateMyProfessorProfile, fetchCities, fetchSubjects, fetchLevels,
  getMyOffers, createOffer, updateOffer, deleteOffer,
  getMyAvailability, createAvailability, deleteAvailability,
  getMyProfessorBookings, acceptBooking, rejectBooking, completeBooking, markBookingPaid,
  getMyReviews,
  getProfessorProposals, acceptProposal, rejectProposal,
} from '../../services/api';
import DashboardShell from '../../components/dashboard/DashboardShell';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import RatingStarsDisplay from '../../components/ui/RatingStarsDisplay';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Field';
import {
  formatDay, formatCourseType, formatLocationType,
  formatDateFR, formatTimeFR, formatPaymentMethod, formatPaymentStatus, DAY_ORDER as DAYS,
} from '../../utils/labels';
import type { ProfessorProfile, City, Subject, Level, Offer, Availability, Booking, Review, PriceProposal, BookingStatus } from '../../types';

type Tab = 'overview' | 'profile' | 'offers' | 'availability' | 'bookings' | 'proposals' | 'reviews' | 'settings';
type BookingFilter = 'ALL' | BookingStatus;

const emptyOffer: Omit<Offer, 'id' | 'professorId' | 'active' | 'createdAt'> = {
  title: '', description: '', price: 0, durationMinutes: 60, courseType: 'INDIVIDUAL', locationType: 'STUDENT_HOME',
};
const emptyAvailability: { dayOfWeek: string; startTime: string; endTime: string } = { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '11:00' };

function formatPrice(p: number | null | undefined): string {
  return p == null ? '—' : `${Number(p).toFixed(2).replace(/\.00$/, '')} DH/h`;
}

function paymentBadgeVariant(status: string | null | undefined): 'green' | 'yellow' | 'gray' {
  if (status === 'PAID') return 'green';
  if (status === 'PENDING') return 'yellow';
  return 'gray';
}

const BOOKING_FILTER_TABS: { id: BookingFilter; label: string }[] = [
  { id: 'ALL', label: 'Toutes' },
  { id: 'PENDING', label: 'En attente' },
  { id: 'ACCEPTED', label: 'Confirmées' },
  { id: 'COMPLETED', label: 'Terminées' },
  { id: 'CANCELLED', label: 'Annulées' },
  { id: 'REJECTED', label: 'Refusées' },
];

export default function ProfessorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [profile, setProfile] = useState<ProfessorProfile | null>(null);

  const [cities, setCities] = useState<City[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [allLevels, setAllLevels] = useState<Level[]>([]);
  const [phone, setPhone] = useState('');
  const [cityId, setCityId] = useState<number | ''>('');
  const [bio, setBio] = useState('');
  const [teachingAddress, setTeachingAddress] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [offers, setOffers] = useState<Offer[]>([]);
  const [offerForm, setOfferForm] = useState(emptyOffer);
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);
  const [offerSaving, setOfferSaving] = useState(false);
  const [offerMessage, setOfferMessage] = useState('');

  const [availability, setAvailability] = useState<Availability[]>([]);
  const [availForm, setAvailForm] = useState(emptyAvailability);
  const [availSaving, setAvailSaving] = useState(false);
  const [availMessage, setAvailMessage] = useState('');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [proposals, setProposals] = useState<PriceProposal[]>([]);
  const [proposalMessage, setProposalMessage] = useState('');

  const [rejectTarget, setRejectTarget] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSaving, setRejectSaving] = useState(false);
  const [rejectError, setRejectError] = useState('');
  const [acceptTarget, setAcceptTarget] = useState<Booking | null>(null);
  const [acceptLink, setAcceptLink] = useState('');
  const [acceptLoc, setAcceptLoc] = useState('');
  const [acceptSaving, setAcceptSaving] = useState(false);
  const [acceptError, setAcceptError] = useState('');
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>('ALL');

  useEffect(() => {
    fetchCities().then(setCities).catch(() => {});
    fetchSubjects().then(setAllSubjects).catch(() => {});
    fetchLevels().then(setAllLevels).catch(() => {});
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAll() {
    getMyProfessorProfile()
      .then((p) => {
        setProfile(p);
        setPhone(p.phone || '');
        setCityId(p.cityId || '');
        setBio(p.bio || '');
        setTeachingAddress(p.teachingAddress || '');
        setExperienceYears(p.experienceYears || 0);
        setSelectedSubjects(p.subjects.map((s) => s.id));
        setSelectedLevels(p.levels.map((l) => l.id));
      })
      .catch(() => {});
    getMyOffers().then(setOffers).catch(() => {});
    getMyAvailability().then(setAvailability).catch(() => {});
    getMyProfessorBookings().then(setBookings).catch(() => {});
    getMyReviews().then(setReviews).catch(() => {});
    getProfessorProposals().then(setProposals).catch(() => {});
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function toggleSubject(id: number) {
    setSelectedSubjects((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleLevel(id: number) {
    setSelectedLevels((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSaveProfile() {
    setSaving(true);
    setMessage('');
    try {
      const updated = await updateMyProfessorProfile({
        phone,
        cityId: cityId !== '' ? Number(cityId) : undefined,
        bio,
        teachingAddress: teachingAddress.trim() || undefined,
        experienceYears,
        subjectIds: selectedSubjects.length > 0 ? selectedSubjects : undefined,
        levelIds: selectedLevels.length > 0 ? selectedLevels : undefined,
      });
      setProfile(updated);
      setMessage('Profil mis à jour avec succès');
    } catch {
      setMessage('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  }

  async function handleOfferSubmit() {
    setOfferSaving(true);
    setOfferMessage('');
    try {
      if (editingOfferId !== null) {
        await updateOffer(editingOfferId, { ...offerForm, price: Number(offerForm.price), durationMinutes: Number(offerForm.durationMinutes) });
        setOfferMessage('Offre mise à jour');
      } else {
        await createOffer({ ...offerForm, price: Number(offerForm.price), durationMinutes: Number(offerForm.durationMinutes) });
        setOfferMessage('Offre créée');
      }
      setOfferForm(emptyOffer);
      setEditingOfferId(null);
      setOffers(await getMyOffers());
    } catch (err) {
      setOfferMessage(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setOfferSaving(false);
    }
  }

  function startEditOffer(o: Offer) {
    setEditingOfferId(o.id);
    setOfferForm({
      title: o.title,
      description: o.description || '',
      price: o.price,
      durationMinutes: o.durationMinutes,
      courseType: o.courseType,
      locationType: o.locationType,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDeleteOffer(id: number) {
    if (!window.confirm('Supprimer cette offre ?')) return;
    try {
      await deleteOffer(id);
      setOffers(await getMyOffers());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  }

  async function handleAvailabilitySubmit() {
    setAvailSaving(true);
    setAvailMessage('');
    try {
      await createAvailability(availForm);
      setAvailMessage('Créneau ajouté');
      setAvailability(await getMyAvailability());
    } catch (err) {
      setAvailMessage(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setAvailSaving(false);
    }
  }

  async function handleDeleteAvailability(id: number) {
    if (!window.confirm('Supprimer ce créneau ?')) return;
    try {
      await deleteAvailability(id);
      setAvailability(await getMyAvailability());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  }

  async function handleProposalAction(id: number, action: 'accept' | 'reject') {
    setProposalMessage('');
    try {
      if (action === 'accept') await acceptProposal(id);
      if (action === 'reject') await rejectProposal(id);
      setProposals(await getProfessorProposals());
    } catch (err) {
      setProposalMessage(err instanceof Error ? err.message : 'Erreur');
    }
  }

  function promptAccept(b: Booking) {
    if (b.locationType === 'ONLINE') {
      setAcceptTarget(b);
      setAcceptLink('');
      setAcceptLoc('');
      setAcceptError('');
    } else {
      handleBookingAction(b.id, 'accept');
    }
  }

  async function handleBookingAction(id: number, action: 'accept' | 'complete') {
    try {
      if (action === 'accept') await acceptBooking(id, {});
      if (action === 'complete') await completeBooking(id);
      setBookings(await getMyProfessorBookings());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  }

  async function handleAcceptConfirm() {
    if (!acceptTarget) return;
    setAcceptSaving(true);
    setAcceptError('');
    try {
      await acceptBooking(acceptTarget.id, {
        meetingLink: acceptLink.trim() || undefined,
        meetingLocation: acceptLoc.trim() || undefined,
      });
      setAcceptTarget(null);
      setBookings(await getMyProfessorBookings());
    } catch (err) {
      setAcceptError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setAcceptSaving(false);
    }
  }

  async function handleMarkPaid(id: number) {
    try {
      await markBookingPaid(id);
      setBookings(await getMyProfessorBookings());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  }

  function promptReject(b: Booking) {
    setRejectTarget(b);
    setRejectReason('');
    setRejectError('');
  }

  async function handleRejectConfirm() {
    if (!rejectTarget) return;
    setRejectSaving(true);
    setRejectError('');
    try {
      await rejectBooking(rejectTarget.id, rejectReason.trim());
      setRejectTarget(null);
      setBookings(await getMyProfessorBookings());
    } catch (err) {
      setRejectError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setRejectSaving(false);
    }
  }

  const pendingProposals = proposals.filter((p) => p.status === 'PENDING').length;
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING').length;

  const filteredBookings = useMemo(
    () => (bookingFilter === 'ALL' ? bookings : bookings.filter((b) => b.status === bookingFilter)),
    [bookings, bookingFilter],
  );

  const navItems = [
    { id: 'overview' as Tab, label: "Vue d'ensemble", icon: 'home' as const },
    { id: 'profile' as Tab, label: 'Mon Profil', icon: 'users' as const },
    { id: 'offers' as Tab, label: 'Mes Offres', icon: 'book' as const },
    { id: 'availability' as Tab, label: 'Disponibilités', icon: 'calendar' as const },
    { id: 'bookings' as Tab, label: 'Réservations', icon: 'calendar' as const, badge: pendingBookings },
    { id: 'proposals' as Tab, label: 'Propositions', icon: 'wallet' as const, badge: pendingProposals },
    { id: 'reviews' as Tab, label: 'Avis', icon: 'star' as const },
    { id: 'settings' as Tab, label: 'Paramètres', icon: 'settings' as const },
  ];

  return (
    <DashboardShell
      navItems={navItems}
      active={tab}
      onSelect={(id) => setTab(id as Tab)}
      onLogout={handleLogout}
      user={user}
      roleLabel="Professeur"
      pageTitle={`Bonjour, ${user?.firstName || ''} !`}
      subtitle={profile?.verified ? (
        <span><Icon name="badge-check" size={15} /> Profil vérifié</span>
      ) : (
        <span className="dash__header-subtitle--muted">Profil en attente de vérification</span>
      )}
      action={profile ? (
        <Button to={`/professeur/${profile.id}`} variant="outline" icon="eye">Voir ma fiche publique</Button>
      ) : undefined}
    >
      {tab === 'overview' && profile && (
        <>
          <div className="stats-grid">
            <StatCard icon="star" label="Avis reçus" value={reviews.length} tone="green" />
            <StatCard icon="award" label="Note moyenne" value={profile.averageRating != null ? Number(profile.averageRating).toFixed(1) : '-'} tone="yellow" />
            <StatCard icon="book" label="Offres publiées" value={offers.length} tone="primary" />
            <StatCard icon="clock" label={pendingBookings > 0 ? 'Réservations en attente' : 'Aucune en attente'} value={pendingBookings} tone="info" />
          </div>
          <section className="dash-card">
            <div className="dash-card__title"><h2>Bienvenue dans votre espace</h2></div>
            <p>
              Gérez vos offres, vos disponibilités et vos réservations depuis le menu de gauche.
              {pendingBookings > 0 && <> Vous avez <strong>{pendingBookings} nouvelle(s) demande(s) de réservation en attente</strong>.</>}
              {pendingProposals > 0 && <> Vous avez <strong>{pendingProposals} proposition(s) de tarif en attente</strong>.</>}
              {pendingBookings === 0 && pendingProposals === 0 && ' Vous êtes à jour : aucune demande en attente.'}
            </p>
            {pendingBookings > 0 && (
              <div className="booking-item__actions" style={{ marginTop: '0.75rem' }}>
                <Button size="sm" icon="calendar" onClick={() => setTab('bookings')}>Gérer les demandes</Button>
              </div>
            )}
          </section>
        </>
      )}

      {tab === 'profile' && profile && (
        <section className="dash-card">
          <div className="dash-card__title"><h2>Mon Profil</h2></div>
          <div className="form-row">
            <div className="form-group">
              <span className="form-label">Nom complet (public)</span>
              <p>{profile.firstName} {profile.lastName}</p>
            </div>
            <div className="form-group">
              <span className="form-label">Email</span>
              <p>{profile.email}</p>
            </div>
          </div>
          <div className="form-row">
            <Input label="Téléphone" id="p-phone" type="tel" icon="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Select label="Ville" id="p-city" value={cityId} onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">—</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <Input label="Années d'expérience" id="p-exp" type="number" min={0} value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} />
          <Textarea label="Bio" id="p-bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
          <Input
            label="Adresse d'enseignement (pour les cours chez vous)"
            id="p-addr"
            value={teachingAddress}
            onChange={(e) => setTeachingAddress(e.target.value)}
            placeholder="Rue, immeuble, ville, ..."
            maxLength={500}
          />
          <p className="muted" style={{ marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
            Communiquée uniquement aux élèves dont la réservation est confirmée.
          </p>
          <div className="form-group">
            <span className="form-label">Matières</span>
            <div className="checkbox-group">
              {allSubjects.map((s) => (
                <label key={s.id} className="chip-checkbox">
                  <input type="checkbox" checked={selectedSubjects.includes(s.id)} onChange={() => toggleSubject(s.id)} />
                  <span className="badge badge--neutral">{s.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <span className="form-label">Niveaux</span>
            <div className="checkbox-group">
              {allLevels.map((l) => (
                <label key={l.id} className="chip-checkbox">
                  <input type="checkbox" checked={selectedLevels.includes(l.id)} onChange={() => toggleLevel(l.id)} />
                  <span className="badge badge--neutral">{l.name}</span>
                </label>
              ))}
            </div>
          </div>
          {message && <div className={message.includes('Erreur') ? 'error-banner' : 'success-banner'}><p>{message}</p></div>}
          <Button onClick={handleSaveProfile} loading={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer le profil'}
          </Button>
        </section>
      )}

      {tab === 'offers' && (
        <section className="dash-card">
          <div className="dash-card__title">
            <h2>{editingOfferId !== null ? "Modifier l'offre" : 'Nouvelle offre'}</h2>
            {editingOfferId !== null && (
              <Button variant="ghost" size="sm" onClick={() => { setEditingOfferId(null); setOfferForm(emptyOffer); }}>
                Annuler
              </Button>
            )}
          </div>
          <div className="form-row">
            <Input label="Titre *" id="o-title" placeholder="Ex : Soutien en Mathématiques" value={offerForm.title} onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })} required />
            <Input label="Prix (DH/heure) *" id="o-price" type="number" min={1} value={offerForm.price} onChange={(e) => setOfferForm({ ...offerForm, price: Number(e.target.value) })} required />
          </div>
          <div className="form-row">
            <Input label="Durée (min)" id="o-duration" type="number" min={15} value={offerForm.durationMinutes} onChange={(e) => setOfferForm({ ...offerForm, durationMinutes: Number(e.target.value) })} />
            <Select label="Type de cours" id="o-type" value={offerForm.courseType} onChange={(e) => setOfferForm({ ...offerForm, courseType: e.target.value as Offer['courseType'] })}>
              <option value="INDIVIDUAL">Individuel</option>
              <option value="GROUP">Groupe</option>
              <option value="ONLINE">En ligne</option>
            </Select>
            <Select label="Lieu" id="o-location" value={offerForm.locationType} onChange={(e) => setOfferForm({ ...offerForm, locationType: e.target.value as Offer['locationType'] })}>
              <option value="STUDENT_HOME">Chez l'élève</option>
              <option value="PROFESSOR_HOME">Chez le professeur</option>
              <option value="ONLINE">En ligne</option>
              <option value="OTHER">Autre</option>
            </Select>
          </div>
          <Textarea label="Description" id="o-desc" rows={2} value={offerForm.description} onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })} />
          {offerMessage && <div className={offerMessage.includes('Erreur') ? 'error-banner' : 'success-banner'}><p>{offerMessage}</p></div>}
          <Button onClick={handleOfferSubmit} loading={offerSaving} disabled={!offerForm.title || offerForm.price <= 0}>
            {offerSaving ? 'Enregistrement...' : editingOfferId !== null ? "Mettre à jour l'offre" : "Créer l'offre"}
          </Button>

          <div className="dash-card__section">
            <h3>Mes offres ({offers.length})</h3>
            {offers.length === 0 ? (
              <EmptyState
                emoji="📘"
                title="Aucune offre"
                text="Créez votre première offre pour apparaître dans les recherches d'élèves."
              />
            ) : (
              <div className="booking-list">
                {offers.map((o) => (
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
                      <Badge variant={o.active ? 'yellow' : 'neutral'}>{o.active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    {o.description && <p className="muted">{o.description}</p>}
                    <div className="booking-item__actions">
                      <Button variant="outline" size="sm" icon="edit" onClick={() => startEditOffer(o)}>Modifier</Button>
                      <Button variant="danger-ghost" size="sm" icon="trash" onClick={() => handleDeleteOffer(o.id)}>Supprimer</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'availability' && (
        <section className="dash-card">
          <div className="dash-card__title"><h2>Ajouter un créneau de disponibilité</h2></div>
          <div className="form-row">
            <Select label="Jour" id="a-day" value={availForm.dayOfWeek} onChange={(e) => setAvailForm({ ...availForm, dayOfWeek: e.target.value })}>
              {DAYS.map((d) => (
                <option key={d} value={d}>{formatDay(d)}</option>
              ))}
            </Select>
            <Input label="Début" id="a-start" type="time" value={availForm.startTime} onChange={(e) => setAvailForm({ ...availForm, startTime: e.target.value })} required />
            <Input label="Fin" id="a-end" type="time" value={availForm.endTime} onChange={(e) => setAvailForm({ ...availForm, endTime: e.target.value })} required />
          </div>
          {availMessage && <div className={availMessage.includes('Erreur') ? 'error-banner' : 'success-banner'}><p>{availMessage}</p></div>}
          <Button onClick={handleAvailabilitySubmit} loading={availSaving}>
            {availSaving ? 'Ajout...' : 'Ajouter le créneau'}
          </Button>

          <div className="dash-card__section">
            <h3>Mes créneaux ({availability.length})</h3>
            {availability.length === 0 ? (
              <EmptyState emoji="🕒" title="Aucun créneau" text="Ajoutez vos disponibilités pour que les élèves puissent réserver." />
            ) : (
              <div className="booking-list">
                {availability.map((a) => (
                  <div key={a.id} className="booking-item">
                    <div className="booking-item__head">
                      <div className="booking-item__title">
                        <h4>{formatDay(a.dayOfWeek)} · {a.startTime}–{a.endTime}</h4>
                      </div>
                      <Badge variant={a.active ? 'yellow' : 'neutral'}>{a.active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="booking-item__actions">
                      <Button variant="danger-ghost" size="sm" icon="trash" onClick={() => handleDeleteAvailability(a.id)}>Supprimer</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'bookings' && (
        <section className="dash-card">
          <div className="dash-card__title"><h2>Réservations ({bookings.length})</h2></div>
          {bookings.length > 0 && (
            <div className="seg-tabs" role="tablist" aria-label="Filtrer les réservations">
              {BOOKING_FILTER_TABS.map((f) => (
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
          )}
          {filteredBookings.length === 0 ? (
            <EmptyState
              emoji="📅"
              title={bookings.length === 0 ? 'Aucune réservation' : 'Aucune réservation dans cette catégorie'}
              text={bookings.length === 0 ? 'Les réservations des élèves apparaîtront ici.' : 'Essayez une autre catégorie.'}
            />
          ) : (
            <div className="booking-list">
              {filteredBookings.map((b) => (
                <div key={b.id} className="booking-item">
                  <div className="booking-item__head">
                    <div className="booking-item__title">
                      <h4>{b.offerTitle}</h4>
                      <span className="booking-item__prof">
                        <Avatar size="sm" name={b.studentName} />
                        {b.studentName}
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
                    <span className="booking-meta-item"><Icon name="calendar" size={16} />{formatDateFR(b.scheduledAt)}</span>
                    <span className="booking-meta-item"><Icon name="clock" size={16} />{formatTimeFR(b.scheduledAt)}{b.durationMinutes ? ` · ${b.durationMinutes} min` : ''}</span>
                  </div>
                  {b.locationType && b.locationType !== 'ONLINE' && (
                    <div className="booking-item__meta">
                      <span className="booking-meta-item"><Icon name="map-pin" size={16} />{formatLocationType(b.locationType)}</span>
                    </div>
                  )}
                  {b.amount != null && (
                    <div className="booking-price booking-price__meta">
                      <span>
                        <span className="booking-price__label">Montant à encaisser</span>
                        <span className="booking-price__value">
                          {Number(b.amount).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} DH
                        </span>
                      </span>
                      {b.negotiatedPrice != null && (
                        <span className="booking-price__sub">Tarif horaire négocié : {formatPrice(b.negotiatedPrice)}</span>
                      )}
                      {b.paidAt && <span className="booking-price__sub">Encaissé le {formatDateFR(b.paidAt)}</span>}
                    </div>
                  )}
                  {b.studentMessage && <p className="booking-item__msg">Message : {b.studentMessage}</p>}
                  {b.status === 'PENDING' && (
                    <div className="booking-item__actions">
                      <Button size="sm" icon="check" onClick={() => promptAccept(b)}>Accepter</Button>
                      <Button variant="danger" size="sm" icon="x" onClick={() => promptReject(b)}>Refuser</Button>
                    </div>
                  )}
                  {b.status === 'ACCEPTED' && (
                    <div className="booking-item__actions">
                      <Button variant="outline" size="sm" icon="check-circle" onClick={() => handleBookingAction(b.id, 'complete')}>Marquer comme terminé</Button>
                    </div>
                  )}
                  {b.status === 'COMPLETED' && b.paymentMethod === 'CASH' && b.paymentStatus !== 'PAID' && (
                    <div className="booking-item__actions">
                      <Button size="sm" icon="wallet" onClick={() => handleMarkPaid(b.id)}>Encaisser le paiement</Button>
                    </div>
                  )}
                  {b.status === 'REJECTED' && b.professorResponse && (
                    <p className="booking-item__msg">Motif : {b.professorResponse}</p>
                  )}
                  {b.status === 'CANCELLED' && (
                    <p className="booking-item__msg">L'élève a annulé cette réservation.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'proposals' && (
        <section className="dash-card">
          <div className="dash-card__title"><h2>Propositions de tarif ({proposals.length})</h2></div>
          {proposalMessage && <div className="error-banner"><p>{proposalMessage}</p></div>}
          {proposals.length === 0 ? (
            <EmptyState emoji="💬" title="Aucune proposition" text="Les élèves qui souhaitent négocier un tarif vous enverront une proposition." />
          ) : (
            <div className="proposal-list">
              {proposals.map((p) => (
                <div key={p.id} className="proposal-item">
                  <div className="booking-item__head">
                    <div className="booking-item__title">
                      <h4>{p.offerTitle}</h4>
                      <span className="booking-item__prof">
                        <Avatar size="sm" name={p.studentName} />
                        {p.studentName}
                      </span>
                    </div>
                    <StatusBadge status={p.status} kind="proposal" />
                  </div>
                  <div className="booking-item__meta">
                    <span className="booking-meta-item"><Icon name="clock" size={15} className="cc-icon" />{p.createdAt ? new Date(p.createdAt).toLocaleString('fr-FR') : ''}</span>
                  </div>
                  <div className="proposal-compare">
                    <span className="proposal-price">
                      <span className="tag">Prix initial</span>
                      <span className="amount strike">{formatPrice(p.initialPrice)}</span>
                    </span>
                    <Icon name="arrow-right" size={18} className="cc-icon proposal-arrow" />
                    <span className="proposal-price">
                      <span className="tag">Prix proposé</span>
                      <span className="amount" style={{ color: 'var(--primary)' }}>{formatPrice(p.proposedPrice)}</span>
                    </span>
                  </div>
                  {p.message && <p className="booking-item__msg">Message : {p.message}</p>}
                  {p.status === 'ACCEPTED' && p.bookingId && (
                    <p className="booking-item__msg">Accepté et utilisé pour la réservation n°{p.bookingId}.</p>
                  )}
                  {p.status === 'PENDING' && (
                    <div className="booking-item__actions">
                      <Button size="sm" icon="check" onClick={() => handleProposalAction(p.id, 'accept')}>Accepter</Button>
                      <Button variant="danger" size="sm" icon="x" onClick={() => handleProposalAction(p.id, 'reject')}>Refuser</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'reviews' && (
        <section className="dash-card">
          <div className="dash-card__title"><h2>Avis reçus ({reviews.length})</h2></div>
          {reviews.length === 0 ? (
            <EmptyState emoji="⭐" title="Aucun avis" text="Les avis des élèves apparaîtront ici après leurs cours terminés." />
          ) : (
            <div className="review-list">
              {reviews.map((r) => (
                <div key={r.id} className="review-item">
                  <div className="review-item__head">
                    <strong>{r.studentName}</strong>
                    <RatingStarsDisplay value={r.rating} size={1} showValue />
                  </div>
                  {r.comment && <p>{r.comment}</p>}
                  <span className="review-item__date">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
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
              <p>Professeur</p>
            </div>
            <div className="form-group">
              <span className="form-label">Profil vérifié</span>
              <p>{profile?.verified ? 'Oui' : 'Non'}</p>
            </div>
          </div>
          {profile && (
            <Button to={`/professeur/${profile.id}`} variant="outline" icon="eye">Voir ma fiche publique</Button>
          )}
        </section>
      )}

      <Modal
        open={Boolean(acceptTarget)}
        onClose={() => setAcceptTarget(null)}
        title="Accepter la réservation"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAcceptTarget(null)}>Annuler</Button>
            <Button onClick={handleAcceptConfirm} loading={acceptSaving}>
              {acceptSaving ? 'Acceptation...' : 'Confirmer l\'acceptation'}
            </Button>
          </>
        }
      >
        <p className="muted" style={{ marginBottom: '0.75rem' }}>
          {acceptTarget?.studentName} a réservé « {acceptTarget?.offerTitle} » (cours en ligne).
        </p>
        <Input
          label="Lien de la séance (optionnel)"
          id="accept-link"
          value={acceptLink}
          onChange={(e) => setAcceptLink(e.target.value)}
          placeholder="https://meet.google.com/..., https://zoom.us/..."
        />
        <p className="muted" style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}>
          L'élève verra ce lien dès que la réservation sera confirmée.
        </p>
        {acceptError && <div className="error-banner" style={{ marginTop: '0.75rem' }}><p>{acceptError}</p></div>}
      </Modal>

      <Modal
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Refuser la réservation"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectTarget(null)}>Annuler</Button>
            <Button variant="danger" onClick={handleRejectConfirm} loading={rejectSaving} disabled={!rejectReason.trim()}>
              {rejectSaving ? 'Refus en cours...' : 'Confirmer le refus'}
            </Button>
          </>
        }
      >
        <p className="muted" style={{ marginBottom: '0.75rem' }}>
          {rejectTarget?.studentName} a réservé « {rejectTarget?.offerTitle} ».
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
        {rejectError && <div className="error-banner" style={{ marginTop: '0.75rem' }}><p>{rejectError}</p></div>}
      </Modal>
    </DashboardShell>
  );
}