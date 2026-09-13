import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessorShell from '../../components/dashboard/ProfessorShell';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import { getNotifications, markAllRead, markNotificationRead } from '../../services/api';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import { formatDateFR } from '../../utils/labels';
import type { NotificationItem } from '../../types';

export default function ProfessorNotifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const unreadBadge = useUnreadCount();

  useEffect(() => {
    let mounted = true;
    getNotifications()
      .then((n) => mounted && setItems(n))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  async function handleMarkAll() {
    setMarking(true);
    try {
      await markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      /* ignore */
    } finally {
      setMarking(false);
    }
  }

  async function handleOpen(n: NotificationItem) {
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      markNotificationRead(n.id).catch(() => {});
    }
    if (n.referenceId != null) {
      navigate(`/professor/reservations/${n.referenceId}`);
    } else {
      navigate('/professor/reservations');
    }
  }

  return (
    <ProfessorShell
      pageTitle="Notifications"
      subtitle={unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : 'Vous êtes à jour'}
      unreadCount={unreadBadge}
    >
      <div className="dash-card">
        <div className="dash-card__title">
          <h2>Vos notifications</h2>
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" icon="check" onClick={handleMarkAll} loading={marking}>Tout marquer comme lu</Button>
          )}
        </div>

        {loading ? (
          <div className="notif-list">
            <div className="notif-item"><div className="skeleton skeleton--line skeleton--wide" /></div>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Aucune notification"
            text="Nouvelles demandes, annulations et confirmations apparaîtront ici."
          />
        ) : (
          <ul className="notif-list">
            {items.map((n) => (
              <li key={n.id} className={`notif-item${n.read ? '' : ' notif-item--unread'}`}>
                <button
                  type="button"
                  className="notif-item__link"
                  onClick={() => handleOpen(n)}
                  aria-label={`Ouvrir la réservation liée à : ${n.title}`}
                >
                  <div className="notif-item__icon">
                    <Icon name={n.type === 'REVIEW' ? 'star' : n.type === 'BOOKING_CANCELLED' ? 'x' : n.type === 'BOOKING' ? 'calendar' : 'bell'} size={18} />
                  </div>
                  <div className="notif-item__body">
                    <p className="notif-item__title">{n.title}</p>
                    <span className="muted">{n.message}</span>
                    {n.referenceId != null && <span className="notif-item__cta">Voir la réservation n°{n.referenceId} →</span>}
                  </div>
                  <span className="notif-item__date muted">{formatDateFR(n.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ProfessorShell>
  );
}