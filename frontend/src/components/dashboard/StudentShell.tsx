import { type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardShell, { type DashNavItem } from './DashboardShell';
import { useAuth } from '../../contexts/AuthContext';

interface StudentShellProps {
  pageTitle: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  pendingCount?: number;
  children: ReactNode;
}

const NAV: DashNavItem[] = [
  { id: '/student', label: 'Tableau de bord', icon: 'home' },
  { id: '/recherche', label: 'Rechercher un professeur', icon: 'search' },
  { id: '/student/reservations', label: 'Mes Réservations', icon: 'calendar' },
  { id: '/favoris', label: 'Favoris', icon: 'heart' },
  { id: '/student/notifications', label: 'Notifications', icon: 'bell' },
  { id: '/student/profile', label: 'Mon Profil', icon: 'users' },
];

export default function StudentShell({ pageTitle, subtitle, action, pendingCount = 0, children }: StudentShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = NAV.map((item) =>
    item.id === '/student/reservations' && pendingCount > 0 ? { ...item, badge: pendingCount } : item,
  );
  const active =
    navItems.find((n) => pathname === n.id || (n.id !== '/favoris' && pathname.startsWith(`${n.id}/`)))?.id || '/student';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <DashboardShell
      navItems={navItems}
      active={active}
      onSelect={(id) => navigate(id)}
      onLogout={handleLogout}
      user={user}
      roleLabel="Élève"
      pageTitle={pageTitle}
      subtitle={subtitle}
      action={action}
    >
      {children}
    </DashboardShell>
  );
}