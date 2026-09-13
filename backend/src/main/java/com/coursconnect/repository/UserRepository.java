package com.coursconnect.repository;

import com.coursconnect.model.User;
import com.coursconnect.model.UserSession;
import com.coursconnect.model.enums.Role;

import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.time.LocalDateTime;
import java.util.List;

@Stateless
public class UserRepository {

    @PersistenceContext
    private EntityManager em;

    public User findByEmail(String email) {
        TypedQuery<User> q = em.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class);
        q.setParameter("email", email);
        List<User> results = q.getResultList();
        return results.isEmpty() ? null : results.get(0);
    }

    public User findById(Long id) {
        return em.find(User.class, id);
    }

    public List<User> findAll() {
        return em.createQuery("SELECT u FROM User u ORDER BY u.createdAt DESC", User.class)
                .getResultList();
    }

    public List<User> findAllByRole(Role role) {
        TypedQuery<User> q = em.createQuery("SELECT u FROM User u WHERE u.role = :role ORDER BY u.createdAt DESC", User.class);
        q.setParameter("role", role);
        return q.getResultList();
    }

    public User save(User user) {
        if (user.getId() == null) {
            em.persist(user);
            return user;
        } else {
            return em.merge(user);
        }
    }

    public void delete(Long id) {
        User user = em.find(User.class, id);
        if (user != null) {
            em.remove(user);
        }
    }

    public UserSession findValidSession(String token) {
        TypedQuery<UserSession> q = em.createQuery(
            "SELECT s FROM UserSession s WHERE s.token = :token AND s.expiresAt > :now",
            UserSession.class);
        q.setParameter("token", token);
        q.setParameter("now", LocalDateTime.now());
        List<UserSession> results = q.getResultList();
        return results.isEmpty() ? null : results.get(0);
    }

    public UserSession createSession(User user) {
        UserSession session = new UserSession();
        session.setUser(user);
        session.setToken(com.coursconnect.config.PasswordUtil.generateToken());
        session.setExpiresAt(LocalDateTime.now().plusDays(7));
        em.persist(session);
        return session;
    }

    public void invalidateSession(String token) {
        em.createQuery("DELETE FROM UserSession s WHERE s.token = :token")
                .setParameter("token", token)
                .executeUpdate();
    }

    public void invalidateAllSessions(User user) {
        em.createQuery("DELETE FROM UserSession s WHERE s.user = :user")
                .setParameter("user", user)
                .executeUpdate();
    }

    public long countAll() {
        return em.createQuery("SELECT COUNT(u) FROM User u", Long.class).getSingleResult();
    }

    public long countByRole(Role role) {
        TypedQuery<Long> q = em.createQuery("SELECT COUNT(u) FROM User u WHERE u.role = :role", Long.class);
        q.setParameter("role", role);
        return q.getSingleResult();
    }

    public BooleanCountResult countProfessorsVerified() {
        TypedQuery<Object[]> q = em.createQuery(
            "SELECT p.verified, COUNT(p) FROM Professor p GROUP BY p.verified", Object[].class);
        BooleanCountResult result = new BooleanCountResult();
        for (Object[] row : q.getResultList()) {
            if (Boolean.TRUE.equals(row[0])) {
                result.trueCount = ((Number) row[1]).longValue();
            } else {
                result.falseCount = ((Number) row[1]).longValue();
            }
        }
        return result;
    }

    public static class BooleanCountResult {
        public long trueCount = 0;
        public long falseCount = 0;
    }
}
