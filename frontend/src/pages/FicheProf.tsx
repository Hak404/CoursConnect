import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProfessor, createBooking, createPriceProposal, getMyProposals } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import RatingStarsDisplay from '../components/ui/RatingStarsDisplay';
import RatingSummary from '../components/ui/RatingSummary';
import { Input, Textarea } from '../components/ui/Field';
import {
  formatCourseType,
  formatDateFR,
  formatDay,
  formatDuration,
  formatLocationType,
  formatTime,
  formatTimeFR,
  formatPaymentMethod,
  formatBookingStatus,
  formatDateTimeRange,
} from '../utils/labels';
import { useFavorites } from '../utils/favorites';
import type { ProfessorDetail, PriceProposal, Offer, Booking, PaymentMethod, Availability } from '../types';

function toLocalIsoInput(value: string): string {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}

function amountFor(offer: Offer): number {
  return Math.round((offer.price * offer.durationMinutes) / 60 * 100) / 100;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

const DAY_OF_WEEK_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const SLOT_STEP_MIN = 60;
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface DayOption {
  key: string;
  weekday: string;
  dayLabel: string;
  full: string;
  available: boolean;
}

function buildDateOptions(availabilities: Availability[], days = 14): DayOption[] {
  const opts: DayOption[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    const weekday = DAY_OF_WEEK_NAMES[d.getDay()];
    opts.push({
      key: dateKey(d),
      weekday,
      dayLabel: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      full: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
      available: availabilities.some((a) => a.dayOfWeek === weekday),
    });
  }
  return opts;
}

function buildTimeSlots(date: string, availabilities: Availability[]): { time: string; available: boolean }[] {
  const d = new Date(`${date}T00:00:00`);
  const weekday = DAY_OF_WEEK_NAMES[d.getDay()];
  const windows = availabilities.filter((a) => a.dayOfWeek === weekday);
  const now = new Date();
  const todayKey = dateKey(now);
  const slots: { time: string; available: boolean }[] = [];
  for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) {
    const time = `${pad(h)}:00`;
    const smin = toMinutes(time);
    const covered = windows.some((a) => toMinutes(a.startTime) <= smin && toMinutes(a.endTime) >= smin + SLOT_STEP_MIN);
    let available = covered;
    if (available && date === todayKey && new Date(`${date}T${time}:00`).getTime() <= now.getTime()) {
      available = false;
    }
    slots.push({ time, available });
  }
  return slots;
}

function isSlotCoveredByAvailabilities(dt: Date, durationMinutes: number, availabilities: Availability[]): boolean {
  const dayName = DAY_OF_WEEK_NAMES[dt.getDay()];
  const start = dt.getHours() * 60 + dt.getMinutes();
  const end = start + durationMinutes;
  return availabilities.some(
    (a) => a.dayOfWeek === dayName && toMinutes(a.startTime) <= start && toMinutes(a.endTime) >= end
  );
}

export default function FicheProf() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFav, toggle } = useFavorites();
  const [professor, setProfessor] = useState<ProfessorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOffer, setSelectedOffer] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [message, setMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [booking, setBooking] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [favError, setFavError] = useState('');

  const [step, setStep] = useState(1);
  const [meetingLocation, setMeetingLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  const [proposals, setProposals] = useState<PriceProposal[]>([]);
  const [proposeStates, setProposeStates] = useState<Record<number, { price: string; msg: string; open: boolean }>>({});
  const [proposeMessage, setProposeMessage] = useState('');

  useEffect(() => {
    if (!bookingSuccess) return;
    const t = window.setTimeout(() => setBookingSuccess(''), 6000);
    return () => window.clearTimeout(t);
  }, [bookingSuccess]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchProfessor(Number(id))
      .then(setProfessor)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
    if (user && user.role === 'STUDENT') {
      getMyProposals().then((list) => setProposals(list.filter((p) => p.professorId === Number(id)))).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const reviewDistribution = useMemo(() => {
    if (!professor) return undefined;
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    professor.reviews.forEach((r) => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
    return dist;
  }, [professor]);

  const dateOptions = useMemo<DayOption[]>(
    () => (professor ? buildDateOptions(professor.availabilities) : []),
    [professor]
  );

  const timeSlots = useMemo(
    () => (professor && selectedDate ? buildTimeSlots(selectedDate, professor.availabilities) : []),
    [selectedDate, professor]
  );

  const courseTypes = useMemo(
    () => (professor ? Array.from(new Set(professor.offers.map((o) => o.courseType))) : []),
    [professor]
  );

  function scrollToBooking() {
    document.getElementById('reserver')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function goToStep(n: number) {
    setStep(n);
    setBookingError('');
    setBookingSuccess('');
    document.getElementById('reserver')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleNext() {
    if (step === 1) {
      if (!scheduledAt) {
        setBookingError('Veuillez choisir une date et une heure disponibles dans la section Disponibilités.');
        document.getElementById('dispo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (selectedOffer === '') {
        setBookingError('Veuillez choisir une offre de cours.');
        return;
      }
    }
    if (step === 2 && selectedOfferObj && (selectedOfferObj.locationType === 'STUDENT_HOME' || selectedOfferObj.locationType === 'OTHER') && !meetingLocation.trim()) {
      setBookingError('Veuillez indiquer l\'adresse du rendez-vous.');
      return;
    }
    goToStep(step + 1);
  }

  async function handleConfirmBooking() {
    if (!user) {
      setBookingError('Veuillez vous connecter pour réserver.');
      return;
    }
    if (selectedOffer === '') {
      setBookingError('Veuillez choisir une offre de cours.');
      return;
    }
    if (!scheduledAt) {
      setBookingError('Veuillez choisir un créneau dans les disponibilités du professeur.');
      return;
    }
    const dt = new Date(toLocalIsoInput(scheduledAt) || scheduledAt);
    if (professor && professor.availabilities.length > 0 && selectedOfferObj &&
        !Number.isNaN(dt.getTime())) {
      if (!isSlotCoveredByAvailabilities(dt, selectedOfferObj.durationMinutes, professor.availabilities)) {
        setBookingError('Ce créneau n\'est pas dans les disponibilités du professeur. Choisissez une heure parmi les créneaux proposés.');
        scrollToBooking();
        return;
      }
      if (dt.getTime() <= Date.now()) {
        setBookingError('La date choisie est passée. Choisissez un horaire à venir.');
        scrollToBooking();
        return;
      }
    }
    setBooking(true);
    setBookingError('');
    setBookingSuccess('');
    try {
      const created = await createBooking({
        offerId: Number(selectedOffer),
        scheduledAt: toLocalIsoInput(scheduledAt),
        studentMessage: message || undefined,
        paymentMethod,
        meetingLocation: meetingLocation.trim() || undefined,
      });
      setCreatedBooking(created);
      setBookingSuccess('Réservation confirmée !');
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Erreur lors de la réservation');
    } finally {
      setBooking(false);
    }
  }

  function resetBooking() {
    setStep(1);
    setScheduledAt('');
    setSelectedDate('');
    setSelectedTime('');
    setMessage('');
    setMeetingLocation('');
    setPaymentMethod('CASH');
    setCreatedBooking(null);
    setSelectedOffer('');
    setBookingError('');
    setBookingSuccess('');
  }

  async function handlePropose(offerId: number) {
    const state = proposeStates[offerId];
    if (!state || !state.price) {
      setProposeMessage('Veuillez saisir un prix proposé');
      return;
    }
    setProposeMessage('');
    try {
      await createPriceProposal({
        offerId,
        proposedPrice: Number(state.price),
        message: state.msg || undefined,
      });
      setProposeStates(prev => ({ ...prev, [offerId]: { ...prev[offerId], open: false, price: '', msg: '' } }));
      setProposals(await getMyProposals().then((list) => list.filter((p) => p.professorId === Number(id))));
      setProposeMessage('Proposition envoyée ! Le professeur sera notifié.');
    } catch (err) {
      setProposeMessage(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    }
  }

  function proposalFor(offerId: number): PriceProposal | undefined {
    return proposals.find((p) => p.offerId === offerId && p.status === 'PENDING');
  }

  function selectOfferAndScroll(offerId: number) {
    setSelectedOffer(offerId);
    setBookingError('');
    setStep(1);
    document.getElementById('dispo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const selectedOfferObj = useMemo<Offer | undefined>(() => {
    if (selectedOffer === '') return undefined;
    return professor?.offers.find((o) => o.id === selectedOffer);
  }, [professor, selectedOffer]);

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (error || !professor) {
    return (
      <div className="page-center">
        <p className="error-text">{error || 'Professeur introuvable'}</p>
        <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
      </div>
    );
  }

  return (
    <div className="fiche-prof container">
      <button className="btn--back" onClick={() => navigate('/recherche')}>
        <Icon name="arrow-left" size={18} /> Retour à la recherche
      </button>

      <div className="profile-hero">
        <Avatar name={`${professor.firstName} ${professor.lastName}`} src={professor.profilePhoto} size="xl" />
        <div className="profile-hero__info">
          <p className="profile-hero__teacher">Professeur</p>
          <h1 className="profile-hero__name">
            {professor.firstName} {professor.lastName}
            {professor.verified && <Badge variant="green" icon="badge-check">Profil vérifié</Badge>}
          </h1>
          <div className="profile-hero__meta">
            {professor.subjects.length > 0 && (
              <span className="profile-hero__subject">
                <Icon name="book" size={16} className="cc-icon" /> {professor.subjects.map((s) => s.name).join(' · ')}
              </span>
            )}
            {professor.cityName && (
              <span className="profile-hero__metro-line">
                <Icon name="map-pin" size={16} className="cc-icon" /> {professor.cityName}
              </span>
            )}
            <span className="profile-hero__rating">
              <RatingStarsDisplay value={professor.averageRating ?? 0} size={18} />
              <span className="value">{professor.averageRating != null ? Number(professor.averageRating).toFixed(1) : 'Nouveau'}</span>
              {professor.reviewCount > 0 && (
                <span className="muted">({professor.reviewCount} avis)</span>
              )}
            </span>
            {professor.experienceYears != null && professor.experienceYears !== undefined && (
              <span className="profile-hero__metro-line">
                <Icon name="award" size={16} className="cc-icon" /> {professor.experienceYears} ans d'expérience
              </span>
            )}
          </div>
          <div className="profile-hero__actions">
            <Button icon="calendar" onClick={scrollToBooking}>Réserver un cours</Button>
            <Button
              variant={isFav(professor.id) ? 'secondary' : 'outline'}
              icon="heart"
              className={isFav(professor.id) ? 'is-fav' : ''}
              disabled={favBusy}
              loading={favBusy}
              onClick={async () => {
                if (favBusy) return;
                setFavError('');
                if (!user) {
                  navigate('/login');
                  return;
                }
                if (user.role !== 'STUDENT') {
                  setFavError('Les favoris sont réservés aux élèves.');
                  return;
                }
                setFavBusy(true);
                try {
                  const result = await toggle(professor.id);
                  if (result === 'error') setFavError('Impossible de mettre à jour les favoris. Veuillez réessayer.');
                  else if (result === 'needs-auth') navigate('/login');
                } finally {
                  setFavBusy(false);
                }
              }}
            >
              {isFav(professor.id) ? 'Ajouté aux favoris' : 'Ajouter aux favoris'}
            </Button>
            {favError && (
              <p className="profile-hero__fav-error" role="alert">{favError}</p>
            )}
          </div>
        </div>
      </div>

      {professor.bio && (
        <section className="fiche-prof__section">
          <h2><Icon name="info" size={20} className="cc-icon" /> À propos</h2>
          <p className="fiche-prof__bio">{professor.bio}</p>
        </section>
      )}

      {(professor.subjects.length > 0 || professor.levels.length > 0 || courseTypes.length > 0) && (
        <section className="fiche-prof__section">
          <h2><Icon name="book" size={20} className="cc-icon" /> Enseignement</h2>
          <div className="teaching-grid">
            {professor.subjects.length > 0 && (
              <div className="teaching-item">
                <span className="teaching-item__label"><Icon name="book" size={15} className="cc-icon" /> Matières</span>
                <div className="badge-list">
                  {professor.subjects.map((s) => <Badge key={s.id} variant="blue">{s.name}</Badge>)}
                </div>
              </div>
            )}
            {professor.levels.length > 0 && (
              <div className="teaching-item">
                <span className="teaching-item__label"><Icon name="grad-hat" size={15} className="cc-icon" /> Niveaux</span>
                <div className="badge-list">
                  {professor.levels.map((l) => <Badge key={l.id} variant="green">{l.name}</Badge>)}
                </div>
              </div>
            )}
            {courseTypes.length > 0 && (
              <div className="teaching-item">
                <span className="teaching-item__label"><Icon name="users" size={15} className="cc-icon" /> Type de cours</span>
                <div className="badge-list">
                  {courseTypes.map((t) => <Badge key={t} variant="gray">{formatCourseType(t)}</Badge>)}
                </div>
              </div>
            )}
            {(professor.cityName || (professor.experienceYears != null && professor.experienceYears !== undefined)) && (
              <div className="teaching-item">
                <span className="teaching-item__label"><Icon name="map-pin" size={15} className="cc-icon" /> Lieu & expérience</span>
                <div className="badge-list">
                  {professor.cityName && <Badge variant="gray" icon="map-pin">{professor.cityName}</Badge>}
                  {professor.experienceYears != null && professor.experienceYears !== undefined && (
                    <Badge variant="gray" icon="award">{professor.experienceYears} ans d'expérience</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {professor.offers.length === 0 && (
        <section className="fiche-prof__section">
          <h2><Icon name="wallet" size={20} className="cc-icon" /> Offres de cours</h2>
          <p className="muted">Ce professeur n'a pas encore publié d'offres de cours.</p>
        </section>
      )}

      {professor.offers.length > 0 && (
        <section className="fiche-prof__section">
          <h2><Icon name="wallet" size={20} className="cc-icon" /> Offres de cours</h2>
          <div className="offer-list">
            {professor.offers.map((o) => {
              const pending = proposalFor(o.id);
              return (
                <div key={o.id} className={`offer-card ${selectedOffer === o.id ? 'is-selected' : ''}`}>
                  <h3 className="offer-card__title">{o.title}</h3>
                  {o.description && <p className="offer-card__desc">{o.description}</p>}
                  <div className="offer-card__meta">
                    <Badge variant="gray" icon="clock">{formatDuration(o.durationMinutes)}</Badge>
                    <Badge variant="gray" icon="grad-hat">{formatCourseType(o.courseType)}</Badge>
                    {o.courseType === 'ONLINE' || o.locationType === 'ONLINE' ? (
                      <Badge variant="gray" icon="video">{o.meetingPlatform || 'En ligne'}</Badge>
                    ) : (
                      <Badge variant="gray" icon="map-pin">{formatLocationType(o.locationType)}</Badge>
                    )}
                  </div>
                  <div className="offer-card__price-row">
                    <p className="offer-card__price">
                      {o.price} <span className="unit">DH/heure</span>
                    </p>
                    <p className="offer-card__amount">≈ {amountFor(o).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} DH / séance</p>
                  </div>

                  {pending && (
                    <div className="offer-card__proposal-status">
                      <Icon name="clock" size={16} className="cc-icon" />
                      Proposition envoyée : {pending.proposedPrice} DH/h
                    </div>
                  )}

                  <div className="offer-card__actions">
                    <Button full onClick={() => selectOfferAndScroll(o.id)}>Réserver ce cours</Button>
                    {user && user.role === 'STUDENT' && !pending && (
                      proposeStates[o.id]?.open ? (
                        <div className="propose-form">
                          <div className="form-row">
                            <Input
                              type="number"
                              min={1}
                              step="0.01"
                              placeholder="Prix proposé (DH/h)"
                              aria-label={`Prix proposé pour ${o.title}`}
                              value={proposeStates[o.id].price}
                              onChange={(e) => setProposeStates(prev => ({ ...prev, [o.id]: { ...prev[o.id], price: e.target.value } }))}
                            />
                          </div>
                          <Input
                            type="text"
                            placeholder="Message (optionnel)"
                            aria-label="Message de la proposition"
                            value={proposeStates[o.id].msg}
                            onChange={(e) => setProposeStates(prev => ({ ...prev, [o.id]: { ...prev[o.id], msg: e.target.value } }))}
                          />
                          <div className="form-row">
                            <Button size="sm" variant="secondary" onClick={() => handlePropose(o.id)}>Envoyer</Button>
                            <Button size="sm" variant="ghost" onClick={() => setProposeStates(prev => ({ ...prev, [o.id]: { ...prev[o.id], open: false } }))}>
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button variant="outline" onClick={() => setProposeStates(prev => ({ ...prev, [o.id]: { price: '', msg: '', open: true } }))}>
                          Proposer un autre tarif
                        </Button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {proposeMessage && <div className="error-banner" style={{ marginTop: '1rem' }}><p>{proposeMessage}</p></div>}
        </section>
      )}

      {professor.availabilities.length > 0 && (
        <section className="fiche-prof__section" id="dispo">
          <h2><Icon name="calendar" size={20} className="cc-icon" /> Disponibilités</h2>
          <div className="days-badges">
            {professor.availabilities.map((a) => (
              <span key={a.id} className="day-badge">
                <Icon name="clock" size={14} className="cc-icon" />
                {formatDay(a.dayOfWeek)} {formatTime(a.startTime)}–{formatTime(a.endTime)}
              </span>
            ))}
          </div>

          {dateOptions.length > 0 && (
            <div className="slot-picker">
              <p className="teaching-item__label"><Icon name="calendar" size={15} className="cc-icon" /> Choisissez une date</p>
              <div className="date-strip" role="group" aria-label="Dates disponibles">
                {dateOptions.map((d) => {
                  const disabled = !d.available;
                  const isSel = selectedDate === d.key;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      className={`day-choice ${disabled ? 'is-disabled' : ''} ${isSel ? 'is-selected' : ''}`}
                      aria-pressed={isSel}
                      disabled={disabled}
                      onClick={() => {
                        setSelectedDate(d.key);
                        setSelectedTime('');
                        setScheduledAt('');
                        setBookingError('');
                      }}
                    >
                      <span className="day-choice__dow">{d.full.split(' ')[0]}</span>
                      <span className="day-choice__num">{d.key.slice(8)}</span>
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <>
                  <p className="teaching-item__label" style={{ marginTop: '1rem' }}>
                    <Icon name="clock" size={15} className="cc-icon" /> Heures disponibles — {formatDateFR(`${selectedDate}T12:00:00`)}
                  </p>
                  <div className="time-grid" role="group" aria-label="Créneaux horaires">
                    {timeSlots.map((s) => {
                      const disabled = !s.available;
                      const isSel = selectedTime === s.time;
                      return (
                        <button
                          key={s.time}
                          type="button"
                          className={`slot-chip ${disabled ? 'is-disabled' : ''} ${isSel ? 'is-selected' : ''}`}
                          aria-pressed={isSel}
                          disabled={disabled}
                          onClick={() => {
                            setSelectedTime(s.time);
                            setScheduledAt(`${selectedDate}T${s.time}:00`);
                            setBookingError('');
                            scrollToBooking();
                          }}
                        >
                          {s.time}
                        </button>
                      );
                    })}
                  </div>
                  {timeSlots.every((s) => !s.available) && (
                    <p className="muted">Aucun créneau encore disponible ce jour-là.</p>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      )}

      <section className="fiche-prof__section" id="reserver">
        <h2><Icon name="calendar" size={20} className="cc-icon" /> Réserver un cours</h2>
        {!user ? (
          <p>
            Veuillez{' '}
            <Button variant="link" onClick={() => navigate('/login')}>vous connecter</Button>{' '}
            pour réserver un cours avec {professor.firstName}.
          </p>
        ) : createdBooking ? (
          <div className="booking-success">
            <div className="booking-success__icon"><Icon name="check-circle" size={40} /></div>
            <h3 className="fiche-prof__success-title">Réservation confirmée !</h3>
            <p className="fiche-prof__success-text">
              Votre demande de cours pour <strong>{createdBooking.offerTitle}</strong> avec {professor.firstName} a bien été enregistrée.
            </p>
            <div className="booking-recap" style={{ marginTop: '1rem' }}>
              <div className="booking-recap__row">
                <span className="booking-recap__label">Professeur</span>
                <span className="booking-recap__value">{professor.firstName} {professor.lastName}</span>
              </div>
              <div className="booking-recap__row">
                <span className="booking-recap__label">Date</span>
                <span className="booking-recap__value">{formatDateFR(createdBooking.scheduledAt)}</span>
              </div>
              <div className="booking-recap__row">
                <span className="booking-recap__label">Heure</span>
                <span className="booking-recap__value">{formatTimeFR(createdBooking.scheduledAt)}</span>
              </div>
              <div className="booking-recap__row">
                <span className="booking-recap__label">Montant</span>
                <span className="booking-recap__value">{createdBooking.amount != null ? `${createdBooking.amount} ${createdBooking.currency || 'DH'}` : (selectedOfferObj ? `${amountFor(selectedOfferObj).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} DH` : '')}</span>
              </div>
              <div className="booking-recap__row">
                <span className="booking-recap__label">Statut</span>
                <span className="booking-recap__value">{formatBookingStatus(createdBooking.status)}</span>
              </div>
            </div>
            <div className="booking-success__actions">
              <Button icon="calendar" to="/student/reservations">Voir mes réservations</Button>
              <Button variant="outline" icon="search" to="/recherche">Rechercher d'autres cours</Button>
            </div>
            <Button variant="ghost" size="sm" onClick={resetBooking}>Faire une autre demande</Button>
          </div>
        ) : (
          <div className="booking-form">
            <div className="booking-steps" aria-label="Étapes de réservation">
              {[
                { n: 1, label: 'Offre' },
                { n: 2, label: 'Lieu' },
                { n: 3, label: 'Paiement' },
                { n: 4, label: 'Récapitulatif' },
              ].map((s) => (
                <button
                  key={s.n}
                  type="button"
                  className={`booking-steps__item ${step === s.n ? 'is-active' : ''} ${step > s.n ? 'is-done' : ''}`}
                  onClick={() => s.n < step && goToStep(s.n)}
                  disabled={s.n >= step}
                  aria-current={step === s.n ? 'step' : undefined}
                >
                  <span className="booking-steps__num">{s.n < step ? '✓' : s.n}</span>
                  <span className="booking-steps__label">{s.label}</span>
                </button>
              ))}
            </div>

            {scheduledAt && (
              <p className="booking-slot-hint">
                <Icon name="clock" size={14} className="cc-icon" />
                Créneau choisi : <strong>{formatDateFR(scheduledAt)}</strong> à <strong>{formatTimeFR(scheduledAt)}</strong>
              </p>
            )}

            {step === 1 && (
              <div className="booking-step-panel">
                {!scheduledAt && (
                  <div className="error-banner" style={{ marginBottom: '1rem' }}>
                    <p>
                      Choisissez d'abord une date et une heure dans la section{' '}
                      <Button variant="link" onClick={() => document.getElementById('dispo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                        Disponibilités
                      </Button>
                      .
                    </p>
                  </div>
                )}
                <p className="muted">Choisissez l'offre de cours que vous souhaitez réserver.</p>
                <div className="booking-offers">
                  {professor.offers.map((o) => {
                    const fitsPortion = scheduledAt && isSlotCoveredByAvailabilities(new Date(scheduledAt), o.durationMinutes, professor.availabilities);
                    return (
                      <label key={o.id} className={`booking-offer ${selectedOffer === o.id ? 'is-selected' : ''}`}>
                        <input
                          type="radio"
                          name="bookingOffer"
                          value={o.id}
                          checked={selectedOffer === o.id}
                          onChange={() => { setSelectedOffer(o.id); setMeetingLocation(''); setBookingError(''); }}
                        />
                        <span className="booking-offer__body">
                          <strong>{o.title}</strong>
                          <span className="booking-offer__meta">
                            {formatDuration(o.durationMinutes)} · {formatCourseType(o.courseType)} · {formatLocationType(o.locationType)}
                          </span>
                          {o.description && <span className="booking-offer__desc">{o.description}</span>}
                          {scheduledAt && !fitsPortion && (
                            <span className="booking-offer__warn">
                              <Icon name="clock" size={14} className="cc-icon" /> Cette durée dépasse le créneau disponible.
                            </span>
                          )}
                        </span>
                        <span className="booking-offer__price">{o.price} DH/h</span>
                      </label>
                    );
                  })}
                </div>
                <div className="booking-item__actions">
                  <Button size="lg" icon="arrow-right" onClick={handleNext}>Continuer</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="booking-step-panel">
                {selectedOfferObj?.locationType === 'STUDENT_HOME' || selectedOfferObj?.locationType === 'OTHER' ? (
                  <>
                    <p className="muted">
                      Ce cours a lieu chez vous (ou dans un autre lieu de votre choix). Cette adresse ne sera
                      communiquée qu'au professeur, après confirmation de la réservation.
                    </p>
                    <Input
                      label="Adresse du rendez-vous"
                      id="meetingLocation"
                      value={meetingLocation}
                      onChange={(e) => setMeetingLocation(e.target.value)}
                      placeholder="Rue, immeuble, ville, ..."
                      maxLength={500}
                      required
                    />
                  </>
                ) : selectedOfferObj?.locationType === 'PROFESSOR_HOME' ? (
                  <p className="muted booking-note">
                    <Icon name="map-pin" size={16} className="cc-icon" />
                    Ce cours a lieu chez le professeur. L'adresse exacte vous sera communiquée
                    après confirmation de la réservation.
                  </p>
                ) : (
                  <p className="muted booking-note">
                    <Icon name="video" size={16} className="cc-icon" />
                    Ce cours se déroule en ligne. Le lien de la séance vous sera communiqué
                    après confirmation de la réservation.
                  </p>
                )}
                <div className="booking-item__actions">
                  <Button variant="ghost" onClick={() => goToStep(1)}>Retour</Button>
                  <Button size="lg" icon="arrow-right" onClick={handleNext}>Continuer</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="booking-step-panel">
                <fieldset className="booking-pay-options">
                  <legend className="form-label">Moyen de paiement</legend>
                  <label className={`booking-pay-option ${paymentMethod === 'CASH' ? 'is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CASH"
                      checked={paymentMethod === 'CASH'}
                      onChange={() => setPaymentMethod('CASH')}
                    />
                    <span className="booking-pay-option__icon"><Icon name="wallet" size={18} /></span>
                    <span className="booking-pay-option__body">
                      <strong>En espèces</strong>
                      <span className="muted">Vous réglez le jour du cours, après la séance.</span>
                    </span>
                    <span className="booking-pay-option__check"><Icon name="check" size={14} /></span>
                  </label>
                  <label className="booking-pay-option is-disabled">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === 'ONLINE'}
                      disabled
                    />
                    <span className="booking-pay-option__icon"><Icon name="shield" size={18} /></span>
                    <span className="booking-pay-option__body">
                      <strong>Paiement en ligne</strong>
                      <span className="muted">Bientôt disponible</span>
                    </span>
                  </label>
                </fieldset>
                <div className="booking-item__actions">
                  <Button variant="ghost" onClick={() => goToStep(2)}>Retour</Button>
                  <Button size="lg" icon="arrow-right" onClick={handleNext}>Continuer</Button>
                </div>
              </div>
            )}

            {step === 4 && selectedOfferObj && (
              <div className="booking-step-panel">
                <div className="booking-recap">
                  <div className="booking-recap__row">
                    <span className="booking-recap__label">Professeur</span>
                    <span className="booking-recap__value">{professor.firstName} {professor.lastName}</span>
                  </div>
                  <div className="booking-recap__row">
                    <span className="booking-recap__label">Cours</span>
                    <span className="booking-recap__value">{selectedOfferObj.title}</span>
                  </div>
                  <div className="booking-recap__row">
                    <span className="booking-recap__label">Date</span>
                    <span className="booking-recap__value">{formatDateFR(scheduledAt)}</span>
                  </div>
                  <div className="booking-recap__row">
                    <span className="booking-recap__label">Horaires</span>
                    <span className="booking-recap__value">
                      {formatDateTimeRange(scheduledAt, selectedOfferObj.durationMinutes)} ({selectedOfferObj.durationMinutes} min)
                    </span>
                  </div>
                  <div className="booking-recap__row">
                    <span className="booking-recap__label">Durée</span>
                    <span className="booking-recap__value">{formatDuration(selectedOfferObj.durationMinutes)}</span>
                  </div>
                  <div className="booking-recap__row">
                    <span className="booking-recap__label">Type de cours</span>
                    <span className="booking-recap__value">{formatCourseType(selectedOfferObj.courseType)}</span>
                  </div>
                  <div className="booking-recap__row">
                    <span className="booking-recap__label">Prix horaire</span>
                    <span className="booking-recap__value">{selectedOfferObj.price} DH/h</span>
                  </div>
                  <div className="booking-recap__row">
                    <span className="booking-recap__label">Lieu</span>
                    <span className="booking-recap__value">
                      {formatLocationType(selectedOfferObj.locationType)}
                      {meetingLocation && <><br />{meetingLocation}</>}
                    </span>
                  </div>
                  <div className="booking-recap__row">
                    <span className="booking-recap__label">Paiement</span>
                    <span className="booking-recap__value">{formatPaymentMethod(paymentMethod)}</span>
                  </div>
                  <div className="booking-recap__row booking-recap__row--total">
                    <span className="booking-recap__label">Montant total</span>
                    <span className="booking-recap__value">
                      {amountFor(selectedOfferObj).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} DH
                    </span>
                  </div>
                </div>

                <Textarea
                  label="Message au professeur"
                  id="msg"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Objectifs, niveau actuel, préférences..."
                />

                <div className="booking-item__actions">
                  <Button variant="ghost" onClick={() => goToStep(3)}>Retour</Button>
                  <Button size="lg" icon="check" onClick={handleConfirmBooking} loading={booking}>
                    {booking ? 'Envoi...' : 'Confirmer la réservation'}
                  </Button>
                </div>
              </div>
            )}

            {bookingError && <div className="error-banner"><p>{bookingError}</p></div>}
            {bookingSuccess && <div className="success-banner"><p>{bookingSuccess}</p></div>}
          </div>
        )}
      </section>

      <section className="fiche-prof__section" id="avis">
        <h2><Icon name="star" size={20} className="cc-icon" /> Avis des élèves ({professor.reviewCount})</h2>

        {professor.reviews.length === 0 ? (
          <div className="review-empty">
            <p className="review-empty__title">Aucun avis pour le moment.</p>
            <p className="review-empty__text">Les avis apparaîtront ici après les cours terminés. Soyez la première personne à partager votre expérience.</p>
          </div>
        ) : (
          <>
            <RatingSummary
              average={professor.averageRating}
              count={professor.reviewCount}
              distribution={reviewDistribution}
            />

            <div className="review-list">
              {professor.reviews.map((r) => (
                <article key={r.id} className="review-item">
                  <div className="review-item__head">
                    <Avatar size="sm" name={r.studentName} />
                    <div className="review-item__who">
                      <p className="review-item__author">{r.studentName}</p>
                      <time className="review-item__date" dateTime={r.createdAt}>
                        {formatDateFR(r.createdAt)}
                      </time>
                    </div>
                    <div className="review-item__stars">
                      <RatingStarsDisplay value={r.rating} size={15} />
                    </div>
                  </div>
                  {r.comment ? (
                    <p className="review-item__body">{r.comment}</p>
                  ) : (
                    <p className="review-item__no-comment">Avis sans commentaire.</p>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}