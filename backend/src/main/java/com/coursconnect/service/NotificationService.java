package com.coursconnect.service;

import com.coursconnect.dto.NotificationDTO;
import com.coursconnect.model.Notification;
import com.coursconnect.model.User;
import com.coursconnect.repository.NotificationRepository;
import com.coursconnect.repository.UserRepository;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class NotificationService {

    @EJB
    private NotificationRepository notificationRepository;

    @EJB
    private UserRepository userRepository;

    public List<NotificationDTO> getForUser(Long userId) {
        return notificationRepository.findByUserId(userId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public long countUnread(Long userId) {
        User user = userRepository.findById(userId);
        return user == null ? 0 : notificationRepository.countUnread(user);
    }

    public void markAllRead(Long userId) {
        User user = userRepository.findById(userId);
        if (user != null) {
            notificationRepository.markAllRead(user);
        }
    }

    public boolean markRead(Long userId, Long notificationId) {
        User user = userRepository.findById(userId);
        if (user == null) return false;
        Notification n = notificationRepository.findByIdAndUser(notificationId, user);
        if (n == null) return false;
        if (!n.isRead()) {
            n.setRead(true);
            notificationRepository.save(n);
        }
        return true;
    }

    public void notify(Long userId, String title, String message, String type) {
        notify(userId, title, message, type, null);
    }

    public void notify(Long userId, String title, String message, String type, Long referenceId) {
        User user = userRepository.findById(userId);
        if (user == null) return;
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setReferenceId(referenceId);
        notificationRepository.save(n);
    }

    private NotificationDTO toDTO(Notification n) {
        return new NotificationDTO(n.getId(), n.getTitle(), n.getMessage(),
                n.getType(), n.getReferenceId(), n.isRead(), n.getCreatedAt());
    }
}