import { useEffect, useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import RatingStars from './RatingStars';
import { Textarea } from './Field';

interface ReviewModalProps {
  open: boolean;
  professorName: string;
  offerTitle?: string;
  submitting?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export default function ReviewModal({
  open,
  professorName,
  offerTitle,
  submitting,
  error,
  onClose,
  onSubmit,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (open) {
      setRating(5);
      setComment('');
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title='Donnez votre avis'
      maxWidth={520}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Annuler</Button>
          <Button onClick={() => onSubmit(rating, comment)} loading={submitting} disabled={rating < 1}>
            {submitting ? 'Publication...' : "Publier l'avis"}
          </Button>
        </>
      }
    >
      <p className="modal__subtitle">
        Sur votre cours{offerTitle ? <> <strong>{offerTitle}</strong></> : null} avec{' '}
        <strong>{professorName}</strong>
      </p>

      {error && <div className="error-banner"><p>{error}</p></div>}

      <div className="review-steps">
        <div className="review-step">
          <span className="review-step__label">Votre note</span>
          <RatingStars value={rating} onChange={setRating} size={34} showLabel />
        </div>

        <div className="review-step">
          <span className="review-step__label">Commentaire</span>
          <Textarea
            id="review-comment"
            rows={4}
            aria-label="Commentaire"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience avec ce professeur..."
          />
        </div>
      </div>
    </Modal>
  );
}