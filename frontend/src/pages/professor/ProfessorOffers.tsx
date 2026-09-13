import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessorShell from '../../components/dashboard/ProfessorShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import { getMyOffers, deleteOffer } from '../../services/api';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import { formatCourseType, formatLocationType } from '../../utils/labels';
import type { Offer } from '../../types';

export default function ProfessorOffers() {
  const navigate = useNavigate();
  const unreadCount = useUnreadCount();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getMyOffers()
      .then((o) => mounted && setOffers(o))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  async function handleDelete(id: number) {
    if (!window.confirm('Supprimer cette offre ?')) return;
    try {
      await deleteOffer(id);
      setOffers(await getMyOffers());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  }

  return (
    <ProfessorShell
      pageTitle="Mes offres"
      subtitle="Vos offres apparaissent sur votre fiche publique et dans les résultats de recherche."
      unreadCount={unreadCount}
      action={<Button icon="plus" to="/professor/offers/new">Créer une offre</Button>}
    >
      <section className="dash-card">
        <div className="dash-card__title"><h2>Mes offres ({offers.length})</h2></div>
        {loading ? (
          <div className="booking-list">
            <div className="booking-item booking-item--skeleton"><div className="skeleton skeleton--line skeleton--wide" /></div>
          </div>
        ) : offers.length === 0 ? (
          <EmptyState
            emoji="📘"
            title="Aucune offre"
            text="Créez votre première offre pour apparaître dans les recherches d'élèves."
            action={<Button icon="plus" to="/professor/offers/new">Créer une offre</Button>}
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
                      {(o.courseType === 'ONLINE' || o.locationType === 'ONLINE') && (
                        <span className="booking-meta-item"><Icon name="video" size={16} />
                          {o.meetingPlatform || 'En ligne'}
                          <span className="muted"> · lien ajouté à la réservation après acceptation</span>
                        </span>
                      )}
                    </span>
                  </div>
                  <Badge variant={o.active ? 'yellow' : 'neutral'}>{o.active ? 'Active' : 'Inactive'}</Badge>
                </div>
                {o.description && <p className="muted">{o.description}</p>}
                <div className="booking-item__actions">
                  <Button variant="outline" size="sm" icon="edit" onClick={() => navigate(`/professor/offers/${o.id}/edit`)}>Modifier</Button>
                  <Button variant="danger-ghost" size="sm" icon="trash" onClick={() => handleDelete(o.id)}>Supprimer</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </ProfessorShell>
  );
}