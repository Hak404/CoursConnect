import Badge from './Badge';

export type StatusBadgeKind = 'booking' | 'proposal' | 'role' | 'generic';
export type StatusBadgeVariant = 'blue' | 'green' | 'yellow' | 'gray' | 'red' | 'neutral' | 'accent';

const BOOKING_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  ACCEPTED: 'Confirmée',
  REJECTED: 'Refusée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée',
};

const PROPOSAL_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  ACCEPTED: 'Acceptée',
  REJECTED: 'Refusée',
  CANCELLED: 'Annulée',
};

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Élève',
  PROFESSOR: 'Professeur',
  ADMIN: 'Admin',
};

interface StatusBadgeProps {
  status: string;
  kind?: StatusBadgeKind;
}

export default function StatusBadge({ status, kind = 'generic' }: StatusBadgeProps) {
  let label = status;
  if (kind === 'booking') label = BOOKING_LABELS[status] || status;
  else if (kind === 'proposal') label = PROPOSAL_LABELS[status] || status;
  else if (kind === 'role') label = ROLE_LABELS[status] || status;

  let variant: StatusBadgeVariant = 'gray';
  if (kind === 'booking' || kind === 'proposal') {
    if (status === 'COMPLETED' || status === 'ACCEPTED') variant = 'green';
    else if (status === 'PENDING') variant = 'yellow';
    else if (status === 'REJECTED' || status === 'CANCELLED') variant = 'red';
  } else if (kind === 'role') {
    if (status === 'STUDENT') variant = 'blue';
    else if (status === 'PROFESSOR') variant = 'yellow';
    else if (status === 'ADMIN') variant = 'red';
  }

  const icon = kind !== 'role' ? (status === 'ACCEPTED' || status === 'COMPLETED' ? 'check' : undefined) : undefined;

  return (
    <Badge variant={variant} icon={icon}>
      {label}
    </Badge>
  );
}