package com.parkease.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "parking_lots")
public class ParkingLot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===== Ownership =====
    @ManyToOne(optional = false)
    @JoinColumn(name = "provider_id")
    private User provider;

    // ===== Basic Info =====
    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 500)
    private String address;

    private String city;
    private String state;

    // ===== Capacity =====
    @Column(nullable = false)
    private int totalSlots;

    @Column(nullable = false)
    private boolean evSupported;

    // ===== Status =====
    @Column(nullable = false)
    private boolean active = true;

    // ===== Audit =====
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ===== Mapping =====
    @OneToMany(mappedBy = "parkingLot", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ParkingSlot> slots;

    // ===== Getters & Setters =====

    public Long getId() {
        return id;
    }

    public User getProvider() {
        return provider;
    }

    public void setProvider(User provider) {
        this.provider = provider;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }
 
    public void setAddress(String address) {
        this.address = address;
    }
      public String getCity() {
        return city;
    }
 
    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }
 
    public void setState(String state) {
        this.state = state;
    }
    public int getTotalSlots() {
        return totalSlots;
    }

    public void setTotalSlots(int totalSlots) {
        this.totalSlots = totalSlots;
    }

    public boolean isEvSupported() {
        return evSupported;
    }

    public void setEvSupported(boolean evSupported) {
        this.evSupported = evSupported;
    }

    public boolean isActive() {
        return active;
    }
     public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<ParkingSlot> getSlots() {
        return slots;
    }
}
