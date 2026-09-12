package com.coursconnect.dto;

import java.util.List;

public class PagedResult<T> {

    private List<T> contenu;
    private int page;
    private int taille;
    private long totalElements;
    private int totalPages;

    public PagedResult() {
    }

    public PagedResult(List<T> contenu, int page, int taille, long totalElements, int totalPages) {
        this.contenu = contenu;
        this.page = page;
        this.taille = taille;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }

    public List<T> getContenu() {
        return contenu;
    }

    public void setContenu(List<T> contenu) {
        this.contenu = contenu;
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

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
}
