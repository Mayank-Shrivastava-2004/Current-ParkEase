package com.parkease.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "verification_tokens")
public class VerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // OTP or verification code
    @Column(nullable = false)
    private String token;

    // Token expiry time
    @Column(nullable = false)
    private LocalDateTime expiryTime;

    // Many tokens can belong to one user (over time)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public VerificationToken() {
    }

    public VerificationToken(String token, LocalDateTime expiryTime, User user) {
        this.token = token;
        this.expiryTime = expiryTime;
        this.user = user;
    }

    // ===== Getters & Setters =====

    public Long getId() {
        return id;
    }

    public String getToken() {
        return token;
    }
 
    public void setToken(String token) {
        this.token = token;
    }

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }
 
    public void setExpiryTime(LocalDateTime expiryTime) {
        this.expiryTime = expiryTime;
    }

    public User getUser() {
        return user;
    }
 
    public void setUser(User user) {
        this.user = user;
    }

    // ===== Utility =====
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryTime);
    }
}

