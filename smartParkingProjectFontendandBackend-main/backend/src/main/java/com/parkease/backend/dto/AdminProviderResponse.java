package com.parkease.backend.dto;

import java.time.LocalDateTime;

public class AdminProviderResponse {
    public Long id;
    public String name;
    public String ownerName;
    public String email;
    public String phone;
    public String status; // pending | approved | suspended | rejected
    public LocalDateTime appliedDate;

    // ===== Hub Details =====
    public String parkingAreaName;
    public String location;
    public int totalSlots = 0;

    // ===== Stats (Placeholders) =====
    public int occupiedSlots = 0;
    public int evChargers = 0;
    public double pricePerHour = 0;
    public double revenue = 0;
    public int complaints = 0;
    public double rating = 0;
    public String uptime = "N/A";
}
