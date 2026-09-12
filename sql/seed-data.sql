USE coursconnect;

-- ============================================================
-- SEED DATA: CITIES
-- ============================================================

INSERT INTO cities (name, region) VALUES
('Youssoufia', 'Marrakech-Safi'),
('Safi', 'Marrakech-Safi'),
('Marrakech', 'Marrakech-Safi'),
('Casablanca', 'Casablanca-Settat'),
('Rabat', 'Rabat-Salé-Kénitra'),
('El Jadida', 'Casablanca-Settat'),
('Fès', 'Fès-Meknès'),
('Meknès', 'Fès-Meknès'),
('Tanger', 'Tanger-Tétouan-Al Hoceïma'),
('Agadir', 'Souss-Massa'),
('Oujda', 'Oriental'),
('Khouribga', 'Béni Mellal-Khénifra');

-- ============================================================
-- SEED DATA: SUBJECTS
-- ============================================================

INSERT INTO subjects (name, description) VALUES
('Mathématiques', 'Algèbre, géométrie, analyse, statistiques et probabilités'),
('Physique', 'Mécanique, thermodynamique, électromagnétisme, optique'),
('Chimie', 'Chimie générale, organique, minérale et analytique'),
('Français', 'Grammaire, littérature, expression écrite et orale'),
('Anglais', 'Grammar, vocabulary, conversation, writing'),
('Informatique', 'Programmation, algorithmique, bases de données'),
('Arabe', 'النحو والصرف والأدب العربي'),
('SVT', 'Sciences de la Vie et de la Terre'),
('Histoire-Géographie', 'Histoire du Maroc et du monde, géographie'),
('Espagnol', 'Gramática, vocabulario, conversación');

-- ============================================================
-- SEED DATA: LEVELS
-- ============================================================

INSERT INTO levels (name, description, display_order) VALUES
('Primaire', 'Cycles 1, 2 et 3 - CP à CM2', 1),
('Collège', '6ème, 5ème, 4ème, 3ème', 2),
('Lycée', '2ème année, 1ère année, Terminale', 3),
('Bac', 'Préparation au baccalauréat', 4),
('Université', 'Licence, master, classes préparatoires', 5);

-- ============================================================
-- SEED DATA: USERS (passwords are PBKDF2 hashes of "password123")
-- ============================================================

-- Admin user
INSERT INTO users (first_name, last_name, email, password_hash, phone, role, enabled) VALUES
('Admin', 'CoursConnect', 'admin@coursconnect.fr', '310000:ivoO7coPKBqfdMwHyFas1A==:b2Db3TcHtVTbQSOCwKudiKac1sDTKZ4eIrNnWEjaZFc=', '0524000000', 'ADMIN', TRUE);

-- Professor users (IDs 2-11)
INSERT INTO users (first_name, last_name, email, password_hash, phone, role, enabled) VALUES
('Ahmed', 'El Amrani', 'ahmed.prof@gmail.com', '310000:XYqL95cULSpjBABbhiA6/g==:vqxkWMKK6DSRevQbsJg1qVIHWpmI3tXI/PX1oFxa8ug=', '0661000001', 'PROFESSOR', TRUE),
('Fatima', 'Bennani', 'fatima.prof@gmail.com', '310000:4UaB46wuJZSYVLKTgBaqHQ==:0UhdP/pbd/u2AoB/JIoqwk5yaB6KT6ehQrE3AfaAnao=', '0661000002', 'PROFESSOR', TRUE),
('Youssef', 'Chakir', 'youssef.prof@gmail.com', '310000:ivoO7coPKBqfdMwHyFas1A==:b2Db3TcHtVTbQSOCwKudiKac1sDTKZ4eIrNnWEjaZFc=', '0661000003', 'PROFESSOR', TRUE),
('Khadija', 'Ouaziz', 'khadija.prof@gmail.com', '310000:XYqL95cULSpjBABbhiA6/g==:vqxkWMKK6DSRevQbsJg1qVIHWpmI3tXI/PX1oFxa8ug=', '0661000004', 'PROFESSOR', TRUE),
('Mohammed', 'Tazi', 'mohammed.prof@gmail.com', '310000:4UaB46wuJZSYVLKTgBaqHQ==:0UhdP/pbd/u2AoB/JIoqwk5yaB6KT6ehQrE3AfaAnao=', '0661000005', 'PROFESSOR', TRUE),
('Salma', 'Idrissi', 'salma.prof@gmail.com', '310000:ivoO7coPKBqfdMwHyFas1A==:b2Db3TcHtVTbQSOCwKudiKac1sDTKZ4eIrNnWEjaZFc=', '0661000006', 'PROFESSOR', TRUE),
('Rachid', 'Berrada', 'rachid.prof@gmail.com', '310000:XYqL95cULSpjBABbhiA6/g==:vqxkWMKK6DSRevQbsJg1qVIHWpmI3tXI/PX1oFxa8ug=', '0661000007', 'PROFESSOR', TRUE),
('Nadia', 'Filali', 'nadia.prof@gmail.com', '310000:4UaB46wuJZSYVLKTgBaqHQ==:0UhdP/pbd/u2AoB/JIoqwk5yaB6KT6ehQrE3AfaAnao=', '0661000008', 'PROFESSOR', TRUE),
('Khalid', 'Slaoui', 'khalid.prof@gmail.com', '310000:ivoO7coPKBqfdMwHyFas1A==:b2Db3TcHtVTbQSOCwKudiKac1sDTKZ4eIrNnWEjaZFc=', '0661000009', 'PROFESSOR', TRUE),
('Amina', 'Jabri', 'amina.prof@gmail.com', '310000:XYqL95cULSpjBABbhiA6/g==:vqxkWMKK6DSRevQbsJg1qVIHWpmI3tXI/PX1oFxa8ug=', '0661000010', 'PROFESSOR', TRUE);

-- Student users (IDs 12-16)
INSERT INTO users (first_name, last_name, email, password_hash, phone, role, enabled) VALUES
('Omar', 'Alaoui', 'omar.student@gmail.com', '310000:4UaB46wuJZSYVLKTgBaqHQ==:0UhdP/pbd/u2AoB/JIoqwk5yaB6KT6ehQrE3AfaAnao=', '0670000001', 'STUDENT', TRUE),
('Leila', 'Benkirane', 'leila.student@gmail.com', '310000:ivoO7coPKBqfdMwHyFas1A==:b2Db3TcHtVTbQSOCwKudiKac1sDTKZ4eIrNnWEjaZFc=', '0670000002', 'STUDENT', TRUE),
('Hamza', 'Fassi', 'hamza.student@gmail.com', '310000:XYqL95cULSpjBABbhiA6/g==:vqxkWMKK6DSRevQbsJg1qVIHWpmI3tXI/PX1oFxa8ug=', '0670000003', 'STUDENT', TRUE),
('Meryem', 'Taleb', 'meryem.student@gmail.com', '310000:4UaB46wuJZSYVLKTgBaqHQ==:0UhdP/pbd/u2AoB/JIoqwk5yaB6KT6ehQrE3AfaAnao=', '0670000004', 'STUDENT', TRUE),
('Sara', 'Moatassim', 'sara.student@gmail.com', '310000:ivoO7coPKBqfdMwHyFas1A==:b2Db3TcHtVTbQSOCwKudiKac1sDTKZ4eIrNnWEjaZFc=', '0670000005', 'STUDENT', TRUE);

-- ============================================================
-- SEED DATA: PROFESSORS
-- ============================================================

INSERT INTO professors (user_id, city_id, bio, experience_years, verified, average_rating, total_reviews) VALUES
(2, 1, 'Professeur de mathématiques passionné avec 8 ans d''expérience. Spécialisé dans la préparation au bac et aux concours.', 8, TRUE, 4.80, 45),
(3, 2, 'Docteure en physique, j''enseigne la physique-chimie depuis 6 ans. Méthode pédagogique interactive.', 6, TRUE, 4.60, 32),
(4, 3, 'Professeur d''anglais certifié Cambridge. Expérience avec tous les niveaux du primaire à l''université.', 10, TRUE, 4.90, 58),
(5, 4, 'Professeure de français, agrégée. Préparation au DELF/DALF et au bac français.', 12, TRUE, 4.70, 41),
(6, 5, 'Ingénieur en informatique, formateur en programmation Python, Java et développement web.', 5, FALSE, 4.40, 18),
(7, 1, 'Professeur de physique-chimie, axé sur les méthodes de résolution de problèmes.', 4, TRUE, 4.50, 28),
(8, 6, 'Professeure d''arabe et de littérature arabe. Maîtrise de la grammaire et de la rhétorique.', 7, TRUE, 4.30, 22),
(9, 3, 'Professeur de mathématiques et informatique. Passionné par les mathématiques appliquées.', 9, TRUE, 4.75, 37),
(10, 4, 'Professeure de SVT, docteure en biologie. Approche par la découverte et l''expérience.', 6, FALSE, 4.20, 15),
(11, 7, 'Professeur d''espagnol natif, originaire de Séville. Enseignement communicatif et moderne.', 3, TRUE, 4.55, 20);

-- ============================================================
-- SEED DATA: STUDENTS
-- ============================================================

INSERT INTO students (user_id, city_id) VALUES
(12, 1),
(13, 3),
(14, 4),
(15, 2),
(16, 5);

-- ============================================================
-- SEED DATA: PROFESSOR_SUBJECT (M2M)
-- ============================================================

-- Ahmed: Mathématiques
INSERT INTO professor_subject (professor_id, subject_id) VALUES (1, 1);
-- Fatima: Physique
INSERT INTO professor_subject (professor_id, subject_id) VALUES (2, 2);
-- Youssef: Anglais
INSERT INTO professor_subject (professor_id, subject_id) VALUES (3, 5);
-- Khadija: Français
INSERT INTO professor_subject (professor_id, subject_id) VALUES (4, 3);
-- Mohammed: Informatique
INSERT INTO professor_subject (professor_id, subject_id) VALUES (5, 6);
-- Rachid: Physique + Mathématiques
INSERT INTO professor_subject (professor_id, subject_id) VALUES (6, 2);
INSERT INTO professor_subject (professor_id, subject_id) VALUES (6, 1);
-- Nadia: Arabe
INSERT INTO professor_subject (professor_id, subject_id) VALUES (7, 7);
-- Khalid: Mathématiques + Informatique
INSERT INTO professor_subject (professor_id, subject_id) VALUES (8, 1);
INSERT INTO professor_subject (professor_id, subject_id) VALUES (8, 6);
-- Amina: SVT
INSERT INTO professor_subject (professor_id, subject_id) VALUES (9, 8);
-- Sara: Espagnol
INSERT INTO professor_subject (professor_id, subject_id) VALUES (10, 10);

-- ============================================================
-- SEED DATA: PROFESSOR_LEVEL (M2M)
-- ============================================================

-- Ahmed: Lycée, Bac
INSERT INTO professor_level (professor_id, level_id) VALUES (1, 3), (1, 4);
-- Fatima: Lycée, Bac
INSERT INTO professor_level (professor_id, level_id) VALUES (2, 3), (2, 4);
-- Youssef: Collège, Lycée, Université
INSERT INTO professor_level (professor_id, level_id) VALUES (3, 2), (3, 3), (3, 5);
-- Khadija: Collège, Lycée, Bac
INSERT INTO professor_level (professor_id, level_id) VALUES (4, 2), (4, 3), (4, 4);
-- Mohammed: Lycée, Université
INSERT INTO professor_level (professor_id, level_id) VALUES (5, 3), (5, 5);
-- Rachid: Collège, Lycée
INSERT INTO professor_level (professor_id, level_id) VALUES (6, 2), (6, 3);
-- Nadia: Collège, Lycée
INSERT INTO professor_level (professor_id, level_id) VALUES (7, 2), (7, 3);
-- Khalid: Lycée, Bac, Université
INSERT INTO professor_level (professor_id, level_id) VALUES (8, 3), (8, 4), (8, 5);
-- Amina: Collège, Lycée
INSERT INTO professor_level (professor_id, level_id) VALUES (9, 2), (9, 3);
-- Sara: Collège, Lycée
INSERT INTO professor_level (professor_id, level_id) VALUES (10, 2), (10, 3);

-- ============================================================
-- SEED DATA: OFFERS
-- ============================================================

INSERT INTO offers (professor_id, title, description, price, duration_minutes, course_type, location_type) VALUES
-- Ahmed
(1, 'Mathématiques - Cours individuel Lycée', 'Cours particulier de mathématiques pour élèves du lycée. Algèbre, analyse, géométrie.', 80.00, 60, 'INDIVIDUAL', 'PROFESSOR_HOME'),
(1, 'Préparation Bac Mathématiques', 'Préparation intensive au baccalauréat mathématiques. Séries d''exercices et examens blancs.', 150.00, 120, 'INDIVIDUAL', 'PROFESSOR_HOME'),
(1, 'Mathématiques - Cours en ligne', 'Cours de mathématiques en visioconférence. Tous niveaux lycée.', 70.00, 60, 'ONLINE', 'ONLINE'),
-- Fatima
(2, 'Physique-Chimie Lycée', 'Cours de physique-chimie avec travaux pratiques virtuels.', 90.00, 60, 'INDIVIDUAL', 'PROFESSOR_HOME'),
(2, 'Physique-Chimie Bac', 'Préparation au bac physique-chimie. Focus sur les parties les plus difficiles.', 160.00, 120, 'INDIVIDUAL', 'PROFESSOR_HOME'),
-- Youssef
(3, 'Anglais Conversation', 'Cours de conversation anglaise pour améliorer votre level. Méthode immersive.', 100.00, 60, 'INDIVIDUAL', 'ONLINE'),
(3, 'Anglais Bac', 'Préparation à l''épreuve d''anglais du baccalauréat. Reading, writing, speaking.', 120.00, 90, 'INDIVIDUAL', 'PROFESSOR_HOME'),
(3, 'Anglais Groupe Collège', 'Cours de groupe pour élèves de collège. Maximum 4 élèves.', 50.00, 90, 'GROUP', 'PROFESSOR_HOME'),
-- Khadija
(4, 'Français Lycée', 'Cours de français : grammaire, littérature, dissertation.', 85.00, 60, 'INDIVIDUAL', 'PROFESSOR_HOME'),
(4, 'Préparation DELF B2', 'Préparation au DELF B2 avec exercices pratiques et simulations.', 140.00, 90, 'INDIVIDUAL', 'ONLINE'),
-- Mohammed
(5, 'Initiation à Python', 'Apprenez les bases de la programmation Python. Idéal pour les débutants.', 75.00, 60, 'INDIVIDUAL', 'ONLINE'),
(5, 'Développement Web HTML/CSS/JS', 'Créez votre premier site web. Cours pratique et projet final.', 90.00, 90, 'INDIVIDUAL', 'ONLINE'),
-- Rachid
(6, 'Mathématiques Collège', 'Renforcement en mathématiques pour élèves de collège.', 60.00, 60, 'INDIVIDUAL', 'STUDENT_HOME'),
(6, 'Physique Lycée', 'Cours de physique avec expériences et démonstrations.', 75.00, 60, 'INDIVIDUAL', 'PROFESSOR_HOME'),
-- Nadia
(7, 'Arabe Collège', 'Cours d''arabe : grammaire, conjugaison, expression écrite.', 65.00, 60, 'INDIVIDUAL', 'PROFESSOR_HOME'),
(7, 'Littérature Arabe Lycée', 'Analyse de textes littéraires arabes. Préparation au bac.', 80.00, 60, 'INDIVIDUAL', 'PROFESSOR_HOME'),
-- Khalid
(8, 'Mathématiques Université', 'Cours de mathématiques pour étudiants : algèbre linéaire, analyse.', 120.00, 90, 'INDIVIDUAL', 'ONLINE'),
(8, 'Algorithmique Avancé', 'Cours d''algorithmique et structures de données. Python et Java.', 130.00, 90, 'INDIVIDUAL', 'ONLINE'),
-- Amina
(9, 'SVT Collège', 'Cours de SVT interactifs avec schémas et expériences.', 60.00, 60, 'INDIVIDUAL', 'PROFESSOR_HOME'),
(9, 'SVT Bac', 'Préparation au bac SVT. Révisions complètes et annales.', 100.00, 90, 'INDIVIDUAL', 'PROFESSOR_HOME'),
-- Sara
(10, 'Espagnol Collège', 'Cours d''espagnol pour débutants et intermédiaires.', 55.00, 60, 'INDIVIDUAL', 'PROFESSOR_HOME'),
(10, 'Espagnol Bac', 'Préparation à l''épreuve d''espagnol du bac. Grammaire et conversation.', 75.00, 60, 'INDIVIDUAL', 'ONLINE');

-- ============================================================
-- SEED DATA: AVAILABILITIES
-- ============================================================

INSERT INTO availabilities (professor_id, day_of_week, start_time, end_time) VALUES
-- Ahmed: Mon, Wed, Fri afternoons
(1, 'MONDAY', '14:00', '18:00'),
(1, 'WEDNESDAY', '14:00', '18:00'),
(1, 'FRIDAY', '14:00', '18:00'),
-- Fatima: Tue, Thu, Sat mornings
(2, 'TUESDAY', '09:00', '12:00'),
(2, 'THURSDAY', '09:00', '12:00'),
(2, 'SATURDAY', '09:00', '12:00'),
-- Youssef: Mon-Fri evenings
(3, 'MONDAY', '17:00', '20:00'),
(3, 'TUESDAY', '17:00', '20:00'),
(3, 'WEDNESDAY', '17:00', '20:00'),
(3, 'THURSDAY', '17:00', '20:00'),
(3, 'FRIDAY', '17:00', '20:00'),
-- Khadija: Mon, Wed, Fri mornings
(4, 'MONDAY', '08:00', '12:00'),
(4, 'WEDNESDAY', '08:00', '12:00'),
(4, 'FRIDAY', '08:00', '12:00'),
-- Mohammed: Sat, Sun all day
(5, 'SATURDAY', '09:00', '17:00'),
(5, 'SUNDAY', '09:00', '17:00'),
-- Rachid: Tue, Thu afternoons
(6, 'TUESDAY', '14:00', '18:00'),
(6, 'THURSDAY', '14:00', '18:00'),
-- Nadia: Mon-Fri afternoons
(7, 'MONDAY', '13:00', '17:00'),
(7, 'TUESDAY', '13:00', '17:00'),
(7, 'WEDNESDAY', '13:00', '17:00'),
(7, 'THURSDAY', '13:00', '17:00'),
(7, 'FRIDAY', '13:00', '17:00'),
-- Khalid: Wed, Fri, Sat
(8, 'WEDNESDAY', '10:00', '14:00'),
(8, 'FRIDAY', '10:00', '14:00'),
(8, 'SATURDAY', '10:00', '14:00'),
-- Amina: Tue, Thu, Sat
(9, 'TUESDAY', '09:00', '13:00'),
(9, 'THURSDAY', '09:00', '13:00'),
(9, 'SATURDAY', '09:00', '13:00'),
-- Sara: Mon, Wed evenings
(10, 'MONDAY', '16:00', '20:00'),
(10, 'WEDNESDAY', '16:00', '20:00');

-- ============================================================
-- SEED DATA: BOOKINGS
-- ============================================================

INSERT INTO bookings (student_id, professor_id, offer_id, scheduled_at, status, student_message, professor_response) VALUES
-- Omar booked Ahmed for math bac prep
(1, 1, 2, '2026-09-15 14:00:00', 'COMPLETED', 'Je veux préparer le bac en math.', 'Parfait, on va commencer par les fonctions.'),
(1, 1, 1, '2026-09-22 14:00:00', 'ACCEPTED', 'Cours sur les dérivées.', NULL),
-- Leila booked Youssef for English
(2, 3, 6, '2026-09-18 17:00:00', 'COMPLETED', 'Améliorer mon anglais oral.', 'Très bon progrès !'),
(2, 3, 7, '2026-09-25 17:00:00', 'PENDING', 'Préparation bac anglais.', NULL),
-- Hamza booked Fatima for physics
(3, 2, 4, '2026-09-20 09:00:00', 'COMPLETED', 'Aide en physique-chimie.', 'Les exercices étaient bien.'),
-- Meryem booked Khadija for French
(4, 4, 9, '2026-09-17 08:00:00', 'COMPLETED', 'Cours de français pour le bac.', 'Excellent travail.'),
-- Sara booked Khalid for math university
(5, 8, 17, '2026-09-19 10:00:00', 'CANCELLED', 'Annulé pour raison personnelle.', NULL),
-- Omar booked Mohammed for Python
(1, 5, 11, '2026-09-21 09:00:00', 'ACCEPTED', 'Débutant en Python.', NULL),
-- Leila booked Rachid for math
(2, 6, 13, '2026-09-23 14:00:00', 'PENDING', 'Besoin d''aide en maths collège.', NULL);

-- ============================================================
-- SEED DATA: REVIEWS
-- ============================================================

INSERT INTO reviews (booking_id, student_id, professor_id, rating, comment) VALUES
(1, 1, 1, 5, 'Excellent professeur, très patient et pédagogue. Les explications sont claires.'),
(3, 2, 3, 5, 'Cours d''anglais très enrichissant. Méthode immersive et efficace.'),
(5, 3, 2, 4, 'Bon professeur de physique, mais parfois un peu rapide dans les explications.'),
(6, 4, 4, 5, 'Professeure de français exceptionnelle. Ma note a beaucoup augmenté.');

-- ============================================================
-- SEED DATA: LEGACY PROFESSEURS (Phase 1 compat)
-- ============================================================

INSERT INTO professeurs (nom, prenom, email, telephone, ville, code_postal, bio, tarif_horaire) VALUES
('El Amrani', 'Ahmed', 'ahmed.legacy@gmail.com', '0661000001', 'Youssoufia', '25000', 'Professeur de mathématiques', 80.00),
('Bennani', 'Fatima', 'fatima.legacy@gmail.com', '0661000002', 'Safi', '46000', 'Professeure de physique', 90.00),
('Chakir', 'Youssef', 'youssef.legacy@gmail.com', '0661000003', 'Marrakech', '40000', 'Professeur d''anglais', 100.00);

INSERT INTO matieres (nom, description) VALUES
('Mathématiques', 'Algèbre, géométrie, analyse et calcul'),
('Français', 'Grammaire, conjugaison, littérature et expression écrite'),
('Anglais', 'Langue et civilisation anglaises'),
('Physique-Chimie', 'Mécanique, électricité, chimie organique et inorganique'),
('Histoire-Géographie', 'Histoire de France et du monde, géographie'),
('SVT', 'Sciences de la vie et de la terre'),
('Informatique', 'Programmation, algorithmique et systèmes'),
('Musique', 'Solfège, instruments et histoire de la musique'),
('Espagnol', 'Langue et culture espagnole'),
('Allemand', 'Langue et culture allemande');

INSERT INTO niveaux (nom, description, ordre) VALUES
('CP', 'Cours Préparatoire', 1),
('CE1', 'Cours Élémentaire 1', 2),
('CE2', 'Cours Élémentaire 2', 3),
('CM1', 'Cours Moyen 1', 4),
('CM2', 'Cours Moyen 2', 5),
('6ème', 'Sixième - Collège', 6),
('5ème', 'Cinquième - Collège', 7),
('4ème', 'Quatrième - Collège', 8),
('3ème', 'Troisième - Collège', 9),
('Seconde', 'Seconde - Lycée', 10),
('Première', 'Première - Lycée', 11),
('Terminale', 'Terminale - Lycée', 12),
('Université', 'Enseignement supérieur', 13);

INSERT INTO professeur_matiere (professeur_id, matiere_id) VALUES (1, 1), (2, 2), (3, 3);
INSERT INTO professeur_niveau (professeur_id, niveau_id) VALUES (1, 3), (2, 3), (3, 2);
