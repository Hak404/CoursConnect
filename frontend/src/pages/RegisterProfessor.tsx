import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { registerProfessor, fetchCities, fetchSubjects, fetchLevels } from '../services/api';
import Button from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Field';
import type { City, Subject, Level } from '../types';

export default function RegisterProfessor() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [cityId, setCityId] = useState<number | ''>('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCities().then(setCities).catch(() => {});
    fetchSubjects().then(setSubjects).catch(() => {});
    fetchLevels().then(setLevels).catch(() => {});
  }, []);

  function toggleSubject(id: number) {
    setSelectedSubjects(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleLevel(id: number) {
    setSelectedLevels(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setLoading(true);
    try {
      const response = await registerProfessor({
        firstName, lastName, email, password,
        phone: phone || undefined,
        cityId: cityId !== '' ? Number(cityId) : undefined,
        bio: bio || undefined,
        experienceYears: experienceYears || undefined,
        subjectIds: selectedSubjects.length > 0 ? selectedSubjects : undefined,
        levelIds: selectedLevels.length > 0 ? selectedLevels : undefined,
      });
      login(response);
      navigate('/professor');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-card__brand">
          <span className="brand">
            <span className="brand__mark">📚</span>
            <span className="brand__name">Devenir professeur</span>
          </span>
        </div>
        <h1 className="auth-title">Inscription Professeur</h1>
        <p className="auth-subtitle">Créez votre profil et proposez vos cours</p>
        {error && <div className="error-banner"><p>{error}</p></div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <Input label="Prénom *" id="firstName" placeholder="Votre prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Input label="Nom *" id="lastName" placeholder="Votre nom" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <Input label="Adresse email *" id="email" type="email" icon="mail" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Mot de passe * (8 caractères min.)" id="password" type="password" icon="shield" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
          <div className="form-row">
            <Input label="Téléphone" id="phone" type="tel" icon="phone" placeholder="06 XX XX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Select label="Ville" id="city" value={cityId} onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Sélectionner une ville</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div className="form-row">
            <Input label="Années d'expérience" id="exp" type="number" min={0} value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} />
          </div>
          <Textarea label="Bio" id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Décrivez votre parcours et votre approche pédagogique" />

          <div className="form-group">
            <span className="form-label">Matières enseignées</span>
            <div className="checkbox-group">
              {subjects.map((s) => (
                <label key={s.id} className="chip-checkbox">
                  <input type="checkbox" checked={selectedSubjects.includes(s.id)} onChange={() => toggleSubject(s.id)} />
                  <span className="badge badge--neutral">{s.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <span className="form-label">Niveaux</span>
            <div className="checkbox-group">
              {levels.map((l) => (
                <label key={l.id} className="chip-checkbox">
                  <input type="checkbox" checked={selectedLevels.includes(l.id)} onChange={() => toggleLevel(l.id)} />
                  <span className="badge badge--neutral">{l.name}</span>
                </label>
              ))}
            </div>
          </div>

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