package com.parkease.backend.service;

import com.parkease.backend.entity.Booking;
import com.parkease.backend.entity.User;
import com.parkease.backend.repository.BookingRepository;
import com.parkease.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class EarningsService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public EarningsService(BookingRepository bookingRepository,
                           UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> getProviderEarnings(String email) {

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        List<Booking> bookings =
                bookingRepository.findCompletedBookingsForProvider(provider.getId());

        double today = 0;
        double week = 0;
        double month = 0;

        LocalDate now = LocalDate.now();

        for (Booking b : bookings) {
            LocalDate date = b.getEndTime().toLocalDate();
            double amount = calculateAmount(b);

            if (date.equals(now)) today += amount;
            if (!date.isBefore(now.minusDays(7))) week += amount;
            if (!date.isBefore(now.minusDays(30))) month += amount;
        }

        Map<String, Object> response = new HashMap<>();

        response.put("summary", Map.of(
                "today", Map.of("amount", format(today), "trend", "+8%"),
                "week", Map.of("amount", format(week), "trend", "+12%"),
                "month", Map.of("amount", format(month), "trend", "+5%")
        ));

        response.put("balance", format(month));

        response.put("recent", buildRecent(bookings));

        return response;
    }

    /* ===== Helpers ===== */

    private double calculateAmount(Booking booking) {
        long hours =
                java.time.Duration.between(
                        booking.getStartTime(),
                        booking.getEndTime()
                ).toHours();

        return Math.max(hours, 1) * 50; // example rate logic
    }

    private String format(double value) {
        return "₹" + String.format("%,.0f", value);
    }

    private List<Map<String, Object>> buildRecent(List<Booking> bookings) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM, yyyy");

        List<Map<String, Object>> list = new ArrayList<>();

        bookings.stream()
                .sorted(Comparator.comparing(Booking::getEndTime).reversed())
                .limit(5)
                .forEach(b -> {
                    list.add(Map.of(
                            "id", b.getId(),
                            "date", b.getEndTime().toLocalDate().format(fmt),
                            "slots", 1,
                            "amount", format(calculateAmount(b))
                    ));
                });

        return list;
    }
}
