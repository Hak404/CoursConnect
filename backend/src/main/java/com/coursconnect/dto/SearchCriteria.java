package com.coursconnect.dto;

import java.math.BigDecimal;

public class SearchCriteria {

    private String ville;
    private Long matiereId;
    private Long niveauId;
    private BigDecimal tarifMin;
    private BigDecimal tarifMax;
    private int page = 0;
    private int taille = 20;

    public SearchCriteria() {
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public Long getMatiereId() {
        return matiereId;
    }

    public void setMatiereId(Long matiereId) {
        this.matiereId = matiereId;
    }

    public Long getNiveauId() {
        return niveauId;
    }

    public void setNiveauId(Long niveauId) {
        this.niveauId = niveauId;
    }

    public BigDecimal getTarifMin() {
        return tarifMin;
    }

    public void setTarifMin(BigDecimal tarifMin) {
        this.tarifMin = tarifMin;
    }

    public BigDecimal getTarifMax() {
        return tarifMax;
    }

    public void setTarifMax(BigDecimal tarifMax) {
        this.tarifMax = tarifMax;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getTaille() {
        return taille;
    }

    public void setTaille(int taille) {
        this.taille = taille;
    }
}
