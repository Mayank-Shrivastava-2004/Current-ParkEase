package com.parkease.backend.controller;

import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.parkease.backend.entity.User;
import com.parkease.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin
public class ProfileController {

    private final UserRepository userRepository;
    private final com.parkease.backend.repository.BookingRepository bookingRepository;
    private final com.parkease.backend.repository.PaymentRepository paymentRepository;

    public ProfileController(UserRepository userRepository,
            com.parkease.backend.repository.BookingRepository bookingRepository,
            com.parkease.backend.repository.PaymentRepository paymentRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }

    @GetMapping
    public ResponseEntity<?> getProfile(Authentication auth) {
        String email = auth.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();
        Map<String, Object> profile = new HashMap<>();
        profile.put("name", user.getFullName());
        profile.put("email", user.getEmail());
        profile.put("phone", user.getPhoneNumber());
        profile.put("role", user.getRole().name());
        profile.put("address", user.getLocation() != null ? user.getLocation() : "Not Set");
        profile.put("joinedDate", user.getCreatedAt().toLocalDate().toString());

        if (user.getRole() == com.parkease.backend.enumtype.Role.DRIVER) {
            long bookings = bookingRepository.findByDriver(user).size();
            double spent = paymentRepository.sumTotalSpentByDriver(user.getId());
            profile.put("totalBookings", bookings);
            profile.put("totalSpent", spent);
            profile.put("rating", 4.9);

            // Add Vehicle Info
            profile.put("vehicleName", user.getVehicleName());
            profile.put("vehicleNumber", user.getVehicleNumber());
            profile.put("vehicleType", user.getVehicleType());
        } else if (user.getRole() == com.parkease.backend.enumtype.Role.PROVIDER) {
            // Real calculations for provider
            double totalEarnings = paymentRepository.sumTotalEarningsByProvider(user.getId());
            long totalBookings = bookingRepository.countByProvider(user.getId());
            profile.put("totalEarnings", totalEarnings);
            profile.put("totalBookings", totalBookings);
            profile.put("rating", 4.8);

            // Add Provider Info
            profile.put("parkingAreaName", user.getParkingAreaName());
            profile.put("address", user.getLocation() != null ? user.getLocation() : "Not Set");
        } else {
            // Admin or other
            profile.put("totalEarnings", 0);
            profile.put("totalBookings", 0);
            profile.put("rating", 5.0);
        }

        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> updates, Authentication auth) {
        String email = auth.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();
        if (updates.containsKey("name"))
            user.setFullName((String) updates.get("name"));
        if (updates.containsKey("phone"))
            user.setPhoneNumber((String) updates.get("phone"));
        if (updates.containsKey("address")) {
            user.setLocation((String) updates.get("address"));
        }

        // Provider specific fields
        if (updates.containsKey("parkingAreaName")) {
            user.setParkingAreaName((String) updates.get("parkingAreaName"));
        }

        // Update Vehicle Info (Driver)
        if (updates.containsKey("vehicleName"))
            user.setVehicleName((String) updates.get("vehicleName"));
        if (updates.containsKey("vehicleNumber"))
            user.setVehicleNumber((String) updates.get("vehicleNumber"));
        if (updates.containsKey("vehicleType"))
            user.setVehicleType((String) updates.get("vehicleType"));

        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Profile updated successfully");
        return ResponseEntity.ok(response);
    }
}
