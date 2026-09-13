import { useState, useEffect } from 'react';
import StudentShell from '../../components/dashboard/StudentShell';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { Input, Select } from '../../components/ui/Field';
import { getStudentProfile, updateStudentProfile, fetchCities } from '../../services/api';
import type { StudentProfile, City } from '../../types';

export default function StudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [phone, setPhone] = useState('');
  const [cityId, setCityId] = useState<number | ''>('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getStudentProfile(), fetchCities()])
      .then(([p, c]) => {
        if (!mounted) return;
        setProfile(p);
        setPhone(p.phone || '');
        setCityId(p.cityId || '');
        setCities(c);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const updated = await updateStudentProfile({
        phone: phone.trim() || undefined,
        cityId: cityId !== '' ? Number(cityId) : undefined,
      });
      setProfile(updated);
      setEditing(false);
      setMessage('Profil mis à jour');
    } catch {
      setMessage('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <StudentShell pageTitle="Mon Profil">
      <div className="booking-list"><div className="booking-item booking-item--skeleton"><div className="skeleton skeleton--line skeleton--wide" /></div></div>
    </StudentShell>
  );

  return (
    <StudentShell pageTitle="Mon Profil" subtitle="Gérez vos informations personnelles">
      <div className="dash-card">
        <div className="dash-card__title">
          <h2>Informations personnelles</h2>
          {!editing ? (
            <Button size="sm" variant="outline" icon="edit" onClick={() => setEditing(true)}>Modifier</Button>
          ) : (
            <div className="booking-item__actions">
              <Button size="sm" onClick={handleSave} loading={saving}>Enregistrer</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setPhone(profile?.phone || ''); setCityId(profile?.cityId || ''); }}>Annuler</Button>
            </div>
          )}
        </div>

        {message && <div className={message.includes('Erreur') ? 'error-banner' : 'success-banner'} style={{ marginTop: '0.75rem' }}><p>{message}</p></div>}

        <div className="detail-rows" style={{ marginTop: '1rem' }}>
          <div className="detail-row">
            <span className="detail-row__label">Email</span>
            <span className="detail-row__value">{profile?.email || '—'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-row__label">Nom</span>
            <span className="detail-row__value">{profile?.firstName} {profile?.lastName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-row__label">Rôle</span>
            <span className="detail-row__value">Élève</span>
          </div>
          {editing ? (
            <>
              <Input label="Téléphone" id="s-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+212 ..." maxLength={30} />
              <Select label="Ville" id="s-city" value={cityId} onChange={(e) => setCityId(e.target.value === '' ? '' : Number(e.target.value))}>
                <option value="">— Sélectionner —</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </>
          ) : (
            <>
              <div className="detail-row">
                <span className="detail-row__label">Téléphone</span>
                <span className="detail-row__value">{profile?.phone || '—'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-row__label">Ville</span>
                <span className="detail-row__value">{profile?.cityName || '—'}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="dash-card" style={{ marginTop: '1.5rem' }}>
        <div className="dash-card__title">
          <h2>Paramètres</h2>
        </div>
        <div className="detail-rows" style={{ marginTop: '0.75rem' }}>
          <div className="detail-row">
            <span className="detail-row__label">Statut du compte</span>
            <span className="detail-row__value"><span className="badge badge--green"><Icon name="check" size={14} /> Actif</span></span>
          </div>
          <div className="detail-row">
            <span className="detail-row__label">Notifications</span>
            <span className="detail-row__value">
              <Button size="sm" variant="link" to="/student/notifications">Gérer les notifications</Button>
            </span>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}