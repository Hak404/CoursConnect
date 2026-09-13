import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProfessorShell from '../../components/dashboard/ProfessorShell';
import BookingCard from '../../components/dashboard/BookingCard';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  getMyProfessorBookings, getMyOffers, getProfessorProposals, acceptProposal, rejectProposal,
} from '../../services/api';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import { formatPrice, formatDateTimeRange } from '../../utils/labels';
import type { Booking, Offer, PriceProposal } from '../../types';

type BookingFilter = 'ALL' | 'PENDING' | 'ACCEPTED' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

const TABS: { id: BookingFilter; label: string }[] = [
  { id: 'ALL', label: 'Toutes' },
  { id: 'PENDING', label: 'En attente' },
  { id: 'ACCEPTED', label: 'Confirmées' },
  { id: 'UPCOMING', label: 'À venir' },
  { id: 'COMPLETED', label: 'Terminées' },
  { id: 'CANCELLED', label: 'Annulées' },
];

function matchesFilter(b: Booking, filter: BookingFilter): boolean {
  const now = Date.now();
  switch (filter) {
    case 'ALL': return true;
    case 'PENDING': return b.status === 'PENDING';
    case 'ACCEPTED': return b.status === 'ACCEPTED';
    case 'UPCOMING': return b.status === 'ACCEPTED' && new Date(b.scheduledAt).getTime() >= now;
    case 'COMPLETED': return b.status === 'COMPLETED';
    case 'CANCELLED': return b.status === 'CANCELLED' || b.status === 'REJECTED';
    default: return true;
  }
}

export default function ProfessorBookings() {
  const unreadCount = useUnreadCount();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const tabParam = searchParams.get('tab');
  const [filter, setFilter] = useState<BookingFilter>(
    ['PENDING', 'ACCEPTED', 'UPCOMING', 'COMPLETED', 'CANCELLED'].includes(filterParam || '') ? (filterParam as BookingFilter) : 'ALL',
  );
  const [showProposals, setShowProposals] = useState(tabParam === 'proposals');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [proposals, setProposals] = useState<PriceProposal[]>([]);
  const [proposalMessage, setProposalMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getMyProfessorBookings(), getMyOffers(), getProfessorProposals()])
      .then(([b, o, p]) => {
        if (!mounted) return;
        setBookings(b);
        setOffers(o);
        setProposals(p);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  function selectTab(f: BookingFilter) {
    setFilter(f);
    setShowProposals(false);
    const next = new URLSearchParams(searchParams);
    if (f === 'ALL') next.delete('filter');
    else next.set('filter', f);
    next.delete('tab');
    setSearchParams(next, { replace: true });
  }

  function selectProposals() {
    setShowProposals(true);
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'proposals');
    next.delete('filter');
    setSearchParams(next, { replace: true });
  }

  async function reload() {
    const [b, p] = await Promise.all([getMyProfessorBookings(), getProfessorProposals()]);
    setBookings(b);
    setProposals(p);
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

  const pendingProposals = proposals.filter((p) => p.status === 'PENDING').length;
  const filtered = useMemo(
    () => (showProposals ? [] : bookings.filter((b) => matchesFilter(b, filter))),
    [bookings, filter, showProposals],
  );
  const platformOf = (b: Booking) => offers.find((o) => o.id === b.offerId)?.meetingPlatform || '';

  return (
    <ProfessorShell
      pageTitle="Mes réservations"
      subtitle="Suivez les demandes, confirmez les séances et gérez les cours en ligne."
      unreadCount={unreadCount}
    >
      <section className="dash-card">
        <div className="dash-card__title">
          <h2>Réservations ({bookings.length})</h2>
          {pendingProposals > 0 && !showProposals && (
            <Button size="sm" variant="outline" icon="wallet" onClick={selectProposals}>
              {pendingProposals} proposition(s) en attente
            </Button>
          )}
        </div>

        <div className="seg-tabs" role="tablist" aria-label="Filtrer les réservations">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={!showProposals && filter === t.id}
              className={`seg-tab ${!showProposals && filter === t.id ? 'is-active' : ''}`}
              onClick={() => selectTab(t.id)}
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            role="tab"
            aria-selected={showProposals}
            className={`seg-tab ${showProposals ? 'is-active' : ''}`}
            onClick={selectProposals}
          >
            Propositions
          </button>
        </div>

        {loading ? (
          <div className="booking-list">
            <div className="booking-item booking-item--skeleton">
              <div className="skeleton skeleton--line skeleton--wide" />
              <div className="skeleton skeleton--line" />
            </div>
          </div>
        ) : showProposals ? (
          <>
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
                      <span className="booking-meta-item"><Icon name="clock" size={15} className="cc-icon" />{formatDateTimeRange(p.createdAt, 0)}</span>
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
          </>
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="📅"
            title={bookings.length === 0 ? 'Aucune réservation' : 'Aucune réservation dans cette catégorie'}
            text={bookings.length === 0 ? 'Les réservations des élèves apparaîtront ici.' : 'Essayez une autre catégorie.'}
          />
        ) : (
          <div className="booking-list">
            {filtered.map((b) => (
              <BookingCard key={b.id} booking={b} defaultPlatform={platformOf(b)} onUpdated={reload} />
            ))}
          </div>
        )}
      </section>
    </ProfessorShell>
  );
}