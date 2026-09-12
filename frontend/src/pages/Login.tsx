import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as apiLogin } from '../services/api';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Field';
import Icon from '../components/ui/Icon';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await apiLogin({ email, password });
      login(response);
      if (response.role === 'STUDENT') navigate('/student');
      else if (response.role === 'PROFESSOR') navigate('/professor');
      else if (response.role === 'ADMIN') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="brand">
            <span className="brand__mark"><Icon name="grad-hat" size={18} /></span>
            <span className="brand__name">CoursConnect</span>
          </span>
        </div>
        <h1 className="auth-title">Connexion</h1>
        <p className="auth-subtitle">Accédez à votre espace CoursConnect</p>

        {error && <div className="error-banner"><p>{error}</p></div>}

        <form onSubmit={handleSubmit}>
          <Input
            label="Adresse email"
            id="email"
            type="email"
            icon="mail"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Mot de passe"
            id="password"
            type="password"
            icon="shield"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" full size="lg" loading={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <div className="auth-links">
          <p>Pas encore de compte ?</p>
          <Link to="/register">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}