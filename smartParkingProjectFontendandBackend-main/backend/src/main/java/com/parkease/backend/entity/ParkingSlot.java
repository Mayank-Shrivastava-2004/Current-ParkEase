package com.parkease.backend.entity;

import com.parkease.backend.enumtype.SlotStatus;
import com.parkease.backend.enumtype.VehicleType;
import jakarta.persistence.*;

@Entity
@Table(name = "parking_slots")
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===== Relation =====
    @ManyToOne(optional = false)
    @JoinColumn(name = "parking_lot_id", nullable = false)
    private ParkingLot parkingLot;

    // ===== Slot Info =====
    @Column(nullable = false)
    private String slotNumber;   // A1, B2, etc.

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType;

    // true → EV-only slot
    @Column(nullable = false)
    private boolean evOnly = false;

    // ===== Availability & Status =====
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlotStatus status = SlotStatus.AVAILABLE;

    @Column(nullable = false)
    private boolean occupied = false;

    // ===== Getters & Setters =====

    public Long getId() {
        return id;
    }

    public ParkingLot getParkingLot() {
        return parkingLot;
    }

    public void setParkingLot(ParkingLot parkingLot) {
        this.parkingLot = parkingLot;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    // 🔑 Alias used by frontend / DTOs
    public String getLabel() {
        return slotNumber;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(VehicleType vehicleType) {
        this.vehicleType = vehicleType;

        // auto-derive EV-only rule
        this.evOnly = vehicleType == VehicleType.EV;
    }

    public boolean isEvOnly() {
        return evOnly;
    }

    public void setEvOnly(boolean evOnly) {
        this.evOnly = evOnly;
    }

    public SlotStatus getStatus() {
        return status;
    }

    public void setStatus(SlotStatus status) {
        this.status = status;
    }

    public boolean isOccupied() {
        return occupied;
    }

    public void setOccupied(boolean occupied) {
        this.occupied = occupied;

        // keep status in sync
        if (occupied) {
            this.status = SlotStatus.OCCUPIED;
        } else if (this.status == SlotStatus.OCCUPIED) {
            this.status = SlotStatus.AVAILABLE;
        }
    }

    // ===== Convenience helpers =====

    public boolean isActive() {
        return status == SlotStatus.AVAILABLE;
    }

    public void deactivate() {
        this.status = SlotStatus.INACTIVE;
    }

    public void activate() {
        this.status = SlotStatus.AVAILABLE;
    }
}
