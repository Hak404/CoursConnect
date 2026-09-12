package com.coursconnect.repository;

import com.coursconnect.model.Matiere;

import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Stateless
public class MatiereRepository {

    @PersistenceContext
    private EntityManager em;

    public Matiere findById(Long id) {
        return em.find(Matiere.class, id);
    }

    public List<Matiere> findAll() {
        return em.createQuery("SELECT m FROM Matiere m ORDER BY m.nom", Matiere.class)
                .getResultList();
    }

    public Matiere save(Matiere matiere) {
        if (matiere.getId() == null) {
            em.persist(matiere);
            return matiere;
        } else {
            return em.merge(matiere);
        }
    }

    public void delete(Long id) {
        Matiere matiere = em.find(Matiere.class, id);
        if (matiere != null) {
            em.remove(matiere);
        }
    }
}
