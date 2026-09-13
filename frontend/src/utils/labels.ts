import type { CourseType, LocationType, DayOfWeek, PaymentMethod, PaymentStatus, BookingStatus } from '../types';

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'En attente',
  ACCEPTED: 'Confirmée',
  REJECTED: 'Refusée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée',
};

export const COURSE_TYPE_LABELS: Record<CourseType, string> = {
  INDIVIDUAL: 'Cours individuel',
  GROUP: 'Cours en groupe',
  ONLINE: 'Cours en ligne',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'En espèces',
  ONLINE: 'En ligne',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: 'Non réglé',
  PENDING: 'En attente',
  PAID: 'Payé',
  FAILED: 'Échec du paiement',
  REFUNDED: 'Remboursé',
};

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  STUDENT_HOME: 'Chez l\'élève',
  PROFESSOR_HOME: 'Chez le professeur',
  ONLINE: 'En ligne',
  OTHER: 'Autre lieu',
};

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Lundi',
  TUESDAY: 'Mardi',
  WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi',
  FRIDAY: 'Vendredi',
  SATURDAY: 'Samedi',
  SUNDAY: 'Dimanche',
};

export const DAY_ORDER: DayOfWeek[] = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
];

export function formatDay(day: string | undefined): string {
  return (day && (DAY_LABELS as Record<string, string>)[day]) || day || '';
}

export function formatCourseType(type: string | undefined): string {
  return (type && (COURSE_TYPE_LABELS as Record<string, string>)[type]) || type || '';
}

export function formatPaymentMethod(method: string | null | undefined): string {
  return (method && (PAYMENT_METHOD_LABELS as Record<string, string>)[method]) || method || '';
}

export function formatPaymentStatus(status: string | null | undefined): string {
  return (status && (PAYMENT_STATUS_LABELS as Record<string, string>)[status]) || status || '';
}

export function formatBookingStatus(status: string | null | undefined): string {
  return (status && (BOOKING_STATUS_LABELS as Record<string, string>)[status]) || status || '';
}

export function formatLocationType(type: string | undefined): string {
  return (type && (LOCATION_TYPE_LABELS as Record<string, string>)[type]) || type || '';
}

export function formatTime(time: string): string {
  return time.length === 5 ? time : time.slice(0, 5);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

export function formatDateFR(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTimeFR(date: string | Date): string {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTimeRange(date: string | Date, durationMinutes: number): string {
  const start = new Date(date);
  if (Number.isNaN(start.getTime())) return '';
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  const startLabel = start.toLocaleTimeString('fr-FR', opts);
  const endLabel = end.toLocaleTimeString('fr-FR', opts);
  const sameDay = start.toDateString() === end.toDateString();
  return sameDay ? `${startLabel} – ${endLabel}` : `${startLabel} – ${endLabel} le ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString('fr-FR')} DH`;
}

export function isSafeMeetingUrl(url: string | null | undefined): boolean {
  return typeof url === 'string' && /^https:\/\//i.test(url.trim()) && url.trim().length > 8;
}

export function safeMeetingUrl(url: string | null | undefined): string | undefined {
  return isSafeMeetingUrl(url) ? (url as string).trim() : undefined;
}

export const MEETING_PLATFORMS = ['Zoom', 'Google Meet', 'Microsoft Teams', 'Autre'] as const;

export type MeetingPlatform = (typeof MEETING_PLATFORMS)[number];

export function isMeetingPlatformKnown(value: string | null | undefined): value is MeetingPlatform {
  return typeof value === 'string' && MEETING_PLATFORMS.some((p) => p === value);
}

export function isValidMeetingPlatform(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 50;
}

export const MEETING_LINK_HELP =
  'Seule une URL https est acceptée. Le lien est attaché à chaque réservation : il sera communiqué à l\'élève uniquement après confirmation. Aucun lien n\'est rendu public sur votre fiche.';

export const ONLINE_ACCEPT_HINT =
  'Vous pourrez ajouter le lien de la séance juste après l\'acceptation, depuis ce tableau de bord (réservation « En ligne » confirmée).';

export function computeEndTime(start: string, durationMinutes: number): string {
  const [h, m] = start.split(':').map(Number);
  const total = h * 60 + m + durationMinutes;
  const eh = Math.floor(total / 60) % 24;
  const em = total % 60;
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
}