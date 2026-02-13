package com.parkease.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = true)
    private String type; // e.g., "PROVIDER_REGISTRATION", "INFO"

    @Column(nullable = true)
    private Long refId; // e.g., Provider ID

    // ADMIN / PROVIDER
    @Column(nullable = false)
    private String targetRole;

    @Column(nullable = false)
    private boolean read = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /* ================= CONSTRUCTORS ================= */

    public Notification() {
        // JPA requires empty constructor
    }

    // ✅ THIS IS WHAT YOUR SERVICE NEEDS
    public Notification(String message, String targetRole) {
        this.message = message;
        this.targetRole = targetRole;
        this.read = false;
        this.createdAt = LocalDateTime.now();
    }

    /* ================= GETTERS & SETTERS ================= */

    public Long getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public boolean isRead() {
        return read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getRefId() {
        return refId;
    }

    public void setRefId(Long refId) {
        this.refId = refId;
    }
}
