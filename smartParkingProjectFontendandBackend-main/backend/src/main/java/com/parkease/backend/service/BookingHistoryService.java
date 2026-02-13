package com.parkease.backend.service;

import com.parkease.backend.dto.BookingHistoryResponse;
import com.parkease.backend.entity.*;
import com.parkease.backend.repository.BookingRepository;
import com.parkease.backend.repository.ParkingLotRepository;
import com.parkease.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class BookingHistoryService {

    private final UserRepository userRepository;
    private final ParkingLotRepository parkingLotRepository;
    private final BookingRepository bookingRepository;

    public BookingHistoryService(
            UserRepository userRepository,
            ParkingLotRepository parkingLotRepository,
            BookingRepository bookingRepository
    ) {
        this.userRepository = userRepository;
        this.parkingLotRepository = parkingLotRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<BookingHistoryResponse> getHistory(String email) {

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        ParkingLot lot = parkingLotRepository.findByProvider(provider)
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Parking lot not found"));

        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd MMM yyyy");

        return bookingRepository.findBookingHistory(lot.getId())
                .stream()
                .map(b -> new BookingHistoryResponse(
                        b.getId(),
                        b.getDriver().getFullName(),
                        b.getVehicleNumber(),
                        b.getParkingSlot().getSlotNumber(),
                        b.getStartTime().format(timeFmt) + " - " +
                                b.getEndTime().format(timeFmt),
                        b.getStatus().name().equals("COMPLETED")
                                ? "Completed"
                                : "Cancelled",
                        "₹" + calculateAmount(b),
                        b.getEndTime().format(dateFmt)
                ))
                .toList();
    }

    private int calculateAmount(Booking b) {
        // 🔑 centralised billing logic (no frontend math)
        long minutes =
                java.time.Duration.between(b.getStartTime(), b.getEndTime()).toMinutes();
        return (int) (minutes * 2); // example ₹2/min
    }
}
