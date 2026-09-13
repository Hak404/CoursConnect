package com.coursconnect.repository;

import com.coursconnect.model.Notification;
import com.coursconnect.model.User;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;

@Stateless
public class NotificationRepository {

    @PersistenceContext
    private EntityManager em;

    public List<Notification> findByUser(User user) {
        TypedQuery<Notification> q = em.createQuery(
            "SELECT n FROM Notification n WHERE n.user = :user ORDER BY n.createdAt DESC", Notification.class);
        q.setParameter("user", user);
        return q.getResultList();
    }

    public List<Notification> findByUserId(Long userId) {
        TypedQuery<Notification> q = em.createQuery(
            "SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC", Notification.class);
        q.setParameter("userId", userId);
        return q.getResultList();
    }

    public long countUnread(User user) {
        TypedQuery<Long> q = em.createQuery(
            "SELECT COUNT(n) FROM Notification n WHERE n.user = :user AND n.read = false", Long.class);
        q.setParameter("user", user);
        return q.getSingleResult();
    }

    public Notification save(Notification notification) {
        if (notification.getId() == null) {
            em.persist(notification);
            return notification;
        }
        return em.merge(notification);
    }

    public Notification findById(Long id) {
        return em.find(Notification.class, id);
    }

    public Notification findByIdAndUser(Long id, User user) {
        TypedQuery<Notification> q = em.createQuery(
            "SELECT n FROM Notification n WHERE n.id = :id AND n.user = :user", Notification.class);
        q.setParameter("id", id);
        q.setParameter("user", user);
        List<Notification> result = q.getResultList();
        return result.isEmpty() ? null : result.get(0);
    }

    public void markAllRead(User user) {
        em.createQuery("UPDATE Notification n SET n.read = true WHERE n.user = :user")
                .setParameter("user", user)
                .executeUpdate();
    }
}