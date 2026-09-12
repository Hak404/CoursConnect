package com.coursconnect.repository;

import com.coursconnect.model.Booking;
import com.coursconnect.model.Professor;
import com.coursconnect.model.Student;
import com.coursconnect.model.enums.BookingStatus;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.time.LocalDateTime;
import java.util.List;

@Stateless
public class BookingRepository {

    @PersistenceContext
    private EntityManager em;

    public Booking findById(Long id) {
        return em.find(Booking.class, id);
    }

    public List<Booking> findByStudent(Student student) {
        TypedQuery<Booking> q = em.createQuery(
            "SELECT b FROM Booking b WHERE b.student = :student ORDER BY b.scheduledAt DESC", Booking.class);
        q.setParameter("student", student);
        return q.getResultList();
    }

    public List<Booking> findByProfessor(Professor professor) {
        TypedQuery<Booking> q = em.createQuery(
            "SELECT b FROM Booking b WHERE b.professor = :professor ORDER BY b.scheduledAt DESC", Booking.class);
        q.setParameter("professor", professor);
        return q.getResultList();
    }

    public List<Booking> findByProfessorAndStatus(Professor professor, BookingStatus status) {
        TypedQuery<Booking> q = em.createQuery(
            "SELECT b FROM Booking b WHERE b.professor = :professor AND b.status = :status ORDER BY b.scheduledAt DESC", Booking.class);
        q.setParameter("professor", professor);
        q.setParameter("status", status);
        return q.getResultList();
    }

    public List<Booking> findByStudentId(Long studentId) {
        TypedQuery<Booking> q = em.createQuery(
            "SELECT b FROM Booking b WHERE b.student.id = :studentId ORDER BY b.scheduledAt DESC", Booking.class);
        q.setParameter("studentId", studentId);
        return q.getResultList();
    }

    /**
     * Checks if there is a time conflict for the professor around the requested slot.
     * All active (PENDING/ACCEPTED) bookings within a +/- 12h window are fetched and
     * overlap is checked in Java since JPQL temporal arithmetic is not portable.
     */
    public boolean existsConflict(Professor professor, LocalDateTime scheduledAt, int durationMinutes) {
        LocalDateTime windowStart = scheduledAt.minusHours(12);
        LocalDateTime windowEnd = scheduledAt.plusHours(12);

        TypedQuery<Booking> q = em.createQuery(
            "SELECT b FROM Booking b WHERE b.professor = :professor " +
            "AND b.status IN (com.coursconnect.model.enums.BookingStatus.PENDING, com.coursconnect.model.enums.BookingStatus.ACCEPTED) " +
            "AND b.scheduledAt BETWEEN :windowStart AND :windowEnd", Booking.class);
        q.setParameter("professor", professor);
        q.setParameter("windowStart", windowStart);
        q.setParameter("windowEnd", windowEnd);

        List<Booking> candidates = q.getResultList();
        LocalDateTime requestedStart = scheduledAt;
        LocalDateTime requestedEnd = scheduledAt.plusMinutes(durationMinutes);

        for (Booking existing : candidates) {
            LocalDateTime existingStart = existing.getScheduledAt();
            LocalDateTime existingEnd = existingStart.plusMinutes(existing.getOffer().getDurationMinutes());
            if (requestedStart.isBefore(existingEnd) && existingStart.isBefore(requestedEnd)) {
                return true;
            }
        }
        return false;
    }

    public boolean existsConflict(Professor professor, LocalDateTime scheduledAt) {
        TypedQuery<Long> q = em.createQuery(
            "SELECT COUNT(b) FROM Booking b WHERE b.professor = :professor AND b.status IN (" +
            "com.coursconnect.model.enums.BookingStatus.PENDING, com.coursconnect.model.enums.BookingStatus.ACCEPTED) " +
            "AND b.scheduledAt = :scheduledAt", Long.class);
        q.setParameter("professor", professor);
        q.setParameter("scheduledAt", scheduledAt);
        return q.getSingleResult() > 0;
    }

    /**
     * Checks if the student already has an overlapping active booking (PENDING/ACCEPTED)
     * around the requested slot (same +/- 12h window technique as the professor check).
     */
    public boolean existsConflictForStudent(Student student, LocalDateTime scheduledAt, int durationMinutes) {
        LocalDateTime windowStart = scheduledAt.minusHours(12);
        LocalDateTime windowEnd = scheduledAt.plusHours(12);

        TypedQuery<Booking> q = em.createQuery(
            "SELECT b FROM Booking b WHERE b.student = :student " +
            "AND b.status IN (com.coursconnect.model.enums.BookingStatus.PENDING, com.coursconnect.model.enums.BookingStatus.ACCEPTED) " +
            "AND b.scheduledAt BETWEEN :windowStart AND :windowEnd", Booking.class);
        q.setParameter("student", student);
        q.setParameter("windowStart", windowStart);
        q.setParameter("windowEnd", windowEnd);

        LocalDateTime requestedStart = scheduledAt;
        LocalDateTime requestedEnd = scheduledAt.plusMinutes(durationMinutes);
        for (Booking existing : q.getResultList()) {
            LocalDateTime existingStart = existing.getScheduledAt();
            LocalDateTime existingEnd = existingStart.plusMinutes(existing.getOffer().getDurationMinutes());
            if (requestedStart.isBefore(existingEnd) && existingStart.isBefore(requestedEnd)) {
                return true;
            }
        }
        return false;
    }

    public Booking save(Booking booking) {
        if (booking.getId() == null) {
            em.persist(booking);
            return booking;
        }
        return em.merge(booking);
    }

    public List<Booking> findAll() {
        return em.createQuery("SELECT b FROM Booking b ORDER BY b.createdAt DESC", Booking.class)
                .getResultList();
    }

    public long countByStatus(BookingStatus status) {
        TypedQuery<Long> q = em.createQuery(
            "SELECT COUNT(b) FROM Booking b WHERE b.status = :status", Long.class);
        q.setParameter("status", status);
        return q.getSingleResult();
    }
}