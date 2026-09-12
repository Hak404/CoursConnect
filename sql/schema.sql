CREATE DATABASE IF NOT EXISTS coursconnect;
USE coursconnect;

CREATE TABLE matieres (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE niveaux (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    ordre INT NOT NULL
);

CREATE TABLE professeurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telephone VARCHAR(20),
    ville VARCHAR(100) NOT NULL,
    code_postal VARCHAR(10),
    bio TEXT,
    photo_url VARCHAR(500),
    tarif_horaire DECIMAL(6,2) NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE professeur_matiere (
    professeur_id BIGINT NOT NULL,
    matiere_id BIGINT NOT NULL,
    PRIMARY KEY (professeur_id, matiere_id),
    FOREIGN KEY (professeur_id) REFERENCES professeurs(id),
    FOREIGN KEY (matiere_id) REFERENCES matieres(id)
);

CREATE TABLE professeur_niveau (
    professeur_id BIGINT NOT NULL,
    niveau_id BIGINT NOT NULL,
    PRIMARY KEY (professeur_id, niveau_id),
    FOREIGN KEY (professeur_id) REFERENCES professeurs(id),
    FOREIGN KEY (niveau_id) REFERENCES niveaux(id)
);

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

INSERT INTO professeurs (nom, prenom, email, telephone, ville, code_postal, bio, photo_url, tarif_horaire) VALUES
('Dubois', 'Marie', 'marie.dubois@coursconnect.fr', '06 12 34 56 78', 'Paris', '75005', 'Professeure agrégée de mathématiques avec 12 ans d''expérience. Spécialisée dans la préparation au baccalauréat et aux classes préparatoires. Méthode pédagogique adaptée à chaque élève.', '/photos/marie-dubois.jpg', 45.00),
('Martin', 'Thomas', 'thomas.martin@coursconnect.fr', '06 23 45 67 89', 'Lyon', '69007', 'Ancien ingénieur reconverti en professeur d''informatique. Passionné par la programmation et l''algorithmique. J''accompagne les élèves du collège à l''université.', '/photos/thomas-martin.jpg', 35.00),
('Lefebvre', 'Sophie', 'sophie.lefebvre@coursconnect.fr', '06 34 56 78 90', 'Marseille', '13008', 'Professeure certifiée de français, passionnée de littérature. Je prépare les élèves aux épreuves du brevet et du bac avec des méthodes ludiques et rigoureuses.', '/photos/sophie-lefebvre.jpg', 40.00),
('Moreau', 'Lucas', 'lucas.moreau@coursconnect.fr', '06 45 67 89 01', 'Bordeaux', '33000', 'Docteur en physique-chimie, j''enseigne avec passion depuis 8 ans. Mes cours allient théorie et travaux pratiques pour une compréhension profonde des phénomènes.', '/photos/lucas-moreau.jpg', 50.00),
('Bernard', 'Émilie', 'emilie.bernard@coursconnect.fr', '06 56 78 90 12', 'Toulouse', '31000', 'Professeure d''anglais certifiée, titulaire d''un master de linguistique. Je propose des cours interactifs avec accent sur la conversation et la culture anglo-saxonne.', '/photos/emilie-bernard.jpg', 38.00),
('Petit', 'Antoine', 'antoine.petit@coursconnect.fr', '06 67 89 01 23', 'Lille', '59000', 'Professeur d''histoire-géographie et SVT. Mon approche narrative rend les matières vivantes. Idéal pour les élèves en difficulté ou souhaitant approfondir.', '/photos/antoine-petit.jpg', 30.00);

INSERT INTO professeur_matiere (professeur_id, matiere_id) VALUES
(1, 1),
(2, 7),
(3, 2),
(4, 4),
(5, 3),
(5, 10),
(6, 5),
(6, 6);

INSERT INTO professeur_niveau (professeur_id, niveau_id) VALUES
(1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13),
(2, 6), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11), (2, 12), (2, 13),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9), (3, 10), (3, 11), (3, 12),
(4, 9), (4, 10), (4, 11), (4, 12), (4, 13),
(5, 6), (5, 7), (5, 8), (5, 9), (5, 10), (5, 11), (5, 12),
(6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 6), (6, 7), (6, 8), (6, 9), (6, 10), (6, 11), (6, 12);
