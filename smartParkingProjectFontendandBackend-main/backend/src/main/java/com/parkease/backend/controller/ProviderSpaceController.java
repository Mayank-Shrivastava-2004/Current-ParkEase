package com.parkease.backend.controller;

import com.parkease.backend.entity.ParkingLot;
import com.parkease.backend.entity.ParkingSlot;
import com.parkease.backend.entity.User;
import com.parkease.backend.enumtype.SlotStatus;
import com.parkease.backend.enumtype.VehicleType;
import com.parkease.backend.repository.ParkingLotRepository;
import com.parkease.backend.repository.ParkingSlotRepository;
import com.parkease.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/provider/slots")
@PreAuthorize("hasRole('PROVIDER')")
public class ProviderSpaceController {

    private final UserRepository userRepository;
    private final ParkingLotRepository parkingLotRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    public ProviderSpaceController(UserRepository userRepository, ParkingLotRepository parkingLotRepository,
            ParkingSlotRepository parkingSlotRepository) {
        this.userRepository = userRepository;
        this.parkingLotRepository = parkingLotRepository;
        this.parkingSlotRepository = parkingSlotRepository;
    }

    private ParkingLot getOrCreateMainLot(User provider) {
        List<ParkingLot> lots = parkingLotRepository.findByProvider(provider);
        if (!lots.isEmpty()) {
            return lots.get(0);
        }
        // Create default lot
        ParkingLot lot = new ParkingLot();
        lot.setProvider(provider);
        lot.setName(provider.getParkingAreaName() != null ? provider.getParkingAreaName() : "Main Lot");
        lot.setAddress(provider.getLocation() != null ? provider.getLocation() : "Unknown Location");
        lot.setTotalSlots(0);
        lot.setEvSupported(false);
        return parkingLotRepository.save(lot);
    }

    @GetMapping
    public ResponseEntity<?> getSlots(Authentication auth) {
        String email = auth.getName();
        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        ParkingLot lot = getOrCreateMainLot(provider);
        List<ParkingSlot> slots = parkingSlotRepository.findByParkingLot(lot);

        // Convert to DTO/Map
        List<Map<String, Object>> response = new ArrayList<>();
        for (ParkingSlot slot : slots) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", slot.getId());
            map.put("slotCode", slot.getSlotNumber());
            map.put("slotType", slot.getVehicleType().toString());
            map.put("status", slot.getStatus().toString());
            map.put("isOccupied", slot.isOccupied());
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> addSlot(@RequestBody Map<String, String> payload, Authentication auth) {
        String email = auth.getName();
        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        ParkingLot lot = getOrCreateMainLot(provider);

        ParkingSlot slot = new ParkingSlot();
        slot.setParkingLot(lot);
        slot.setSlotNumber(payload.get("slotCode"));
        slot.setVehicleType(VehicleType.valueOf(payload.get("slotType"))); // Ensure frontend sends correct enum string
        slot.setStatus(SlotStatus.AVAILABLE);

        parkingSlotRepository.save(slot);

        // Update lot totals
        long count = parkingSlotRepository.countByParkingLot(lot);
        lot.setTotalSlots((int) count);
        parkingLotRepository.save(lot);

        return ResponseEntity.ok(Map.of("message", "Slot added successfully"));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggleSlot(@PathVariable Long id) {
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (slot.getStatus() == SlotStatus.AVAILABLE) {
            slot.setStatus(SlotStatus.INACTIVE);
        } else if (slot.getStatus() == SlotStatus.INACTIVE) {
            slot.setStatus(SlotStatus.AVAILABLE);
        }

        parkingSlotRepository.save(slot);
        return ResponseEntity.ok(Map.of("message", "Slot toggled", "status", slot.getStatus()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id) {
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        ParkingLot lot = slot.getParkingLot();
        parkingSlotRepository.delete(slot);

        // Update lot totals
        long count = parkingSlotRepository.countByParkingLot(lot);
        lot.setTotalSlots((int) count);
        parkingLotRepository.save(lot);

        return ResponseEntity.ok(Map.of("message", "Slot deleted"));
    }
}
