package com.parkease.backend.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkease.backend.dto.ParkingSlotAdminResponse;
import com.parkease.backend.enumtype.VehicleType;
import com.parkease.backend.service.AdminParkingSlotService;

@RestController
@RequestMapping("/api/admin/parking-slots")
@PreAuthorize("hasRole('ADMIN')")
public class AdminParkingSlotController {

    private final AdminParkingSlotService service;

    public AdminParkingSlotController(AdminParkingSlotService service) {
        this.service = service;
    }

    @GetMapping
    public List<ParkingSlotAdminResponse> getSlots(
            @RequestParam VehicleType vehicleType
    ) {
        return service.getSlotsByVehicleType(vehicleType);
    }
}
