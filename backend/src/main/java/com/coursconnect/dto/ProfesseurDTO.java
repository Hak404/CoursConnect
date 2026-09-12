package com.coursconnect.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProfesseurDTO {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String ville;
    private String codePostal;
    private String bio;
    private String photoUrl;
    private BigDecimal tarifHoraire;
    private List<MatiereDTO> matieres;
    private List<NiveauDTO> niveaux;
    private LocalDateTime createdAt;

    public ProfesseurDTO() {
    }

    public ProfesseurDTO(Long id, String nom, String prenom, String email, String telephone,
                         String ville, String codePostal, String bio, String photoUrl,
                         BigDecimal tarifHoraire, List<MatiereDTO> matieres,
                         List<NiveauDTO> niveaux, LocalDateTime createdAt) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.ville = ville;
        this.codePostal = codePostal;
        this.bio = bio;
        this.photoUrl = photoUrl;
        this.tarifHoraire = tarifHoraire;
        this.matieres = matieres;
        this.niveaux = niveaux;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getCodePostal() {
        return codePostal;
    }

    public void setCodePostal(String codePostal) {
        this.codePostal = codePostal;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public BigDecimal getTarifHoraire() {
        return tarifHoraire;
    }

    public void setTarifHoraire(BigDecimal tarifHoraire) {
        this.tarifHoraire = tarifHoraire;
    }

    public List<MatiereDTO> getMatieres() {
        return matieres;
    }

    public void setMatieres(List<MatiereDTO> matieres) {
        this.matieres = matieres;
    }

    public List<NiveauDTO> getNiveaux() {
        return niveaux;
    }

    public void setNiveaux(List<NiveauDTO> niveaux) {
        this.niveaux = niveaux;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String nom;
        private String prenom;
        private String email;
        private String telephone;
        private String ville;
        private String codePostal;
        private String bio;
        private String photoUrl;
        private BigDecimal tarifHoraire;
        private List<MatiereDTO> matieres;
        private List<NiveauDTO> niveaux;
        private LocalDateTime createdAt;

        private Builder() {
        }

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder nom(String nom) {
            this.nom = nom;
            return this;
        }

        public Builder prenom(String prenom) {
            this.prenom = prenom;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder telephone(String telephone) {
            this.telephone = telephone;
            return this;
        }

        public Builder ville(String ville) {
            this.ville = ville;
            return this;
        }

        public Builder codePostal(String codePostal) {
            this.codePostal = codePostal;
            return this;
        }

        public Builder bio(String bio) {
            this.bio = bio;
            return this;
        }

        public Builder photoUrl(String photoUrl) {
            this.photoUrl = photoUrl;
            return this;
        }

        public Builder tarifHoraire(BigDecimal tarifHoraire) {
            this.tarifHoraire = tarifHoraire;
            return this;
        }

        public Builder matieres(List<MatiereDTO> matieres) {
            this.matieres = matieres;
            return this;
        }

        public Builder niveaux(List<NiveauDTO> niveaux) {
            this.niveaux = niveaux;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ProfesseurDTO build() {
            return new ProfesseurDTO(id, nom, prenom, email, telephone, ville, codePostal,
                    bio, photoUrl, tarifHoraire, matieres, niveaux, createdAt);
        }
    }
}
