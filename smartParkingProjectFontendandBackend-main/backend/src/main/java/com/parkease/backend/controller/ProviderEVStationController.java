package com.parkease.backend.controller;

import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/provider/ev-station")
@PreAuthorize("hasRole('PROVIDER')")
public class ProviderEVStationController {

    private final com.parkease.backend.repository.UserRepository userRepository;
    private final com.parkease.backend.repository.ParkingSlotRepository parkingSlotRepository;
    private final com.parkease.backend.repository.BookingRepository bookingRepository;

    public ProviderEVStationController(com.parkease.backend.repository.UserRepository userRepository,
            com.parkease.backend.repository.ParkingSlotRepository parkingSlotRepository,
            com.parkease.backend.repository.BookingRepository bookingRepository) {
        this.userRepository = userRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping
    public ResponseEntity<?> getEVStationData(Authentication auth) {
        String email = auth.getName();
        com.parkease.backend.entity.User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        List<com.parkease.backend.entity.ParkingLot> lots = provider.getParkingLots();

        long totalChargers = 0;
        long activeChargers = 0; // Occupied
        long inUse = 0;
        long available = 0;
        long totalSessions = 0;
        long energyDelivered = 0; // Simulated based on sessions

        List<Map<String, Object>> chargersList = new ArrayList<>();

        for (com.parkease.backend.entity.ParkingLot lot : lots) {
            List<com.parkease.backend.entity.ParkingSlot> evSlots = parkingSlotRepository
                    .findByParkingLotAndVehicleType(lot, com.parkease.backend.enumtype.VehicleType.EV);

            for (com.parkease.backend.entity.ParkingSlot slot : evSlots) {
                totalChargers++;
                if (slot.isOccupied()) {
                    activeChargers++;
                    inUse++;
                } else {
                    if (slot.isActive()) {
                        available++;
                    }
                }

                Map<String, Object> chargerMap = new HashMap<>();
                chargerMap.put("id", slot.getSlotNumber());
                chargerMap.put("type", "Standard EV"); // Could be enhanced with more details if available
                chargerMap.put("status", slot.isOccupied() ? "in-use" : (slot.isActive() ? "available" : "offline"));
                chargerMap.put("power", 22); // Default kW
                chargerMap.put("currentSession", slot.isOccupied() ? 45 : 0); // Mock duration for current session
                chargersList.add(chargerMap);
            }
        }

        // Total historical sessions
        totalSessions = bookingRepository.countByParkingLot_Provider_IdAndParkingSlot_VehicleType(provider.getId(),
                com.parkease.backend.enumtype.VehicleType.EV);
        energyDelivered = totalSessions * 15; // Estimating 15kWh per session average

        // Summary stats
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalChargers", totalChargers);
        summary.put("activeChargers", activeChargers);
        summary.put("inUse", inUse);
        summary.put("available", available);
        summary.put("totalSessions", totalSessions);
        summary.put("energyDelivered", energyDelivered);

        // Usage chart data (Real daily sessions count)
        List<Map<String, Object>> usageData = new ArrayList<>();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime weekAgo = now.minusDays(6).with(java.time.LocalTime.MIN);

        List<com.parkease.backend.entity.Booking> recentBookings = bookingRepository
                .findByParkingLot_Provider_IdAndStartTimeBetween(provider.getId(), weekAgo, now);

        String[] dayLabels = { "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };

        for (int i = 6; i >= 0; i--) {
            java.time.LocalDateTime dayStart = now.minusDays(i).with(java.time.LocalTime.MIN);
            java.time.LocalDateTime dayEnd = now.minusDays(i).with(java.time.LocalTime.MAX);

            long sessions = recentBookings.stream()
                    .filter(b -> b.getParkingSlot().getVehicleType() == com.parkease.backend.enumtype.VehicleType.EV)
                    .filter(b -> !b.getCreatedAt().isBefore(dayStart) && !b.getCreatedAt().isAfter(dayEnd))
                    .count();

            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("day", dayLabels[dayStart.getDayOfWeek().getValue() % 7]);
            dayMap.put("sessions", sessions);
            usageData.add(dayMap);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("summary", summary);
        response.put("chargers", chargersList);
        response.put("usageData", usageData);

        return ResponseEntity.ok(response);
    }
}
