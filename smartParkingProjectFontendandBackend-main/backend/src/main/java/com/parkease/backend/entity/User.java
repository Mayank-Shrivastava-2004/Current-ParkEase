package com.parkease.backend.entity;

import com.parkease.backend.enumtype.Role;
import com.parkease.backend.enumtype.VerificationStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * =====================================================
     * COMMON FIELDS (ALL ROLES)
     * =====================================================
     */

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String phoneNumber;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /*
     * =====================================================
     * APPROVAL & STATUS (CRITICAL)
     * =====================================================
     */

    /**
     * ADMIN -> approved = true
     * DRIVER -> approved = true
     * PROVIDER-> approved = false (until admin approves)
     */
    @Column(nullable = false)
    private boolean approved = false;

    /**
     * Used for suspend / deactivate
     */
    @Column(nullable = false)
    private boolean enabled = true;

    /**
     * ADMIN verification lifecycle
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    /*
     * =====================================================
     * DRIVER SPECIFIC FIELDS
     * =====================================================
     */
    @Column
    private String vehicleName;

    @Column
    private String vehicleNumber;

    @Column
    private String vehicleType; // Car, Bike, SUV, etc.

    /*
     * =====================================================
     * PROVIDER VERIFICATION DETAILS
     * =====================================================
     */

    @Column
    private String parkingAreaName;

    @Column
    private String location;

    @Column
    private Integer totalSlots;

    /**
     * URL / path to ownership or lease document
     */
    @Column
    private String ownershipDocumentUrl;

    /**
     * URL / path to government ID (Aadhar / PAN / etc.)
     */
    @Column
    private String govtIdUrl;

    @Column(nullable = false)
    private Double walletBalance = 0.0;

    /*
     * =====================================================
     * RELATIONS
     * =====================================================
     */

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL)
    private List<ParkingLot> parkingLots;

    /*
     * =====================================================
     * AUDIT
     * =====================================================
     */

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /*
     * =====================================================
     * CONSTRUCTORS
     * =====================================================
     */

    public User() {
    }

    /**
     * Recommended constructor for registration
     */
    public User(
            String fullName,
            String email,
            String phoneNumber,
            String password,
            Role role) {
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.role = role;

        // 🔐 Role-based defaults
        if (role == Role.PROVIDER || role == Role.DRIVER) {
            this.approved = false;
            this.verificationStatus = VerificationStatus.PENDING;
        } else {
            this.approved = true; // ADMIN
            this.verificationStatus = VerificationStatus.APPROVED;
        }
    }

    /*
     * =====================================================
     * GETTERS & SETTERS
     * =====================================================
     */

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getParkingAreaName() {
        return parkingAreaName;
    }

    public void setParkingAreaName(String parkingAreaName) {
        this.parkingAreaName = parkingAreaName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getTotalSlots() {
        return totalSlots;
    }

    public void setTotalSlots(Integer totalSlots) {
        this.totalSlots = totalSlots;
    }

    public String getOwnershipDocumentUrl() {
        return ownershipDocumentUrl;
    }

    public void setOwnershipDocumentUrl(String ownershipDocumentUrl) {
        this.ownershipDocumentUrl = ownershipDocumentUrl;
    }

    public String getGovtIdUrl() {
        return govtIdUrl;
    }

    public void setGovtIdUrl(String govtIdUrl) {
        this.govtIdUrl = govtIdUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<ParkingLot> getParkingLots() {
        return parkingLots;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public void setVehicleName(String vehicleName) {
        this.vehicleName = vehicleName;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public Double getWalletBalance() {
        return walletBalance;
    }

    public void setWalletBalance(Double walletBalance) {
        this.walletBalance = walletBalance;
    }
}
