package com.parkease.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import com.parkease.backend.dto.AdminParkingSlot;
import com.parkease.backend.dto.ParkingSlotAdminResponse;
import com.parkease.backend.entity.ParkingSlot;
import com.parkease.backend.enumtype.VehicleType;
import com.parkease.backend.repository.ParkingSlotRepository;

@Service
public class AdminParkingSlotService {

    private final ParkingSlotRepository parkingSlotRepository;

    public AdminParkingSlotService(ParkingSlotRepository parkingSlotRepository) {
        this.parkingSlotRepository = parkingSlotRepository;
    }

    public List<ParkingSlotAdminResponse> getSlotsByVehicleType(
            VehicleType vehicleType
    ) {
        return parkingSlotRepository
                .findByVehicleType(vehicleType)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    private ParkingSlotAdminResponse mapToDto(ParkingSlot slot) {
        ParkingSlotAdminResponse dto = new ParkingSlotAdminResponse();
        dto.id = slot.getId().toString();
        dto.label = slot.getLabel();
        dto.status = slot.getStatus().name();
        dto.vehicleType = slot.getVehicleType().name();
        return dto;
    }
}
