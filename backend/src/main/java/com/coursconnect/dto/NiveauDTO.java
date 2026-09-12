package com.coursconnect.dto;

public class NiveauDTO {

    private Long id;
    private String nom;
    private String description;
    private int ordre;

    public NiveauDTO() {
    }

    public NiveauDTO(Long id, String nom, String description, int ordre) {
        this.id = id;
        this.nom = nom;
        this.description = description;
        this.ordre = ordre;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getOrdre() {
        return ordre;
    }

    public void setOrdre(int ordre) {
        this.ordre = ordre;
    }
}
