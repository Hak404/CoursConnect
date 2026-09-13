import { type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardShell, { type DashNavItem } from './DashboardShell';
import { useAuth } from '../../contexts/AuthContext';

interface ProfessorShellProps {
  pageTitle: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  unreadCount?: number;
  children: ReactNode;
}

const NAV: DashNavItem[] = [
  { id: '/professor', label: 'Tableau de bord', icon: 'home' },
  { id: '/professor/reservations', label: 'Mes réservations', icon: 'calendar' },
  { id: '/professor/offers', label: 'Mes offres', icon: 'book' },
  { id: '/professor/availability', label: 'Mes disponibilités', icon: 'clock' },
  { id: '/professor/notifications', label: 'Notifications', icon: 'bell' },
  { id: '/professor/profile', label: 'Mon profil', icon: 'users' },
];

export default function ProfessorShell({ pageTitle, subtitle, action, unreadCount = 0, children }: ProfessorShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = NAV.map((item) => {
    if (item.id === '/professor/notifications' && unreadCount > 0) return { ...item, badge: unreadCount };
    return item;
  });
  const active =
    navItems.find((n) => pathname === n.id || (n.id !== '/professor' && pathname.startsWith(`${n.id}/`)))?.id || '/professor';

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
      roleLabel="Professeur"
      pageTitle={pageTitle}
      subtitle={subtitle}
      action={action}
    >
      {children}
    </DashboardShell>
  );
}