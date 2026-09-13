import { useState, useEffect } from 'react';
import ProfessorShell from '../../components/dashboard/ProfessorShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { Input, Select } from '../../components/ui/Field';
import { getMyAvailability, createAvailability, deleteAvailability } from '../../services/api';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import { formatDay, DAY_ORDER as DAYS } from '../../utils/labels';
import type { Availability } from '../../types';

const emptyAvailability: { dayOfWeek: string; startTime: string; endTime: string } = { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '11:00' };

export default function ProfessorAvailability() {
  const unreadCount = useUnreadCount();
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [form, setForm] = useState(emptyAvailability);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getMyAvailability()
      .then((a) => mounted && setAvailability(a))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  async function handleSubmit() {
    setSaving(true);
    setMessage('');
    try {
      await createAvailability(form);
      setMessage('Créneau ajouté.');
      setAvailability(await getMyAvailability());
    } catch (err) {
      setMessage(err instanceof Error ? `Erreur : ${err.message}` : 'Erreur lors de l\'ajout');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Supprimer ce créneau de disponibilité ?')) return;
    try {
      await deleteAvailability(id);
      setAvailability(await getMyAvailability());
    } catch (err) {
      setMessage(err instanceof Error ? `Erreur : ${err.message}` : 'Erreur lors de la suppression');
    }
  }

  return (
    <ProfessorShell
      pageTitle="Mes disponibilités"
      subtitle="Indiquez vos créneaux hebdomadaires pour que les élèves puissent réserver."
      unreadCount={unreadCount}
    >
      <section className="dash-card">
        <div className="dash-card__title"><h2>Ajouter un créneau</h2></div>
        <div className="form-row">
          <Select label="Jour" id="a-day" value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}>
            {DAYS.map((d) => (
              <option key={d} value={d}>{formatDay(d)}</option>
            ))}
          </Select>
          <Input label="Début" id="a-start" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
          <Input label="Fin" id="a-end" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
        </div>
        {message && <div className={message.includes('Erreur') ? 'error-banner' : 'success-banner'}><p>{message}</p></div>}
        <Button onClick={handleSubmit} loading={saving}>
          {saving ? 'Ajout...' : 'Ajouter le créneau'}
        </Button>

        <div className="dash-card__section">
          <h3>Mes créneaux ({availability.length})</h3>
          {loading ? (
            <div className="booking-list">
              <div className="booking-item booking-item--skeleton"><div className="skeleton skeleton--line skeleton--wide" /></div>
            </div>
          ) : availability.length === 0 ? (
            <EmptyState emoji="🕒" title="Aucun créneau" text="Ajoutez vos disponibilités pour que les élèves puissent réserver." />
          ) : (
            <div className="booking-list">
              {availability.map((a) => (
                <div key={a.id} className="booking-item">
                  <div className="booking-item__head">
                    <div className="booking-item__title">
                      <h4>{formatDay(a.dayOfWeek)} · {a.startTime}–{a.endTime}</h4>
                    </div>
                    <Badge variant={a.active ? 'yellow' : 'neutral'}>{a.active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <div className="booking-item__actions">
                    <Button variant="danger-ghost" size="sm" icon="trash" onClick={() => handleDelete(a.id)}>Supprimer</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </ProfessorShell>
  );
}