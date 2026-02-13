package com.parkease.backend.controller;

import com.parkease.backend.service.AdminNotificationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/notifications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    private final AdminNotificationService service;

    public AdminNotificationController(AdminNotificationService service) {
        this.service = service;
    }

    @GetMapping
    public java.util.List<com.parkease.backend.entity.Notification> getNotifications() {
        return service.getNotifications();
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        service.markAsRead(id);
    }

    @GetMapping("/count")
    public long unreadCount() {
        return service.getUnreadCount();
    }

    @PostMapping("/broadcast")
    public void broadcast(@RequestBody com.parkease.backend.dto.BroadcastRequest request) {
        service.sendBroadcast(request.getMessage());
    }
}
