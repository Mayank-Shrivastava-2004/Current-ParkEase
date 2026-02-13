package com.parkease.backend.dto;

public class BookingHistoryResponse {

    private Long id;
    private String user;
    private String vehicle;
    private String slot;
    private String timeRange;
    private String status;
    private String amount;
    private String date;

    public BookingHistoryResponse(
            Long id,
            String user,
            String vehicle,
            String slot,
            String timeRange,
            String status,
            String amount,
            String date
    ) {
        this.id = id;
        this.user = user;
        this.vehicle = vehicle;
        this.slot = slot;
        this.timeRange = timeRange;
        this.status = status;
        this.amount = amount;
        this.date = date;
    }

    public Long getId() { return id; }
    public String getUser() { return user; }
    public String getVehicle() { return vehicle; }
    public String getSlot() { return slot; }
    public String getTimeRange() { return timeRange; }
    public String getStatus() { return status; }
    public String getAmount() { return amount; }
    public String getDate() { return date; }
}
