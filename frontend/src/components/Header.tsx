import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import Icon from './ui/Icon';

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Élève',
  PROFESSOR: 'Professeur',
  ADMIN: 'Administrateur',
};

function navFor(userRole?: string): { path: string; label: string } | null {
  if (!userRole) return null;
  if (userRole === 'STUDENT') return { path: '/student', label: 'Mon Espace' };
  if (userRole === 'PROFESSOR') return { path: '/professor', label: 'Mon Espace' };
  if (userRole === 'ADMIN') return { path: '/admin', label: 'Administration' };
  return null;
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setUserMenuOpen(false);
    navigate('/');
  }

  const mySpace = navFor(user?.role);

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="brand">
          <span className="brand__mark"><Icon name="grad-hat" size={20} /></span>
          <span className="brand__name">CoursConnect</span>
        </Link>

        <button
          className="header__hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
        >
          <Icon name="menu" size={24} />
        </button>

        <nav className="header__nav header__desktop-actions" aria-label="Navigation principale">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}
          >
            Accueil
          </NavLink>
          <NavLink
            to="/recherche"
            className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}
          >
            Recherche
          </NavLink>
        </nav>

        <div className="header__actions">
          {user ? (
            <div className="user-menu" ref={userMenuRef}>
              <button
                type="button"
                className="user-menu__trigger"
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <Avatar size="sm" name={`${user.firstName} ${user.lastName}`} />
                <span className="user-menu__name" title={`${user.firstName} ${user.lastName}`}>
                  <span className="user-menu__name-text">{user.firstName} {user.lastName}</span>
                  <span className="user-menu__role">{ROLE_LABELS[user.role] || user.role}</span>
                </span>
                <Icon name="chevron-down" size={16} />
              </button>

              {userMenuOpen && (
                <div className="user-menu__dropdown" role="menu">
                  <div className="user-menu__head">
                    <Avatar name={`${user.firstName} ${user.lastName}`} />
                    <div>
                      <p className="user-menu__head-name" title={`${user.firstName} ${user.lastName}`}>{user.firstName} {user.lastName}</p>
                      <p className="user-menu__head-email">{user.email}</p>
                    </div>
                  </div>
                  {mySpace && (
                    <Link to={mySpace.path} className="user-menu__item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <Icon name="home" size={18} />
                      {mySpace.label}
                    </Link>
                  )}
                  <Link to="/recherche" className="user-menu__item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                    <Icon name="search" size={18} />
                    Rechercher un cours
                  </Link>
                  {user.role === 'STUDENT' && (
                    <Link to="/favoris" className="user-menu__item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <Icon name="heart" size={18} />
                      Mes favoris
                    </Link>
                  )}
                  <button type="button" className="user-menu__item user-menu__item--danger" role="menuitem" onClick={handleLogout}>
                    <Icon name="logout" size={18} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost">Connexion</Link>
              <Button to="/register">
                S'inscrire
              </Button>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className={`drawer drawer--open`} role="dialog" aria-modal="true" aria-label="Menu de navigation">
          <div className="drawer__overlay" onClick={() => setMenuOpen(false)} />
          <div className="drawer__panel">
            <div className="drawer__head">
              <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
                <span className="brand__mark"><Icon name="grad-hat" size={18} /></span>
                <span className="brand__name">CoursConnect</span>
              </Link>
              <button type="button" className="drawer__close" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu">
                <Icon name="x" size={22} />
              </button>
            </div>

            <nav className="drawer__nav" aria-label="Navigation mobile">
              <NavLink to="/" end className="header__link" onClick={() => setMenuOpen(false)}>
                <Icon name="home" size={18} /> Accueil
              </NavLink>
              <NavLink to="/recherche" className="header__link" onClick={() => setMenuOpen(false)}>
                <Icon name="search" size={18} /> Recherche
              </NavLink>
              {mySpace && (
                <NavLink to={mySpace.path} className="header__link" onClick={() => setMenuOpen(false)}>
                  <Icon name="users" size={18} /> {mySpace.label}
                </NavLink>
              )}
              {user?.role === 'STUDENT' && (
                <NavLink to="/favoris" className="header__link" onClick={() => setMenuOpen(false)}>
                  <Icon name="heart" size={18} /> Mes favoris
                </NavLink>
              )}
            </nav>

            <div className="drawer__user">
              {user ? (
                <>
                  <div className="user-menu__head">
                    <Avatar name={`${user.firstName} ${user.lastName}`} />
                    <div>
                      <p className="user-menu__head-name">{user.firstName} {user.lastName}</p>
                      <p className="user-menu__head-email">{user.email}</p>
                    </div>
                  </div>
                  <button type="button" className="btn btn--danger-ghost btn--full" onClick={handleLogout}>
                    <Icon name="logout" size={18} /> Déconnexion
                  </button>
                </>
              ) : (
                <div className="drawer__cta">
                  <Button to="/login" variant="secondary" full>Connexion</Button>
                  <Button to="/register" full>S'inscrire</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}