package com.parkease.backend.dto;

public class ActiveBookingResponse {

    private Long id;
    private String user;
    private String vehicle;
    private String slot;
    private String timeRange;
    private String timeLeft;
    private String status;

    public ActiveBookingResponse(
            Long id,
            String user,
            String vehicle,
            String slot,
            String timeRange,
            String timeLeft,
            String status
    ) {
        this.id = id;
        this.user = user;
        this.vehicle = vehicle;
        this.slot = slot;
        this.timeRange = timeRange;
        this.timeLeft = timeLeft;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getUser() { return user; }
    public String getVehicle() { return vehicle; }
    public String getSlot() { return slot; }
    public String getTimeRange() { return timeRange; }
    public String getTimeLeft() { return timeLeft; }
    public String getStatus() { return status; }
}
