import { useEffect, useState, type ReactNode } from 'react';
import Avatar from '../ui/Avatar';
import Icon, { type IconName } from '../ui/Icon';

export interface DashNavItem {
  id: string;
  label: string;
  icon: IconName;
  badge?: number;
}

interface DashboardShellProps {
  navItems: DashNavItem[];
  active: string;
  onSelect: (id: string) => void;
  onLogout: () => void;
  user: { firstName?: string; lastName?: string } | null;
  roleLabel: string;
  pageTitle: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

export default function DashboardShell({
  navItems,
  active,
  onSelect,
  onLogout,
  user,
  roleLabel,
  pageTitle,
  subtitle,
  action,
  children,
}: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setDrawerOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function select(id: string) {
    setDrawerOpen(false);
    onSelect(id);
  }

  function handleLogout() {
    setDrawerOpen(false);
    onLogout();
  }

  return (
    <div className="dash">
      <aside className={`dash__sidebar ${drawerOpen ? 'is-open' : ''}`} aria-label={`Menu ${roleLabel}`}>
        <div className="dash__side-brand">
          <span className="dash__side-logo"><Icon name="grad-hat" size={20} /></span>
          <span className="dash__side-name">CoursConnect</span>
          <button type="button" className="dash__side-close" onClick={() => setDrawerOpen(false)} aria-label="Fermer le menu">
            <Icon name="x" size={20} />
          </button>
        </div>

        <nav className="dash__nav" aria-label={`Navigation ${roleLabel}`}>
          <p className="dash__nav-group">Menu</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`dash__nav-item ${active === item.id ? 'is-active' : ''}`}
              onClick={() => select(item.id)}
            >
              <span className="dash__nav-ic"><Icon name={item.icon} size={18} /></span>
              <span className="dash__nav-label">{item.label}</span>
              {item.badge != null && item.badge > 0 && <span className="dash__nav-badge">{item.badge}</span>}
            </button>
          ))}
          <div className="dash__nav-divider" />
          <button type="button" className="dash__nav-item dash__nav-item--danger" onClick={handleLogout}>
            <span className="dash__nav-ic"><Icon name="logout" size={18} /></span>
            <span className="dash__nav-label">Déconnexion</span>
          </button>
        </nav>

        <div className="dash__side-user">
          <Avatar name={fullName} />
          <div className="dash__side-user-meta">
            <p className="dash__side-user-name" title={fullName || 'Utilisateur'}>{fullName || 'Utilisateur'}</p>
            <p className="dash__side-user-role">{roleLabel}</p>
          </div>
        </div>
      </aside>

      <div className={`dash__overlay ${drawerOpen ? 'is-open' : ''}`} onClick={() => setDrawerOpen(false)} aria-hidden="true" />

      <div className="dash__main">
        <header className="dash__header">
          <div className="dash__header-left">
            <button type="button" className="dash__burger" onClick={() => setDrawerOpen(true)} aria-label="Ouvrir le menu" aria-expanded={drawerOpen}>
              <Icon name="menu" size={22} />
            </button>
            <div className="dash__header-titles">
              <h1 className="dash__header-title">{pageTitle}</h1>
              {subtitle && <p className="dash__header-subtitle">{subtitle}</p>}
            </div>
          </div>
          <div className="dash__header-right">
            {action && <div className="dash__header-action">{action}</div>}
            <div className="dash__header-user">
              <Avatar size="sm" name={fullName} />
              <span className="dash__header-user-name" title={fullName || 'Utilisateur'}>{fullName || 'Utilisateur'}</span>
            </div>
          </div>
        </header>

        <div className="dash__content">
          {children}
        </div>
      </div>
    </div>
  );
}