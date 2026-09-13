import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProfessorShell from '../../components/dashboard/ProfessorShell';
import Button from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { getMyOffers, createOffer, updateOffer } from '../../services/api';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import { MEETING_PLATFORMS, MEETING_LINK_HELP } from '../../utils/labels';
import type { Offer } from '../../types';

const emptyOffer: Omit<Offer, 'id' | 'professorId' | 'active' | 'createdAt'> = {
  title: '', description: '', price: 0, durationMinutes: 60, courseType: 'INDIVIDUAL', locationType: 'STUDENT_HOME',
  meetingPlatform: '',
};

export default function ProfessorOfferForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const unreadCount = useUnreadCount();
  const isEditing = Boolean(id);

  const [form, setForm] = useState(emptyOffer);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoaded(true);
      return;
    }
    let mounted = true;
    getMyOffers()
      .then((offers) => {
        if (!mounted) return;
        const o = offers.find((x) => x.id === Number(id));
        if (!o) return;
        setForm({
          title: o.title,
          description: o.description || '',
          price: o.price,
          durationMinutes: o.durationMinutes,
          courseType: o.courseType,
          locationType: o.locationType,
          meetingPlatform: o.meetingPlatform || '',
        });
        setLoaded(true);
      })
      .catch(() => mounted && setLoaded(true));
    return () => { mounted = false; };
  }, [id]);

  const isOnline = form.courseType === 'ONLINE' || form.locationType === 'ONLINE';

  async function handleSubmit() {
    setSaving(true);
    setMessage('');
    try {
      const data = { ...form, price: Number(form.price), durationMinutes: Number(form.durationMinutes) };
      if (isEditing) {
        await updateOffer(Number(id), data);
        setMessage('Offre mise à jour avec succès.');
      } else {
        await createOffer(data);
        setMessage('Offre créée avec succès.');
      }
      navigate('/professor/offers', { replace: true });
    } catch (err) {
      setMessage(err instanceof Error ? `Erreur : ${err.message}` : 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProfessorShell
      pageTitle={isEditing ? "Modifier l'offre" : 'Nouvelle offre'}
      subtitle={isEditing ? 'Mettez à jour votre offre.' : 'Créez une offre pour attirer de nouveaux élèves.'}
      unreadCount={unreadCount}
    >
      {!loaded ? (
        <div className="dash-card"><div className="skeleton skeleton--line skeleton--wide" /></div>
      ) : (
        <section className="dash-card">
          <div className="form-row">
            <Input label="Titre *" id="o-title" placeholder="Ex : Soutien en Mathématiques" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label="Prix (DH/heure) *" id="o-price" type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
          </div>
          <div className="form-row">
            <Input label="Durée (min)" id="o-duration" type="number" min={15} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
            <Select label="Type de cours" id="o-type" value={form.courseType} onChange={(e) => setForm({ ...form, courseType: e.target.value as Offer['courseType'] })}>
              <option value="INDIVIDUAL">Individuel</option>
              <option value="GROUP">Groupe</option>
              <option value="ONLINE">En ligne</option>
            </Select>
            <Select label="Lieu" id="o-location" value={form.locationType} onChange={(e) => setForm({ ...form, locationType: e.target.value as Offer['locationType'] })}>
              <option value="STUDENT_HOME">Chez l'élève</option>
              <option value="PROFESSOR_HOME">Chez le professeur</option>
              <option value="ONLINE">En ligne</option>
              <option value="OTHER">Autre</option>
            </Select>
          </div>
          <Textarea label="Description" id="o-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {isOnline && (
            <div className="meeting-fields">
              <Select label="Plateforme de visioconférence (préférée)" id="o-meet-plat" value={form.meetingPlatform || ''} onChange={(e) => setForm({ ...form, meetingPlatform: e.target.value })}>
                <option value="">— Sélectionner —</option>
                {MEETING_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
              <p className="meeting-fields__help">
                {MEETING_LINK_HELP}
              </p>
            </div>
          )}
          {message && <div className={message.includes('Erreur') ? 'error-banner' : 'success-banner'}><p>{message}</p></div>}
          <div className="booking-item__actions" style={{ justifyContent: 'flex-start' }}>
            <Button onClick={handleSubmit} loading={saving} disabled={!form.title.trim() || form.price <= 0}>
              {saving ? 'Enregistrement...' : isEditing ? "Mettre à jour l'offre" : "Créer l'offre"}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/professor/offers')}>Annuler</Button>
          </div>
        </section>
      )}
    </ProfessorShell>
  );
}