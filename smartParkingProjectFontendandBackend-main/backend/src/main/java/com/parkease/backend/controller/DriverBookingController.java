package com.parkease.backend.controller;

import com.parkease.backend.entity.Booking;
import com.parkease.backend.entity.User;
import com.parkease.backend.repository.BookingRepository;
import com.parkease.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/driver/bookings")
public class DriverBookingController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final com.parkease.backend.service.BookingService bookingService;
    private final com.parkease.backend.service.PaymentService paymentService;
    private final com.parkease.backend.repository.ParkingLotRepository parkingLotRepository;
    private final com.parkease.backend.repository.ParkingSlotRepository parkingSlotRepository;

    public DriverBookingController(BookingRepository bookingRepository,
            UserRepository userRepository,
            com.parkease.backend.service.BookingService bookingService,
            com.parkease.backend.service.PaymentService paymentService,
            com.parkease.backend.repository.ParkingLotRepository parkingLotRepository,
            com.parkease.backend.repository.ParkingSlotRepository parkingSlotRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.bookingService = bookingService;
        this.paymentService = paymentService;
        this.parkingLotRepository = parkingLotRepository;
        this.parkingSlotRepository = parkingSlotRepository;
    }

    @GetMapping
    public ResponseEntity<?> getMyBookings(Authentication auth) {
        String email = auth.getName();
        User driver = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Driver not found"));
        List<Booking> bookings = bookingRepository.findByDriver(driver);
        return ResponseEntity.ok(bookings);
    }

    @org.springframework.web.bind.annotation.PostMapping
    public ResponseEntity<?> createBooking(@RequestBody java.util.Map<String, Object> payload, Authentication auth) {
        try {
            String email = auth.getName();
            User driver = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Driver not found"));

            Long lotId = Long.parseLong(payload.get("parkingLotId").toString());
            com.parkease.backend.entity.ParkingLot lot = parkingLotRepository.findById(lotId)
                    .orElseThrow(() -> new RuntimeException("Parking Lot not found"));

            double totalAmount = Double.parseDouble(payload.get("totalAmount").toString());

            // Check balance
            if (driver.getWalletBalance() < totalAmount) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Insufficient wallet balance"));
            }

            // Find first available slot in this lot
            com.parkease.backend.entity.ParkingSlot slot = parkingSlotRepository.findByParkingLot(lot)
                    .stream()
                    .filter(s -> !s.isOccupied())
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No available slots found in this lot"));

            // 1. Create Booking
            Booking booking = bookingService.startBooking(driver, lot, slot);
            booking.setVehicleNumber(payload.get("vehicleNumber").toString());
            // booking.setTotalAmount(totalAmount); // Removed - field does not exist in Booking entity
            bookingRepository.save(booking);

            // 2. Process Payment (Deductions & Graph Tracking)
            paymentService.createPayment(booking, totalAmount, totalAmount * 0.1, "WALLET");

            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }
}

