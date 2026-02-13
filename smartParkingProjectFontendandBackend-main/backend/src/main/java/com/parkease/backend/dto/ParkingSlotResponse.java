package com.parkease.backend.dto;

public class ParkingSlotResponse {

    private Long id;
    private String label;
    private String type;
    private String status;

    public ParkingSlotResponse(Long id, String label, String type, String status) {
        this.id = id;
        this.label = label;
        this.type = type;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getLabel() { return label; }
    public String getType() { return type; }
    public String getStatus() { return status; }
}
