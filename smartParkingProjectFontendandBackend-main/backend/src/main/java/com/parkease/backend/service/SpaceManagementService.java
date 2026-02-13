package com.parkease.backend.service;

import com.parkease.backend.dto.CreateParkingSlotRequest;
import com.parkease.backend.dto.ParkingSlotResponse;
import com.parkease.backend.entity.ParkingLot;
import com.parkease.backend.entity.ParkingSlot;
import com.parkease.backend.entity.User;
import com.parkease.backend.enumtype.SlotStatus;
import com.parkease.backend.enumtype.VehicleType;
import com.parkease.backend.repository.ParkingLotRepository;
import com.parkease.backend.repository.ParkingSlotRepository;
import com.parkease.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpaceManagementService {

    private final UserRepository userRepository;
    private final ParkingLotRepository parkingLotRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    public SpaceManagementService(
            UserRepository userRepository,
            ParkingLotRepository parkingLotRepository,
            ParkingSlotRepository parkingSlotRepository
    ) {
        this.userRepository = userRepository;
        this.parkingLotRepository = parkingLotRepository;
        this.parkingSlotRepository = parkingSlotRepository;
    }

    /* ================= HELPER METHODS ================= */

    private ParkingLot getProviderLot(String email) {
        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        return parkingLotRepository.findByProvider(provider)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Parking lot not found"));
    }

    private VehicleType parseVehicleType(String type) {
        try {
            return VehicleType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid vehicle type: " + type);
        }
    }

    /* ================= API METHODS ================= */

    public List<ParkingSlotResponse> getSlots(String email) {
        ParkingLot lot = getProviderLot(email);

        return parkingSlotRepository.findByParkingLot(lot)
                .stream()
                .map(slot -> new ParkingSlotResponse(
                        slot.getId(),
                        slot.getSlotNumber(),                              // ✅ CORRECT
                        slot.getVehicleType().name().toLowerCase(),
                        slot.getStatus() == SlotStatus.AVAILABLE
                                ? "active"
                                : "inactive"
                ))
                .toList();
    }

    public void addSlot(String email, CreateParkingSlotRequest req) {
        ParkingLot lot = getProviderLot(email);

      if (parkingSlotRepository
        .existsBySlotNumberIgnoreCaseAndParkingLot_Id(
                req.getLabel(),
                lot.getId()
        )) {
    throw new RuntimeException("Duplicate slot label");
}


        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber(req.getLabel());                    // ✅ FIXED
        slot.setVehicleType(parseVehicleType(req.getType()));
        slot.setStatus(SlotStatus.AVAILABLE);                  // ✅ FIXED
        slot.setParkingLot(lot);

        parkingSlotRepository.save(slot);
    }

    public void toggleSlot(String email, Long slotId) {
        ParkingLot lot = getProviderLot(email);

        ParkingSlot slot = parkingSlotRepository
                .findByIdAndParkingLot(slotId, lot)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (slot.getStatus() == SlotStatus.AVAILABLE) {
            slot.setStatus(SlotStatus.INACTIVE);               // ✅ FIXED
        } else {
            slot.setStatus(SlotStatus.AVAILABLE);              // ✅ FIXED
        }

        parkingSlotRepository.save(slot);
    }

    public void deleteSlot(String email, Long slotId) {
        ParkingLot lot = getProviderLot(email);

        ParkingSlot slot = parkingSlotRepository
                .findByIdAndParkingLot(slotId, lot)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        parkingSlotRepository.delete(slot);
    }
}
