package com.coursconnect.repository;

import com.coursconnect.model.Booking;
import com.coursconnect.model.Professor;
import com.coursconnect.model.Review;
import com.coursconnect.model.Student;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;

@Stateless
public class ReviewRepository {

    @PersistenceContext
    private EntityManager em;

    public Review findById(Long id) {
        return em.find(Review.class, id);
    }

    public Review findByBooking(Booking booking) {
        TypedQuery<Review> q = em.createQuery(
            "SELECT r FROM Review r WHERE r.booking = :booking", Review.class);
        q.setParameter("booking", booking);
        List<Review> results = q.getResultList();
        return results.isEmpty() ? null : results.get(0);
    }

    public List<Review> findByProfessor(Professor professor) {
        TypedQuery<Review> q = em.createQuery(
            "SELECT r FROM Review r WHERE r.professor = :professor ORDER BY r.createdAt DESC", Review.class);
        q.setParameter("professor", professor);
        return q.getResultList();
    }

    public List<Review> findByProfessorId(Long professorId) {
        TypedQuery<Review> q = em.createQuery(
            "SELECT r FROM Review r WHERE r.professor.id = :professorId ORDER BY r.createdAt DESC", Review.class);
        q.setParameter("professorId", professorId);
        return q.getResultList();
    }

    public List<Review> findByStudent(Student student) {
        TypedQuery<Review> q = em.createQuery(
            "SELECT r FROM Review r WHERE r.student = :student ORDER BY r.createdAt DESC", Review.class);
        q.setParameter("student", student);
        return q.getResultList();
    }

    public Review save(Review review) {
        if (review.getId() == null) {
            em.persist(review);
            return review;
        }
        return em.merge(review);
    }

    public void delete(Long id) {
        Review review = em.find(Review.class, id);
        if (review != null) {
            em.remove(review);
        }
    }

    public List<Review> findAll() {
        return em.createQuery("SELECT r FROM Review r ORDER BY r.createdAt DESC", Review.class)
                .getResultList();
    }
}