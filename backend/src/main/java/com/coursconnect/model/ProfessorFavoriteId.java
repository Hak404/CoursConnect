package com.coursconnect.model;

import java.io.Serializable;
import java.util.Objects;

public class ProfessorFavoriteId implements Serializable {

    private Long student;
    private Long professor;

    public ProfessorFavoriteId() {
    }

    public ProfessorFavoriteId(Long student, Long professor) {
        this.student = student;
        this.professor = professor;
    }

    public Long getStudent() { return student; }
    public void setStudent(Long student) { this.student = student; }
    public Long getProfessor() { return professor; }
    public void setProfessor(Long professor) { this.professor = professor; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProfessorFavoriteId that = (ProfessorFavoriteId) o;
        return Objects.equals(student, that.student) && Objects.equals(professor, that.professor);
    }

    @Override
    public int hashCode() {
        return Objects.hash(student, professor);
    }
}