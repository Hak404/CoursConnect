package com.coursconnect.repository;

import com.coursconnect.model.Matiere;
import com.coursconnect.model.Niveau;
import com.coursconnect.model.Professeur;
import com.coursconnect.model.User;

import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.math.BigDecimal;
import java.util.List;

@Stateless
public class ProfesseurRepository {

    @PersistenceContext
    private EntityManager em;

    public Professeur findById(Long id) {
        return em.find(Professeur.class, id);
    }

    public List<Professeur> findAll(int page, int taille) {
        TypedQuery<Professeur> query = em.createQuery(
                "SELECT p FROM Professeur p ORDER BY p.nom", Professeur.class);
        query.setFirstResult(page * taille);
        query.setMaxResults(taille);
        return query.getResultList();
    }

    public List<Professeur> search(String ville, Long matiereId, Long niveauId,
                                   BigDecimal tarifMin, BigDecimal tarifMax,
                                   int page, int taille) {
        StringBuilder jpql = new StringBuilder("SELECT DISTINCT p FROM Professeur p WHERE p.actif = true");

        if (ville != null && !ville.trim().isEmpty()) {
            jpql.append(" AND p.ville LIKE :ville");
        }
        if (matiereId != null) {
            jpql.append(" AND :matiereId IN (SELECT m.id FROM p.matieres m)");
        }
        if (niveauId != null) {
            jpql.append(" AND :niveauId IN (SELECT n.id FROM p.niveaux n)");
        }
        if (tarifMin != null) {
            jpql.append(" AND p.tarifHoraire >= :tarifMin");
        }
        if (tarifMax != null) {
            jpql.append(" AND p.tarifHoraire <= :tarifMax");
        }

        jpql.append(" ORDER BY p.nom");

        TypedQuery<Professeur> query = em.createQuery(jpql.toString(), Professeur.class);

        if (ville != null && !ville.trim().isEmpty()) {
            query.setParameter("ville", "%" + ville.trim() + "%");
        }
        if (matiereId != null) {
            query.setParameter("matiereId", matiereId);
        }
        if (niveauId != null) {
            query.setParameter("niveauId", niveauId);
        }
        if (tarifMin != null) {
            query.setParameter("tarifMin", tarifMin);
        }
        if (tarifMax != null) {
            query.setParameter("tarifMax", tarifMax);
        }

        query.setFirstResult(page * taille);
        query.setMaxResults(taille);

        return query.getResultList();
    }

    public long countSearch(String ville, Long matiereId, Long niveauId,
                            BigDecimal tarifMin, BigDecimal tarifMax) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(DISTINCT p) FROM Professeur p WHERE p.actif = true");

        if (ville != null && !ville.trim().isEmpty()) {
            jpql.append(" AND p.ville LIKE :ville");
        }
        if (matiereId != null) {
            jpql.append(" AND :matiereId IN (SELECT m.id FROM p.matieres m)");
        }
        if (niveauId != null) {
            jpql.append(" AND :niveauId IN (SELECT n.id FROM p.niveaux n)");
        }
        if (tarifMin != null) {
            jpql.append(" AND p.tarifHoraire >= :tarifMin");
        }
        if (tarifMax != null) {
            jpql.append(" AND p.tarifHoraire <= :tarifMax");
        }

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);

        if (ville != null && !ville.trim().isEmpty()) {
            query.setParameter("ville", "%" + ville.trim() + "%");
        }
        if (matiereId != null) {
            query.setParameter("matiereId", matiereId);
        }
        if (niveauId != null) {
            query.setParameter("niveauId", niveauId);
        }
        if (tarifMin != null) {
            query.setParameter("tarifMin", tarifMin);
        }
        if (tarifMax != null) {
            query.setParameter("tarifMax", tarifMax);
        }

        return query.getSingleResult();
    }

    public Professeur save(Professeur prof) {
        if (prof.getId() == null) {
            em.persist(prof);
            return prof;
        } else {
            return em.merge(prof);
        }
    }

    public void delete(Long id) {
        Professeur prof = em.find(Professeur.class, id);
        if (prof != null) {
            em.remove(prof);
        }
    }

    public List<Matiere> findAllMatieres() {
        return em.createQuery("SELECT m FROM Matiere m ORDER BY m.nom", Matiere.class)
                .getResultList();
    }

    public List<Niveau> findAllNiveaux() {
        return em.createQuery("SELECT n FROM Niveau n ORDER BY n.ordre", Niveau.class)
                .getResultList();
    }

    public Matiere findMatiereById(Long id) {
        return em.find(Matiere.class, id);
    }

    public Niveau findNiveauById(Long id) {
        return em.find(Niveau.class, id);
    }

    public Professeur findByUser(User user) {
        TypedQuery<Professeur> q = em.createQuery(
            "SELECT p FROM Professeur p WHERE p.user = :user", Professeur.class);
        q.setParameter("user", user);
        List<Professeur> results = q.getResultList();
        return results.isEmpty() ? null : results.get(0);
    }

    public List<Professeur> findAll() {
        return em.createQuery("SELECT p FROM Professeur p ORDER BY p.nom", Professeur.class)
                .getResultList();
    }

    public List<Professeur> findAllVerified() {
        return em.createQuery("SELECT p FROM Professeur p WHERE p.verified = true AND p.actif = true ORDER BY p.nom", Professeur.class)
                .getResultList();
    }
}
