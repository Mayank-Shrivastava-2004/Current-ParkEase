package com.parkease.backend.service;

import com.parkease.backend.dto.ActiveBookingResponse;
import com.parkease.backend.dto.LiveStatusResponse;
import com.parkease.backend.entity.*;
import com.parkease.backend.enumtype.BookingStatus;
import com.parkease.backend.repository.BookingRepository;
import com.parkease.backend.repository.ParkingLotRepository;
import com.parkease.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class LiveStatusService {

    private final UserRepository userRepository;
    private final ParkingLotRepository parkingLotRepository;
    private final BookingRepository bookingRepository;

    public LiveStatusService(
            UserRepository userRepository,
            ParkingLotRepository parkingLotRepository,
            BookingRepository bookingRepository
    ) {
        this.userRepository = userRepository;
        this.parkingLotRepository = parkingLotRepository;
        this.bookingRepository = bookingRepository;
    }

    public LiveStatusResponse getLiveStatus(String email) {

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        ParkingLot lot = parkingLotRepository.findByProvider(provider)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Parking lot not found"));

        List<Booking> activeBookings =
          bookingRepository.findActiveBookingsForLot(
        lot.getId(),
        List.of(BookingStatus.ACTIVE, BookingStatus.EXITING)
);



        int occupied = (int) activeBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.ACTIVE)
                .count();

        int exiting = (int) activeBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.EXITING)
                .count();

        int available = lot.getTotalSlots() - occupied;

        List<ActiveBookingResponse> bookings = activeBookings.stream().map(b -> {

            String timeRange =
                    b.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm"))
                            + " - " +
                            b.getEndTime().format(DateTimeFormatter.ofPattern("HH:mm"));

            long minutesLeft =
                    Duration.between(LocalDateTime.now(), b.getEndTime()).toMinutes();

            String timeLeft =
                    minutesLeft <= 0
                            ? "Ending"
                            : minutesLeft > 60
                                ? (minutesLeft / 60) + "h " + (minutesLeft % 60) + "m"
                                : minutesLeft + " mins";

            return new ActiveBookingResponse(
                    b.getId(),
                    b.getDriver().getFullName(),
                    b.getVehicleNumber(),
                    b.getParkingSlot().getSlotNumber(), // ✅ FIXED
                    timeRange,
                    timeLeft,
                    b.getStatus() == BookingStatus.EXITING // ✅ FIXED
                            ? "departing"
                            : "parking"
            );
        }).toList();

        return new LiveStatusResponse(
                new LiveStatusResponse.Stats(occupied, available, exiting),
                bookings
        );
    }
}
