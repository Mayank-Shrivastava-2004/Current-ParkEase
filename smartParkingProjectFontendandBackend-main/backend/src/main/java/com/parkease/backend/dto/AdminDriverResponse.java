package com.parkease.backend.dto;

import java.time.LocalDateTime;

public class AdminDriverResponse {
    public Long id;
    public String name;
    public String email;
    public String phone;
    public String status; // active | suspended
    public LocalDateTime joinedDate;

    // ===== PLACEHOLDERS (REAL TABLES LATER) =====
    public String vehicleNumber = "N/A";
    public String vehicleType = "N/A";
    public int totalBookings = 0;
    public double walletBalance = 0;
    public double rating = 0;
    public boolean approved;
    public String lastActive = "N/A";
}
