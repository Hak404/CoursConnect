import { Link } from 'react-router-dom';
import Icon from './ui/Icon';

const FOOTER_COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Navigation',
    links: [
      { label: 'Accueil', to: '/' },
      { label: 'Recherche de professeurs', to: '/recherche' },
      { label: 'Devenir professeur', to: '/register/professor' },
    ],
  },
  {
    title: 'Compte',
    links: [
      { label: 'Connexion', to: '/login' },
      { label: 'Créer un compte', to: '/register' },
      { label: 'Espace élève', to: '/student' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="brand">
            <span className="brand__mark"><Icon name="grad-hat" size={18} /></span>
            <span className="brand__name">CoursConnect</span>
          </Link>
          <p className="footer__tagline">
            La plateforme marocaine de mise en relation avec des professeurs particuliers vérifiés, près de chez vous.
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="footer__col-title">{col.title}</h3>
            <nav className="footer__links" aria-label={col.title}>
              {col.links.map((link) => (
                <Link key={link.label} to={link.to}>{link.label}</Link>
              ))}
            </nav>
          </div>
        ))}

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} CoursConnect. Tous droits réservés.</p>
          <p>Fait avec soin au Maroc 🇲🇦</p>
        </div>
      </div>
    </footer>
  );
}