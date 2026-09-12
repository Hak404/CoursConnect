package com.coursconnect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class ProfesseurCreateDTO {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prenom est obligatoire")
    private String prenom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit etre valide")
    private String email;

    private String telephone;

    @NotBlank(message = "La ville est obligatoire")
    private String ville;

    private String codePostal;

    private String bio;

    private String photoUrl;

    @NotNull(message = "Le tarif horaire est obligatoire")
    private BigDecimal tarifHoraire;

    private List<Long> matiereIds;

    private List<Long> niveauIds;

    public ProfesseurCreateDTO() {
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

    public List<Long> getMatiereIds() {
        return matiereIds;
    }

    public void setMatiereIds(List<Long> matiereIds) {
        this.matiereIds = matiereIds;
    }

    public List<Long> getNiveauIds() {
        return niveauIds;
    }

    public void setNiveauIds(List<Long> niveauIds) {
        this.niveauIds = niveauIds;
    }
}
