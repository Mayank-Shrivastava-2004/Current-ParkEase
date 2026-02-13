package com.parkease.backend.service;

import com.parkease.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminNotificationService {

    private final NotificationRepository repository;

    public AdminNotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    public long getUnreadCount() {
        return repository.countByTargetRoleAndReadFalse("ADMIN");
    }

    public java.util.List<com.parkease.backend.entity.Notification> getNotifications() {
        return repository.findByTargetRoleOrderByCreatedAtDesc("ADMIN");
    }

    public void markAsRead(Long id) {
        com.parkease.backend.entity.Notification n = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        repository.save(n);
    }

    public void sendBroadcast(String message) {
        // Send to all drivers
        repository.save(new com.parkease.backend.entity.Notification(message, "DRIVER"));
        // Send to all providers
        repository.save(new com.parkease.backend.entity.Notification(message, "PROVIDER"));
    }
}
