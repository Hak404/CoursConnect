import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyFavoriteProfessors } from '../services/api';
import { useFavorites } from '../utils/favorites';
import type { ProfessorCard } from '../types';
import ProfesseurCard from '../components/ProfesseurCard';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

export default function Favoris() {
  const { isFav } = useFavorites();
  const [professors, setProfessors] = useState<ProfessorCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    getMyFavoriteProfessors()
      .then(setProfessors)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const visible = loading || error ? professors : professors.filter((p) => isFav(p.id));

  return (
    <div className="favoris-page container">
      <header className="page-title">
        <h1>
          Mes favoris
          {!loading && !error && visible.length > 0 && (
            <span className="page-title__count">({visible.length})</span>
          )}
        </h1>
        <p>Retrouvez ici les professeurs que vous avez enregistrés.</p>
      </header>

      {loading && <LoadingState skeleton variant="prof" cards={3} />}

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={load}>Réessayer</Button>
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <EmptyState
          emoji="💙"
          title="Aucun professeur enregistré"
          text="Ajoutez vos professeurs préférés pour les retrouver rapidement."
          action={<Link to="/recherche" className="btn btn--primary">Rechercher un professeur</Link>}
        />
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="prof-grid">
          {visible.map((prof) => (
            <ProfesseurCard key={prof.id} professor={prof} />
          ))}
        </div>
      )}
    </div>
  );
}