import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { registerStudent, fetchCities } from '../services/api';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Field';
import type { City } from '../types';

export default function RegisterStudent() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [cityId, setCityId] = useState<number | ''>('');
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCities().then(setCities).catch(console.error);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setLoading(true);
    try {
      const response = await registerStudent({
        firstName, lastName, email, password,
        phone: phone || undefined,
        cityId: cityId !== '' ? Number(cityId) : undefined,
      });
      login(response);
      navigate('/student');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="brand">
            <span className="brand__mark">🎓</span>
            <span className="brand__name">Devenir élève</span>
          </span>
        </div>
        <h1 className="auth-title">Inscription Élève</h1>
        <p className="auth-subtitle">Créez votre compte pour trouver un professeur</p>
        {error && <div className="error-banner"><p>{error}</p></div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <Input label="Prénom *" id="firstName" placeholder="Votre prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Input label="Nom *" id="lastName" placeholder="Votre nom" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <Input label="Adresse email *" id="email" type="email" icon="mail" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Mot de passe * (8 caractères min.)" id="password" type="password" icon="shield" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
          <Input label="Téléphone" id="phone" type="tel" icon="phone" placeholder="06 XX XX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Select label="Ville" id="city" value={cityId} onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Sélectionner une ville</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Button type="submit" full size="lg" loading={loading}>
            {loading ? 'Inscription...' : "S'inscrire"}
          </Button>
        </form>
        <div className="auth-links">
          <p>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
          <p><Link to="/register">← Retour au choix du profil</Link></p>
        </div>
      </div>
    </div>
  );
}