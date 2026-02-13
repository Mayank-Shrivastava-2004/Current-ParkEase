package com.parkease.backend.service;

import com.parkease.backend.entity.ParkingLot;
import com.parkease.backend.entity.User;
import com.parkease.backend.repository.ParkingLotRepository;
import com.parkease.backend.repository.ParkingSlotRepository;
import com.parkease.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class OccupancyService {

    private final ParkingLotRepository parkingLotRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final UserRepository userRepository;

    public OccupancyService(
            ParkingLotRepository parkingLotRepository,
            ParkingSlotRepository parkingSlotRepository,
            UserRepository userRepository
    ) {
        this.parkingLotRepository = parkingLotRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> getProviderOccupancy(String email) {

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        // ✅ FIX: repository returns LIST, not Optional
        List<ParkingLot> lots = parkingLotRepository.findByProvider(provider);

        if (lots.isEmpty()) {
            throw new RuntimeException("No parking lot found for provider");
        }

        ParkingLot lot = lots.get(0); // use primary lot

        long occupied =
                parkingSlotRepository.countByParkingLotAndOccupiedTrue(lot);

        long available =
                parkingSlotRepository.countByParkingLotAndOccupiedFalse(lot);

        long total = occupied + available;

        return Map.of(
                "occupied", occupied,
                "available", available,
                "total", total
        );
    }
}
