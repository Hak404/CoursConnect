package com.coursconnect.repository;

import com.coursconnect.model.Subject;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;

@Stateless
public class SubjectRepository {

    @PersistenceContext
    private EntityManager em;

    public Subject findById(Long id) {
        return em.find(Subject.class, id);
    }

    public Subject findByName(String name) {
        TypedQuery<Subject> q = em.createQuery("SELECT s FROM Subject s WHERE s.name = :name", Subject.class);
        q.setParameter("name", name);
        List<Subject> results = q.getResultList();
        return results.isEmpty() ? null : results.get(0);
    }

    public List<Subject> findAllActive() {
        return em.createQuery("SELECT s FROM Subject s WHERE s.active = true ORDER BY s.name", Subject.class)
                .getResultList();
    }

    public List<Subject> findAll() {
        return em.createQuery("SELECT s FROM Subject s ORDER BY s.name", Subject.class)
                .getResultList();
    }

    public Subject save(Subject subject) {
        if (subject.getId() == null) {
            em.persist(subject);
            return subject;
        }
        return em.merge(subject);
    }

    public void delete(Long id) {
        Subject subject = em.find(Subject.class, id);
        if (subject != null) {
            em.remove(subject);
        }
    }
}