import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';

export default function Register() {
  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-card__brand">
          <span className="brand">
            <span className="brand__mark"><Icon name="grad-hat" size={18} /></span>
            <span className="brand__name">CoursConnect</span>
          </span>
        </div>
        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-subtitle">Choisissez le profil qui vous correspond</p>

        <div className="register-choices">
          <Link to="/register/student" className="register-choice">
            <div className="register-choice__icon">🎓</div>
            <h3>Élève</h3>
            <p>Trouvez le professeur idéal, réservez vos cours et progressez en toute confiance.</p>
            <span className="btn btn--primary btn--sm">S'inscrire en tant qu'élève</span>
          </Link>

          <Link to="/register/professor" className="register-choice">
            <div className="register-choice__icon">📚</div>
            <h3>Professeur</h3>
            <p>Proposez vos cours, gagnez des élèves et développez votre activité en ligne.</p>
            <span className="btn btn--secondary btn--sm">S'inscrire en tant que professeur</span>
          </Link>
        </div>

        <div className="auth-links">
          <p>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
          <p><Link to="/">← Retour à l'accueil</Link></p>
        </div>
      </div>
    </div>
  );
}