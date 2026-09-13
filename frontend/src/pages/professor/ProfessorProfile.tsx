import { useState, useEffect, useRef } from 'react';
import ProfessorShell from '../../components/dashboard/ProfessorShell';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import RatingStarsDisplay from '../../components/ui/RatingStarsDisplay';
import { Input, Select, Textarea } from '../../components/ui/Field';
import {
  getMyProfessorProfile, updateMyProfessorProfile, fetchCities, fetchSubjects, fetchLevels,
  getMyReviews, uploadProfessorPhoto, deleteProfessorPhoto,
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import { formatDateFR } from '../../utils/labels';
import type { ProfessorProfile, City, Subject, Level, Review } from '../../types';

export default function ProfessorProfile() {
  const { user } = useAuth();
  const unreadCount = useUnreadCount();

  const [profile, setProfile] = useState<ProfessorProfile | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [allLevels, setAllLevels] = useState<Level[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [phone, setPhone] = useState('');
  const [cityId, setCityId] = useState<number | ''>('');
  const [bio, setBio] = useState('');
  const [teachingAddress, setTeachingAddress] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoMessage, setPhotoMessage] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    fetchCities().then(setCities).catch(() => {});
    fetchSubjects().then(setAllSubjects).catch(() => {});
    fetchLevels().then(setAllLevels).catch(() => {});
    getMyProfessorProfile()
      .then((p) => {
        if (!mounted) return;
        setProfile(p);
        setPhotoUrl(p.profilePhoto || null);
        setPhone(p.phone || '');
        setCityId(p.cityId || '');
        setBio(p.bio || '');
        setTeachingAddress(p.teachingAddress || '');
        setExperienceYears(p.experienceYears || 0);
        setSelectedSubjects(p.subjects.map((s) => s.id));
        setSelectedLevels(p.levels.map((l) => l.id));
      })
      .catch(() => {});
    getMyReviews().then((r) => mounted && setReviews(r)).catch(() => {});
    return () => { mounted = false; };
  }, []);

  function toggleSubject(id: number) {
    setSelectedSubjects((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function toggleLevel(id: number) {
    setSelectedLevels((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoMessage('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|jpg)$/i.test(file.type)) {
      setPhotoMessage('Erreur : seuls les formats JPG, PNG et WEBP sont acceptés.');
      if (photoInputRef.current) photoInputRef.current.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoMessage('Erreur : la photo ne doit pas dépasser 5 Mo.');
      if (photoInputRef.current) photoInputRef.current.value = '';
      return;
    }
    const local = URL.createObjectURL(file);
    setPhotoPreview(local);
    setPhotoSaving(true);
    try {
      const updated = await uploadProfessorPhoto(file);
      setPhotoUrl(updated.profilePhoto || null);
      setProfile(updated);
      setPhotoMessage('Photo de profil mise à jour avec succès.');
    } catch (err) {
      setPhotoPreview(null);
      setPhotoMessage(err instanceof Error ? `Erreur : ${err.message}` : 'Erreur lors de l\'upload.');
    } finally {
      URL.revokeObjectURL(local);
      setPhotoSaving(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  }

  async function handlePhotoDelete() {
    setPhotoMessage('');
    setPhotoSaving(true);
    try {
      const updated = await deleteProfessorPhoto();
      setPhotoUrl(null);
      setPhotoPreview(null);
      setProfile(updated);
      setPhotoMessage('Photo de profil supprimée.');
    } catch (err) {
      setPhotoMessage(err instanceof Error ? `Erreur : ${err.message}` : 'Erreur lors de la suppression.');
    } finally {
      setPhotoSaving(false);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    setMessage('');
    try {
      const updated = await updateMyProfessorProfile({
        phone,
        cityId: cityId !== '' ? Number(cityId) : undefined,
        bio,
        teachingAddress: teachingAddress.trim() || undefined,
        experienceYears,
        subjectIds: selectedSubjects.length > 0 ? selectedSubjects : undefined,
        levelIds: selectedLevels.length > 0 ? selectedLevels : undefined,
      });
      setProfile(updated);
      setMessage('Profil mis à jour avec succès');
    } catch (err) {
      setMessage(err instanceof Error ? `Erreur : ${err.message}` : 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  }

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : user?.firstName || '';

  return (
    <ProfessorShell
      pageTitle="Mon profil"
      subtitle="Coordonnées, photo, matières, avis reçus et informations du compte."
      unreadCount={unreadCount}
    >
      {profile && (
        <section className="dash-card">
          <div className="dash-card__title"><h2>Mon profil</h2></div>
          <div className="photo-block">
            <div className="photo-block__avatar">
              <Avatar name={fullName} src={photoPreview ?? photoUrl ?? undefined} size="xl" />
            </div>
            <div className="photo-block__actions">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button size="sm" icon="camera" onClick={() => photoInputRef.current?.click()} loading={photoSaving}>
                  {photoUrl || photoPreview ? 'Changer la photo' : 'Ajouter une photo'}
                </Button>
                {(photoUrl || photoPreview) && !photoSaving && (
                  <Button size="sm" variant="ghost" icon="trash" onClick={handlePhotoDelete}>Supprimer</Button>
                )}
              </div>
              <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
                JPG, PNG ou WEBP · 5 Mo maximum. Affichée sur votre fiche et vos cartes.
              </p>
              {photoMessage && <span className={`photo-block__msg ${photoMessage.startsWith('Erreur') ? 'is-error' : ''}`}>{photoMessage}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <span className="form-label">Nom complet (public)</span>
              <p>{fullName}</p>
            </div>
            <div className="form-group">
              <span className="form-label">Email</span>
              <p>{profile.email}</p>
            </div>
          </div>
          <div className="form-row">
            <Input label="Téléphone" id="pp-phone" type="tel" icon="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Select label="Ville" id="pp-city" value={cityId} onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">—</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <Input label="Années d'expérience" id="pp-exp" type="number" min={0} value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} />
          <Textarea label="Bio" id="pp-bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
          <Input
            label="Adresse d'enseignement (pour les cours chez vous)"
            id="pp-addr"
            value={teachingAddress}
            onChange={(e) => setTeachingAddress(e.target.value)}
            placeholder="Rue, immeuble, ville, ..."
            maxLength={500}
          />
          <p className="muted" style={{ marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
            Communiquée uniquement aux élèves dont la réservation est confirmée.
          </p>
          <div className="form-group">
            <span className="form-label">Matières</span>
            <div className="checkbox-group">
              {allSubjects.map((s) => (
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
              {allLevels.map((l) => (
                <label key={l.id} className="chip-checkbox">
                  <input type="checkbox" checked={selectedLevels.includes(l.id)} onChange={() => toggleLevel(l.id)} />
                  <span className="badge badge--neutral">{l.name}</span>
                </label>
              ))}
            </div>
          </div>
          {message && <div className={message.includes('Erreur') ? 'error-banner' : 'success-banner'}><p>{message}</p></div>}
          <Button onClick={handleSaveProfile} loading={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer le profil'}
          </Button>
        </section>
      )}

      <section className="dash-card">
        <div className="dash-card__title"><h2>Avis reçus ({reviews.length})</h2></div>
        {reviews.length === 0 ? (
          <EmptyState emoji="⭐" title="Aucun avis" text="Les avis des élèves apparaîtront ici après leurs cours terminés." />
        ) : (
          <div className="review-list">
            {reviews.map((r) => (
              <div key={r.id} className="review-item">
                <div className="review-item__head">
                  <strong>{r.studentName}</strong>
                  <div className="review-item__stars">
                    <RatingStarsDisplay value={r.rating} size={15} showValue />
                  </div>
                  <time className="review-item__date" dateTime={r.createdAt} style={{ marginLeft: 'auto' }}>
                    {formatDateFR(r.createdAt)}
                  </time>
                </div>
                {r.comment ? <p>{r.comment}</p> : <span className="muted review-item__no-comment">Avis sans commentaire.</span>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dash-card">
        <div className="dash-card__title"><h2>Paramètres</h2></div>
        <div className="form-row">
          <div className="form-group">
            <span className="form-label">Email</span>
            <p>{user?.email}</p>
          </div>
          <div className="form-group">
            <span className="form-label">Rôle</span>
            <p>Professeur</p>
          </div>
          <div className="form-group">
            <span className="form-label">Profil vérifié</span>
            <p>{profile?.verified ? 'Oui' : 'Non'}</p>
          </div>
        </div>
        {profile && (
          <Button to={`/professeur/${profile.id}`} variant="outline" icon="eye">Voir ma fiche publique</Button>
        )}
      </section>
    </ProfessorShell>
  );
}