import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchHomePage } from '../services/api';
import ProfesseurCard from '../components/ProfesseurCard';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import LoadingState from '../components/ui/LoadingState';
import type { HomePage } from '../types';

const TRUST_ITEMS = [
  { icon: 'badge-check' as const, label: 'Professeurs vérifiés' },
  { icon: 'compass' as const, label: 'Partout au Maroc' },
  { icon: 'calendar' as const, label: 'Réservation en ligne' },
];

const STEPS = [
  { icon: '🔍', title: 'Cherchez', desc: 'Filtrez par matière, niveau, ville et tarif pour trouver le professeur idéal.' },
  { icon: '📅', title: 'Réservez', desc: 'Choisissez un créneau dans les disponibilités du professeur et réservez en ligne.' },
  { icon: '🎓', title: 'Apprenez', desc: 'Démarrez vos cours particuliers, à domicile ou en ligne, en toute sérénité.' },
  { icon: '⭐', title: 'Évaluez', desc: 'Notez votre professeur après chaque séance pour aider toute la communauté.' },
];

export default function Accueil() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [subjectId, setSubjectId] = useState<number | ''>('');
  const [levelId, setLevelId] = useState<number | ''>('');
  const [home, setHome] = useState<HomePage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomePage()
      .then(setHome)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.set('city', city.trim());
    if (subjectId !== '') params.set('subjectId', String(subjectId));
    if (levelId !== '') params.set('levelId', String(levelId));
    navigate(`/recherche?${params.toString()}`);
  }

  return (
    <div>
      <section className="hero">
        <div className="container">
          <div className="hero__content">
            <span className="hero__eyebrow">
              <Icon name="grad-hat" size={16} />
              Cours particuliers au Maroc
            </span>
            <h1 className="hero__title">
              Trouvez le professeur <span className="accent">idéal</span> près de chez vous
            </h1>
            <p className="hero__subtitle">
              Des professeurs particuliers vérifiés pour tous les niveaux : primaire, collège, lycée et supérieur.
            </p>

            <form className="search-bar hero__search" onSubmit={handleSearch} role="search">
              <div className="search-field input-icon">
                <Icon name="map-pin" size={18} className="cc-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ville (ex : Casablanca)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  aria-label="Ville"
                />
              </div>
              <div className="search-field">
                <select
                  className="form-select"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value ? Number(e.target.value) : '')}
                  aria-label="Matière"
                >
                  <option value="">Toutes les matières</option>
                  {(home?.popularSubjects || []).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="search-field">
                <select
                  className="form-select"
                  value={levelId}
                  onChange={(e) => setLevelId(e.target.value ? Number(e.target.value) : '')}
                  aria-label="Niveau"
                >
                  <option value="">Tous les niveaux</option>
                  {(home?.levels || []).map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" size="lg" icon="search">
                Rechercher
              </Button>
            </form>

            <div className="hero__trust">
              {TRUST_ITEMS.map((item) => (
                <span className="trust-item" key={item.label}>
                  <Icon name={item.icon} size={17} className="cc-icon" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Professeurs populaires</h2>
              <p className="section-header__subtitle">Les professeurs les mieux notés par les élèves</p>
            </div>
            <Link to="/recherche">Voir tous les professeurs →</Link>
          </div>

          {loading ? (
            <LoadingState skeleton cards={3} />
          ) : home && home.topProfessors.length > 0 ? (
            <div className="prof-grid">
              {home.topProfessors.map((prof) => (
                <ProfesseurCard key={prof.id} professor={prof} />
              ))}
            </div>
          ) : (
            <div className="page-center">
              <p className="muted">Aucun professeur pour le moment. Revenez bientôt !</p>
            </div>
          )}
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-header section-header--center">
            <div>
              <h2>Comment ça marche ?</h2>
              <p className="section-header__subtitle">Trouvez votre professeur en 4 étapes simples</p>
            </div>
          </div>
          <div className="steps-grid">
            {STEPS.map((step, index) => (
              <div key={step.title} className="step-card">
                <span className="step-card__num">{index + 1}</span>
                <div className="step-card__icon">
                  <span style={{ fontSize: '1.7rem' }}>{step.icon}</span>
                </div>
                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}