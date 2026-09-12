import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAdminStats, getUsers, getAdminProfessors, getAdminBookings,
  getAdminReviews, toggleUserStatus, verifyProfessor, deleteReview,
} from '../../services/api';
import DashboardShell from '../../components/dashboard/DashboardShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import LoadingState from '../../components/ui/LoadingState';
import RatingStarsDisplay from '../../components/ui/RatingStarsDisplay';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import type { User, ProfessorProfile, ProfileBooking, Review, AdminStats } from '../../types';

type Tab = 'stats' | 'users' | 'professors' | 'bookings' | 'reviews' | 'settings';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [professors, setProfessors] = useState<ProfessorProfile[]>([]);
  const [bookings, setBookings] = useState<ProfileBooking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  function loadData() {
    setLoading(true);
    if (tab === 'stats') {
      getAdminStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
    } else if (tab === 'users') {
      getUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false));
    } else if (tab === 'professors') {
      getAdminProfessors().then(setProfessors).catch(() => {}).finally(() => setLoading(false));
    } else if (tab === 'bookings') {
      getAdminBookings().then(setBookings).catch(() => {}).finally(() => setLoading(false));
    } else if (tab === 'reviews') {
      getAdminReviews().then(setReviews).catch(() => {}).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  async function handleToggleStatus(userId: number, currentEnabled: boolean) {
    try {
      const updated = await toggleUserStatus(userId, !currentEnabled);
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    } catch {
      alert('Erreur lors de la mise à jour');
    }
  }

  async function handleVerify(profId: number) {
    try {
      await verifyProfessor(profId);
      setProfessors(prev => prev.map(p => p.id === profId ? { ...p, verified: true } : p));
    } catch {
      alert('Erreur lors de la vérification');
    }
  }

  async function handleDeleteReview(reviewId: number) {
    if (!window.confirm('Supprimer cet avis ?')) return;
    try {
      await deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch {
      alert('Erreur lors de la suppression');
    }
  }

  const navItems = [
    { id: 'stats' as Tab, label: 'Statistiques', icon: 'trend-up' as const },
    { id: 'users' as Tab, label: 'Utilisateurs', icon: 'users' as const },
    { id: 'professors' as Tab, label: 'Professeurs', icon: 'badge-check' as const },
    { id: 'bookings' as Tab, label: 'Réservations', icon: 'calendar' as const },
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
      roleLabel="Administrateur"
      pageTitle="Administration"
      subtitle={`Bonjour ${user?.firstName || ''}, voici l'état de la plateforme.`}
    >
      {tab === 'stats' && stats && (
        <div className="stats-grid">
          <StatCard icon="users" label="Utilisateurs" value={stats.totalUsers} tone="primary" />
          <StatCard icon="grad-hat" label="Élèves" value={stats.totalStudents} tone="info" />
          <StatCard icon="badge-check" label="Professeurs" value={stats.totalProfessors} tone="green" />
          <StatCard icon="check-circle" label="Profs vérifiés" value={stats.totalVerified} tone="yellow" />
          <StatCard icon="book" label="Offres" value={stats.totalOffers} tone="info" />
          <StatCard icon="calendar" label="Réservations" value={stats.totalBookings} tone="primary" />
          <StatCard icon="clock" label="Réservations en attente" value={stats.totalPendingBookings} tone="yellow" />
          <StatCard icon="star" label="Avis" value={stats.totalReviews} tone="green" />
        </div>
      )}

      {tab === 'users' && (
        <section className="dash-card">
          <div className="dash-card__title"><h2>Utilisateurs ({users.length})</h2></div>
          {loading ? (
            <LoadingState skeleton cards={6} />
          ) : users.length === 0 ? (
            <EmptyState emoji="👥" title="Aucun utilisateur" />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>État</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.firstName} {u.lastName}</td>
                      <td>{u.email}</td>
                      <td><StatusBadge status={u.role} kind="generic" /></td>
                      <td>
                        <Badge variant={u.enabled ? 'green' : 'neutral'}>{u.enabled ? 'Actif' : 'Inactif'}</Badge>
                      </td>
                      <td>
                        {u.role === 'ADMIN' ? (
                          <span className="muted">—</span>
                        ) : (
                          <Button
                            size="sm"
                            variant={u.enabled ? 'danger' : 'outline'}
                            icon={u.enabled ? 'x' : 'check'}
                            onClick={() => handleToggleStatus(u.id, u.enabled)}
                          >
                            {u.enabled ? 'Désactiver' : 'Activer'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'professors' && (
        <section className="dash-card">
          <div className="dash-card__title"><h2>Professeurs ({professors.length})</h2></div>
          {loading ? (
            <LoadingState skeleton cards={6} />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Ville</th>
                    <th>Matières</th>
                    <th>Vérifié</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {professors.map(p => (
                    <tr key={p.id}>
                      <td>{p.firstName} {p.lastName}</td>
                      <td>{p.email}</td>
                      <td>{p.cityName || '-'}</td>
                      <td>{p.subjects.map(s => s.name).join(', ') || '-'}</td>
                      <td>
                        <Badge variant={p.verified ? 'green' : 'yellow'}>{p.verified ? 'Vérifié' : 'Non vérifié'}</Badge>
                      </td>
                      <td>
                        {!p.verified && (
                          <Button size="sm" icon="check-circle" onClick={() => handleVerify(p.id)}>Vérifier</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'bookings' && (
        <section className="dash-card">
          <div className="dash-card__title"><h2>Réservations ({bookings.length})</h2></div>
          {loading ? (
            <LoadingState skeleton cards={6} />
          ) : bookings.length === 0 ? (
            <EmptyState emoji="📅" title="Aucune réservation" />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Offre</th>
                    <th>Élève</th>
                    <th>Professeur</th>
                    <th>Date</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>{b.offerTitle}</td>
                      <td>{b.studentName}</td>
                      <td>{b.professorName}</td>
                      <td>{new Date(b.scheduledAt).toLocaleString('fr-FR')}</td>
                      <td><StatusBadge status={b.status} kind="booking" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'reviews' && (
        <section className="dash-card">
          <div className="dash-card__title"><h2>Avis ({reviews.length})</h2></div>
          {loading ? (
            <LoadingState skeleton cards={4} />
          ) : reviews.length === 0 ? (
            <EmptyState emoji="⭐" title="Aucun avis" />
          ) : (
            <div className="review-list">
              {reviews.map(r => (
                <div key={r.id} className="review-item">
                  <div className="review-item__head">
                    <strong>{r.studentName}</strong>
                    <RatingStarsDisplay value={r.rating} size={1} showValue />
                  </div>
                  {r.comment && <p>{r.comment}</p>}
                  <div className="review-item__foot">
                    <span className="review-item__date">
                      <Icon name="calendar" size={14} className="cc-icon" />
                      {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    <Button variant="danger-ghost" size="sm" icon="trash" onClick={() => handleDeleteReview(r.id)}>
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'settings' && (
        <section className="dash-card">
          <div className="dash-card__title"><h2>Paramètres Admin</h2></div>
          <div className="form-row">
            <div className="form-group">
              <span className="form-label">Connecté en tant que</span>
              <p>{user?.firstName} {user?.lastName}</p>
            </div>
            <div className="form-group">
              <span className="form-label">Email</span>
              <p>{user?.email}</p>
            </div>
          </div>
        </section>
      )}
    </DashboardShell>
  );
}