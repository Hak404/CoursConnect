package com.coursconnect.repository;

import com.coursconnect.model.Offer;
import com.coursconnect.model.Professor;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;

@Stateless
public class OfferRepository {

    @PersistenceContext
    private EntityManager em;

    public Offer findById(Long id) {
        return em.find(Offer.class, id);
    }

    public List<Offer> findByProfessor(Professor professor) {
        TypedQuery<Offer> q = em.createQuery(
            "SELECT o FROM Offer o WHERE o.professor = :professor ORDER BY o.createdAt DESC", Offer.class);
        q.setParameter("professor", professor);
        return q.getResultList();
    }

    public List<Offer> findByProfessorActive(Professor professor) {
        TypedQuery<Offer> q = em.createQuery(
            "SELECT o FROM Offer o WHERE o.professor = :professor AND o.active = true ORDER BY o.price", Offer.class);
        q.setParameter("professor", professor);
        return q.getResultList();
    }

    public List<Offer> findByProfessorId(Long professorId) {
        TypedQuery<Offer> q = em.createQuery(
            "SELECT o FROM Offer o WHERE o.professor.id = :professorId AND o.active = true ORDER BY o.price", Offer.class);
        q.setParameter("professorId", professorId);
        return q.getResultList();
    }

    public Offer save(Offer offer) {
        if (offer.getId() == null) {
            em.persist(offer);
            return offer;
        }
        return em.merge(offer);
    }

    public void delete(Long id) {
        Offer offer = em.find(Offer.class, id);
        if (offer != null) {
            em.remove(offer);
        }
    }

    public long countAll() {
        return em.createQuery("SELECT COUNT(o) FROM Offer o", Long.class).getSingleResult();
    }
}