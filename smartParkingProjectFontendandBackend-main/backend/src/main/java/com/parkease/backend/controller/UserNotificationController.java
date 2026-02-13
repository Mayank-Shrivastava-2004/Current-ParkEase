package com.parkease.backend.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.parkease.backend.entity.Notification;
import com.parkease.backend.repository.NotificationRepository;

@RestController
@RequestMapping("/api/notifications")
public class UserNotificationController {

    private final NotificationRepository notificationRepository;

    public UserNotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication authentication) {
        // Extract role from authentication (ROLE_DRIVER -> DRIVER)
        String role = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        List<Notification> notifications = notificationRepository.findByTargetRoleOrderByCreatedAtDesc(role);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        String role = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        long count = notificationRepository.countByTargetRoleAndReadFalse(role);
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        n.setRead(true);
        notificationRepository.save(n);
        return ResponseEntity.ok().build();
    }
}
