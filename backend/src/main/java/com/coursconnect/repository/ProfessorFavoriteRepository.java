package com.coursconnect.repository;

import com.coursconnect.model.Professor;
import com.coursconnect.model.ProfessorFavorite;
import com.coursconnect.model.ProfessorFavoriteId;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

import java.util.List;

@Stateless
public class ProfessorFavoriteRepository {

    @PersistenceContext
    private EntityManager em;

    public ProfessorFavorite find(Long studentId, Long professorId) {
        return em.find(ProfessorFavorite.class, new ProfessorFavoriteId(studentId, professorId));
    }

    public boolean exists(Long studentId, Long professorId) {
        return find(studentId, professorId) != null;
    }

    public ProfessorFavorite save(ProfessorFavorite favorite) {
        em.persist(favorite);
        return favorite;
    }

    public void delete(Long studentId, Long professorId) {
        ProfessorFavorite favorite = find(studentId, professorId);
        if (favorite != null) {
            em.remove(favorite);
        }
    }

    public List<Long> findProfessorIdsByStudent(Long studentId) {
        TypedQuery<Long> q = em.createQuery(
            "SELECT f.professor.id FROM ProfessorFavorite f WHERE f.student.id = :studentId ORDER BY f.createdAt DESC",
            Long.class);
        q.setParameter("studentId", studentId);
        return q.getResultList();
    }

    public List<Professor> findProfessorsByStudent(Long studentId) {
        TypedQuery<Professor> q = em.createQuery(
            "SELECT f.professor FROM ProfessorFavorite f WHERE f.student.id = :studentId ORDER BY f.createdAt DESC",
            Professor.class);
        q.setParameter("studentId", studentId);
        return q.getResultList();
    }
}