import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProfessors, fetchCities, fetchSubjects, fetchLevels } from '../services/api';
import ProfesseurCard from '../components/ProfesseurCard';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';
import type { City, Subject, Level, ProfessorCard as ProfessorCardType, PagedResult, CourseType } from '../types';

const COURSE_TYPE_LABELS: Record<CourseType, string> = {
  INDIVIDUAL: 'Individuel',
  GROUP: 'Groupe',
  ONLINE: 'En ligne',
};

const SORT_LABELS: Record<string, string> = {
  rating: 'Mieux notés',
  priceAsc: 'Prix croissant',
  priceDesc: 'Prix décroissant',
  reviews: "Nombre d'avis",
  newest: 'Plus récents',
};

type FilterName = 'cityId' | 'subjectId' | 'levelId' | 'courseType' | 'minPrice' | 'maxPrice' | 'minRating';

const SEARCH_PLACEHOLDER = 'Rechercher un professeur, une matière ou une ville...';

export default function Recherche() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [cityId, setCityId] = useState<number | ''>(
    searchParams.get('cityId') ? Number(searchParams.get('cityId')) : ''
  );
  const [subjectId, setSubjectId] = useState<number | ''>(
    searchParams.get('subjectId') ? Number(searchParams.get('subjectId')) : ''
  );
  const [levelId, setLevelId] = useState<number | ''>(
    searchParams.get('levelId') ? Number(searchParams.get('levelId')) : ''
  );
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minRating, setMinRating] = useState<number | ''>('');
  const [courseType, setCourseType] = useState<CourseType | ''>('');
  const [sortBy, setSortBy] = useState('rating');
  const [currentPage, setCurrentPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterPanelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!filtersOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFiltersOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [filtersOpen]);

  const advancedActive = courseType !== '' || minPrice !== '' || maxPrice !== '' || minRating !== '';
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    if (advancedActive) setAdvancedOpen(true);
  }, [advancedActive]);

  const [results, setResults] = useState<PagedResult<ProfessorCardType> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  useEffect(() => {
    fetchCities().then(setCities).catch(console.error);
    fetchSubjects().then(setSubjects).catch(console.error);
    fetchLevels().then(setLevels).catch(console.error);
  }, []);

  useEffect(() => {
    const nameFromUrl = searchParams.get('city');
    if (nameFromUrl && cityId === '' && cities.length > 0) {
      const match = cities.find((c) => c.name.toLowerCase() === nameFromUrl.toLowerCase());
      if (match) setCityId(match.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities, searchParams]);

  const loadProfessors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchProfessors({
        search: search ? search : undefined,
        cityId: cityId !== '' ? Number(cityId) : undefined,
        subjectId: subjectId !== '' ? Number(subjectId) : undefined,
        levelId: levelId !== '' ? Number(levelId) : undefined,
        minPrice: minPrice !== '' ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
        minRating: minRating !== '' ? Number(minRating) : undefined,
        courseType: courseType !== '' ? courseType : undefined,
        sortBy: (sortBy || 'rating') as 'rating' | 'priceAsc' | 'priceDesc' | 'reviews' | 'newest',
        page: currentPage,
        size: 12,
      });
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [cityId, subjectId, levelId, minPrice, maxPrice, minRating, courseType, sortBy, search, currentPage]);

  useEffect(() => {
    loadProfessors();
  }, [loadProfessors]);

  function updateFilter(name: FilterName, value: number | string | '' | CourseType) {
    setCurrentPage(0);
    if (name === 'cityId') setCityId(value as number | '');
    else if (name === 'subjectId') setSubjectId(value as number | '');
    else if (name === 'levelId') setLevelId(value as number | '');
    else if (name === 'courseType') setCourseType(value as CourseType | '');
    else if (name === 'minPrice') setMinPrice(value as number | '');
    else if (name === 'maxPrice') setMaxPrice(value as number | '');
    else if (name === 'minRating') setMinRating(value as number | '');
  }

  function clearAll() {
    setCurrentPage(0);
    setSearchInput('');
    setSearch('');
    setCityId('');
    setSubjectId('');
    setLevelId('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setCourseType('');
    setSortBy('rating');
    setSearchParams({});
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setCurrentPage(0);
  }

  function clearSearch() {
    setSearchInput('');
    setSearch('');
    setCurrentPage(0);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const chips = useMemo(() => {
    const list: { key: string; label: string; clear: () => void }[] = [];
    if (search) {
      list.push({ key: 'search', label: `Recherche : « ${search} »`, clear: clearSearch });
    }
    const city = cities.find((c) => c.id === cityId);
    if (city) list.push({ key: 'city', label: city.name, clear: () => updateFilter('cityId', '') });
    const subject = subjects.find((s) => s.id === subjectId);
    if (subject) list.push({ key: 'subject', label: subject.name, clear: () => updateFilter('subjectId', '') });
    const level = levels.find((l) => l.id === levelId);
    if (level) list.push({ key: 'level', label: level.name, clear: () => updateFilter('levelId', '') });
    if (courseType) list.push({ key: 'type', label: COURSE_TYPE_LABELS[courseType], clear: () => updateFilter('courseType', '') });
    if (minPrice !== '' || maxPrice !== '') {
      const label = `Tarif : ${minPrice || '0'}–${maxPrice || '∞'} DH`;
      list.push({
        key: 'price',
        label,
        clear: () => { updateFilter('minPrice', ''); updateFilter('maxPrice', ''); },
      });
    }
    if (minRating !== '') {
      list.push({ key: 'rating', label: `Note : ${minRating} et +`, clear: () => updateFilter('minRating', '') });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, cityId, subjectId, levelId, courseType, minPrice, maxPrice, minRating, cities, subjects, levels]);

  return (
    <div className="recherche-page container">
      <div className={`filter-drawer-overlay ${filtersOpen ? 'is-open' : ''}`} onClick={() => setFiltersOpen(false)} />

      <aside ref={filterPanelRef} className={`filter-panel${filtersOpen ? ' is-open' : ''}`}>
        <div className="filter-panel__head">
          <h2 className="filter-panel__title">
            <Icon name="settings" size={18} className="cc-icon" /> Filtres
          </h2>
          <button type="button" className="filter-panel__toggle" onClick={() => setFiltersOpen(false)} aria-label="Fermer les filtres">
            <Icon name="x" size={18} />
          </button>
          <button type="button" className="filter-panel__clear" onClick={clearAll}>
            Tout effacer
          </button>
        </div>

        <div className="filter-panel__content">
          <div className="filter-group">
            <span className="filter-group__label">
              Ville <Icon name="map-pin" size={14} className="cc-icon" />
            </span>
            <select
              className="form-select"
              value={cityId}
              onChange={(e) => updateFilter('cityId', e.target.value ? Number(e.target.value) : '')}
              aria-label="Ville"
            >
              <option value="">Toutes les villes</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-group__label">
              Matière <Icon name="book" size={14} className="cc-icon" />
            </span>
            <select
              className="form-select"
              value={subjectId}
              onChange={(e) => updateFilter('subjectId', e.target.value ? Number(e.target.value) : '')}
              aria-label="Matière"
            >
              <option value="">Toutes les matières</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-group__label">
              Niveau <Icon name="grad-hat" size={14} className="cc-icon" />
            </span>
            <select
              className="form-select"
              value={levelId}
              onChange={(e) => updateFilter('levelId', e.target.value ? Number(e.target.value) : '')}
              aria-label="Niveau"
            >
              <option value="">Tous les niveaux</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className={`filter-panel__advanced-toggle${advancedOpen ? ' is-open' : ''}`}
            aria-expanded={advancedOpen}
            onClick={() => setAdvancedOpen((o) => !o)}
          >
            <span className="filter-group__label" style={{ margin: 0 }}>
              Filtres avancés
            </span>
            <Icon name="chevron-down" size={15} className="cc-icon" />
          </button>

          <div className="filter-panel__advanced" hidden={!advancedOpen}>
            <div className="filter-group">
              <span className="filter-group__label">
                Type de cours <Icon name="video" size={14} className="cc-icon" />
              </span>
              <select
                className="form-select"
                value={courseType}
                onChange={(e) => updateFilter('courseType', e.target.value as CourseType | '')}
                aria-label="Type de cours"
              >
                <option value="">Tous les types</option>
                {(Object.keys(COURSE_TYPE_LABELS) as CourseType[]).map((t) => (
                  <option key={t} value={t}>{COURSE_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-group__label">
                Tarif (DH/heure) <Icon name="wallet" size={14} className="cc-icon" />
              </span>
              <div className="price-range-inputs">
                <input
                  type="number"
                  className="form-input"
                  placeholder="Min"
                  min={0}
                  value={minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : '')}
                  aria-label="Prix minimum"
                />
                <span className="range-separator">–</span>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Max"
                  min={0}
                  value={maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : '')}
                  aria-label="Prix maximum"
                />
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-group__label">
                Note minimum <Icon name="star" size={14} className="cc-icon" />
              </span>
              <div className="rating-filter">
                {[4, 3, 2].map((r) => (
                  <label key={r} className={`rating-option ${minRating === r ? 'is-active' : ''}`}>
                    <input
                      type="radio"
                      name="minRating"
                      checked={minRating === r}
                      onChange={() => updateFilter('minRating', r)}
                    />
                    <span className="stars" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n} style={{ color: n <= r ? 'var(--star)' : 'var(--star-empty)', display: 'inline-flex' }}>
                          <Icon name="star" size={13} className="cc-icon" />
                        </span>
                      ))}
                    </span>
                    <span>{r} et plus</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-group__label">
              Trier par <Icon name="chevron-down" size={14} className="cc-icon" />
            </span>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(0); }}
              aria-label="Trier par"
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {chips.length > 0 && (
            <Button variant="secondary" full onClick={clearAll}>Réinitialiser les filtres</Button>
          )}
        </div>
      </aside>

      <section className="results">
        <form className="results__search" role="search" onSubmit={handleSearchSubmit}>
          <Icon name="search" size={20} className="cc-icon results__search-icon" />
          <input
            type="search"
            className="results__search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={SEARCH_PLACEHOLDER}
            aria-label={SEARCH_PLACEHOLDER}
          />
          {searchInput && (
            <button
              type="button"
              className="results__search-clear"
              onClick={clearSearch}
              aria-label="Effacer la recherche"
            >
              <Icon name="x" size={16} className="cc-icon" />
            </button>
          )}
          <Button type="submit" variant="accent">Rechercher</Button>
        </form>

        <div className="results__toolbar">
          <div className="results__toolbar-left">
            <button type="button" className="filter-drawer-trigger" onClick={() => setFiltersOpen(true)}>
              <Icon name="settings" size={16} /> Filtres
              {chips.length > 0 && <span className="filter-drawer-trigger__badge">{chips.length}</span>}
            </button>
            <p className="results__count">
              <strong>{results ? results.totalElements : '…'}</strong>
              {results && results.totalElements !== 1 ? ' professeurs trouvés' : ' professeur trouvé'}
            </p>
          </div>
          <div className="results__sort">
            <span style={{ display: 'inline-flex', color: 'var(--text-muted)' }}>
              <Icon name="settings" size={17} className="cc-icon" />
            </span>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(0); }}
              aria-label="Trier les résultats"
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="filter-chips">
            {chips.map((chip) => (
              <span className="filter-chip" key={chip.key}>
                {chip.label}
                <button type="button" onClick={chip.clear} aria-label={`Retirer le filtre ${chip.label}`}>
                  <Icon name="x" size={13} className="cc-icon" />
                </button>
              </span>
            ))}
          </div>
        )}

        {loading && <LoadingState skeleton variant="prof" cards={3} />}

        {error && (
          <div className="error-banner">
            <Icon name="info" size={20} className="cc-icon" />
            <p>{error}</p>
            <Button variant="secondary" size="sm" onClick={loadProfessors}>Réessayer</Button>
          </div>
        )}

        {!loading && !error && results && (
          <>
            {results.contenu.length === 0 ? (
              <EmptyState
                emoji="🔎"
                title={search || chips.length > 0 ? 'Aucun professeur ne correspond à votre recherche' : 'Aucun professeur trouvé'}
                text="Essayez d'élargir votre recherche : supprimez quelques filtres, changez la ville ou la matière."
                action={chips.length > 0 ? (
                  <Button variant="secondary" onClick={clearAll}>Effacer les filtres</Button>
                ) : undefined}
              />
            ) : (
              <div className="prof-grid">
                {results.contenu.map((prof) => (
                  <ProfesseurCard key={prof.id} professor={prof} />
                ))}
              </div>
            )}

            {results.totalPages > 1 && (
              <nav className="pagination" aria-label="Pagination">
                <button
                  type="button"
                  className="pagination__btn"
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(currentPage - 1)}
                  aria-label="Page précédente"
                >
                  <Icon name="chevron-left" size={18} />
                </button>
                {Array.from({ length: results.totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`pagination__btn ${i === currentPage ? 'is-active' : ''}`}
                    onClick={() => handlePageChange(i)}
                    aria-label={`Page ${i + 1}`}
                    aria-current={i === currentPage ? 'page' : undefined}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  className="pagination__btn"
                  disabled={currentPage >= results.totalPages - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
                  aria-label="Page suivante"
                >
                  <Icon name="chevron-right" size={18} />
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}