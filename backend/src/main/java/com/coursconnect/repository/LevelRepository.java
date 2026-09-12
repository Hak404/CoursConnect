package com.coursconnect.repository;

import com.coursconnect.model.Level;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;

@Stateless
public class LevelRepository {

    @PersistenceContext
    private EntityManager em;

    public Level findById(Long id) {
        return em.find(Level.class, id);
    }

    public Level findByName(String name) {
        TypedQuery<Level> q = em.createQuery("SELECT l FROM Level l WHERE l.name = :name", Level.class);
        q.setParameter("name", name);
        List<Level> results = q.getResultList();
        return results.isEmpty() ? null : results.get(0);
    }

    public List<Level> findAllActive() {
        return em.createQuery("SELECT l FROM Level l WHERE l.active = true ORDER BY l.displayOrder", Level.class)
                .getResultList();
    }

    public List<Level> findAll() {
        return em.createQuery("SELECT l FROM Level l ORDER BY l.displayOrder", Level.class)
                .getResultList();
    }

    public Level save(Level level) {
        if (level.getId() == null) {
            em.persist(level);
            return level;
        }
        return em.merge(level);
    }

    public void delete(Long id) {
        Level level = em.find(Level.class, id);
        if (level != null) {
            em.remove(level);
        }
    }
}