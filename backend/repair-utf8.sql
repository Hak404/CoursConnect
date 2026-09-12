-- Repair mixed-encoding runtime test data (notifications/reviews)
UPDATE notifications SET message = 'Omar Alaoui a réservé votre offre : Mathématiques - Cours en ligne' WHERE id = 1;
UPDATE notifications SET message = 'Votre réservation pour ''Mathématiques - Cours en ligne'' a été acceptée.' WHERE id = 2;
UPDATE notifications SET message = 'Le cours ''Mathématiques - Cours en ligne'' est terminé. Vous pouvez laisser un avis.' WHERE id = 3;
UPDATE notifications SET message = 'Omar Alaoui a réservé votre offre : Mathématiques - Cours en ligne' WHERE id = 4;
UPDATE notifications SET message = 'Omar a annulé la réservation pour ''Mathématiques - Cours en ligne''.' WHERE id = 5;
UPDATE notifications SET message = 'Omar Alaoui a réservé votre offre : Mathématiques - Cours en ligne' WHERE id = 6;
UPDATE notifications SET message = 'Votre réservation pour ''Mathématiques - Cours en ligne'' a été refusée.' WHERE id = 7;
UPDATE notifications SET message = 'Omar Alaoui propose 60 DH/h pour : Mathématiques - Cours en ligne' WHERE id = 11;
UPDATE notifications SET message = 'Omar Alaoui propose 58 DH/h pour : Mathématiques - Cours en ligne' WHERE id = 12;
UPDATE notifications SET message = 'Votre proposition de 58 DH/h pour ''Mathématiques - Cours en ligne'' a été refusée.' WHERE id = 13;
UPDATE notifications SET message = 'Omar Alaoui propose 62 DH/h pour : Mathématiques - Cours en ligne' WHERE id = 14;
UPDATE notifications SET message = 'Votre proposition de 62 DH/h pour ''Mathématiques - Cours en ligne'' a été acceptée.' WHERE id = 15;
UPDATE notifications SET message = 'Omar Alaoui propose 60 DH/h pour : Mathématiques - Cours en ligne' WHERE id = 16;
UPDATE reviews SET comment = 'Excellent professeur, très patient et pédagogue. Les explications sont claires.' WHERE id = 1;
UPDATE reviews SET comment = 'Cours d''anglais très enrichissant. Méthode immersive et efficace.' WHERE id = 2;
UPDATE reviews SET comment = 'Professeure de français exceptionnelle. Ma note a beaucoup augmenté.' WHERE id = 4;