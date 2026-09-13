import { useEffect, useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import RatingStars from './RatingStars';
import { Textarea } from './Field';

const REVIEW_COMMENT_MAX = 2000;

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
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (open) {
      setRating(0);
      setComment('');
    }
  }, [open]);

  const commentTooLong = comment.length > REVIEW_COMMENT_MAX;
  const canSubmit = rating >= 1 && !commentTooLong;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title='Votre avis'
      maxWidth={520}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Annuler</Button>
          <Button onClick={() => onSubmit(rating, comment.trim())} loading={submitting} disabled={!canSubmit}>
            {submitting ? 'Publication...' : "Publier l'avis"}
          </Button>
        </>
      }
    >
      <p className="modal__subtitle">
        Votre note pour le cours{offerTitle ? <> <strong>{offerTitle}</strong></> : null} avec{' '}
        <strong>{professorName}</strong> sera visible par tous sur le profil du professeur.
      </p>

      {error && <div className="error-banner"><p>{error}</p></div>}

      <div className="review-steps">
        <div className="review-step">
          <span className="review-step__label">Votre note <em className="review-step__required">*</em></span>
          <RatingStars value={rating} onChange={setRating} size={34} showLabel />
          <p className="form-hint">Choisissez une note de 1 à 5 — obligatoire.</p>
        </div>

        <div className="review-step">
          <span className="review-step__label">Commentaire <span className="review-step__optional">(optionnel)</span></span>
          <Textarea
            id="review-comment"
            rows={4}
            aria-label="Commentaire"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={REVIEW_COMMENT_MAX}
            placeholder="Partagez votre expérience avec ce professeur..."
          />
          <p className={`review-step__counter ${commentTooLong ? 'is-error' : ''}`}>
            {comment.length}/{REVIEW_COMMENT_MAX} caractères
          </p>
          {commentTooLong && <p className="form-error">Le commentaire ne doit pas dépasser {REVIEW_COMMENT_MAX} caractères.</p>}
        </div>
      </div>
    </Modal>
  );
}