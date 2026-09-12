package com.coursconnect.repository;

import com.coursconnect.model.Availability;
import com.coursconnect.model.Professor;
import com.coursconnect.model.enums.DayOfWeek;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.time.LocalTime;
import java.util.List;

@Stateless
public class AvailabilityRepository {

    @PersistenceContext
    private EntityManager em;

    public Availability findById(Long id) {
        return em.find(Availability.class, id);
    }

    public List<Availability> findByProfessor(Professor professor) {
        TypedQuery<Availability> q = em.createQuery(
            "SELECT a FROM Availability a WHERE a.professor = :professor AND a.active = true ORDER BY a.dayOfWeek, a.startTime", Availability.class);
        q.setParameter("professor", professor);
        return q.getResultList();
    }

    public List<Availability> findByProfessorId(Long professorId) {
        TypedQuery<Availability> q = em.createQuery(
            "SELECT a FROM Availability a WHERE a.professor.id = :professorId AND a.active = true ORDER BY a.dayOfWeek, a.startTime", Availability.class);
        q.setParameter("professorId", professorId);
        return q.getResultList();
    }

    public boolean existsOverlap(Professor professor, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime, Long excludeId) {
        String jpql = "SELECT COUNT(a) FROM Availability a WHERE a.professor = :professor AND a.dayOfWeek = :day " +
                "AND a.active = true AND a.startTime < :endTime AND a.endTime > :startTime";
        if (excludeId != null) {
            jpql += " AND a.id != :excludeId";
        }
        TypedQuery<Long> q = em.createQuery(jpql, Long.class);
        q.setParameter("professor", professor);
        q.setParameter("day", dayOfWeek);
        q.setParameter("startTime", startTime);
        q.setParameter("endTime", endTime);
        if (excludeId != null) {
            q.setParameter("excludeId", excludeId);
        }
        return q.getSingleResult() > 0;
    }

    public boolean isSlotCovered(Professor professor, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime) {
        TypedQuery<Long> q = em.createQuery(
            "SELECT COUNT(a) FROM Availability a WHERE a.professor = :professor AND a.dayOfWeek = :day " +
            "AND a.active = true AND a.startTime <= :startTime AND a.endTime >= :endTime", Long.class);
        q.setParameter("professor", professor);
        q.setParameter("day", dayOfWeek);
        q.setParameter("startTime", startTime);
        q.setParameter("endTime", endTime);
        return q.getSingleResult() > 0;
    }

    public Availability save(Availability availability) {
        if (availability.getId() == null) {
            em.persist(availability);
            return availability;
        }
        return em.merge(availability);
    }

    public void delete(Long id) {
        Availability availability = em.find(Availability.class, id);
        if (availability != null) {
            em.remove(availability);
        }
    }
}