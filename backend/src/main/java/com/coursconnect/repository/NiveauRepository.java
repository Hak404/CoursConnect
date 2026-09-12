package com.coursconnect.repository;

import com.coursconnect.model.Niveau;

import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Stateless
public class NiveauRepository {

    @PersistenceContext
    private EntityManager em;

    public Niveau findById(Long id) {
        return em.find(Niveau.class, id);
    }

    public List<Niveau> findAll() {
        return em.createQuery("SELECT n FROM Niveau n ORDER BY n.ordre", Niveau.class)
                .getResultList();
    }

    public Niveau save(Niveau niveau) {
        if (niveau.getId() == null) {
            em.persist(niveau);
            return niveau;
        } else {
            return em.merge(niveau);
        }
    }

    public void delete(Long id) {
        Niveau niveau = em.find(Niveau.class, id);
        if (niveau != null) {
            em.remove(niveau);
        }
    }
}
