package com.parkease.backend.dto;

public class ProviderProfileResponse {

    private String ownerName;
    private String parkingAreaName;
    private String location;
    private String email;
    private String phone;
    private boolean verified;

    public ProviderProfileResponse(
            String ownerName,
            String parkingAreaName,
            String location,
            String email,
            String phone,
            boolean verified
    ) {
        this.ownerName = ownerName;
        this.parkingAreaName = parkingAreaName;
        this.location = location;
        this.email = email;
        this.phone = phone;
        this.verified = verified;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public String getParkingAreaName() {
        return parkingAreaName;
    }

    public String getLocation() {
        return location;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public boolean isVerified() {
        return verified;
    }
}
