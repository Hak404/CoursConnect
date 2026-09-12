package com.coursconnect.repository;

import com.coursconnect.model.Student;
import com.coursconnect.model.User;

import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;

@Stateless
public class StudentRepository {

    @PersistenceContext
    private EntityManager em;

    public Student findByUser(User user) {
        TypedQuery<Student> q = em.createQuery("SELECT s FROM Student s WHERE s.user = :user", Student.class);
        q.setParameter("user", user);
        List<Student> results = q.getResultList();
        return results.isEmpty() ? null : results.get(0);
    }

    public Student findById(Long id) {
        return em.find(Student.class, id);
    }

    public List<Student> findAll() {
        return em.createQuery("SELECT s FROM Student s ORDER BY s.id", Student.class)
                .getResultList();
    }

    public Student save(Student student) {
        if (student.getId() == null) {
            em.persist(student);
            return student;
        } else {
            return em.merge(student);
        }
    }
}
