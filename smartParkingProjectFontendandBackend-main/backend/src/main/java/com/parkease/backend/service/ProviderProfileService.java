package com.parkease.backend.service;

import com.parkease.backend.dto.ProviderProfileResponse;
import com.parkease.backend.entity.ParkingLot;
import com.parkease.backend.entity.User;
import com.parkease.backend.repository.ParkingLotRepository;
import com.parkease.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class ProviderProfileService {

    private final UserRepository userRepository;
    private final ParkingLotRepository parkingLotRepository;

    public ProviderProfileService(
            UserRepository userRepository,
            ParkingLotRepository parkingLotRepository
    ) {
        this.userRepository = userRepository;
        this.parkingLotRepository = parkingLotRepository;
    }

    public ProviderProfileResponse getProfile(String email) {

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        ParkingLot lot = parkingLotRepository
                .findByProvider(provider)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Parking lot not found"));

        // ✅ FULL ADDRESS BUILT IN BACKEND (NO HARDCODING)
        String fullAddress =
                lot.getAddress()
                + (lot.getCity() != null && !lot.getCity().isBlank() ? ", " + lot.getCity() : "")
                + (lot.getState() != null && !lot.getState().isBlank() ? ", " + lot.getState() : "");

        return new ProviderProfileResponse(
                provider.getFullName(),
                lot.getName(),
                fullAddress,
                provider.getEmail(),
                provider.getPhoneNumber(),
                provider.isApproved()
        );
    }
}
