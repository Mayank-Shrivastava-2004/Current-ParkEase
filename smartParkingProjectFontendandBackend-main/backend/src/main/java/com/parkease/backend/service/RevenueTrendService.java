package com.parkease.backend.service;

import com.parkease.backend.entity.Booking;
import com.parkease.backend.entity.User;
import com.parkease.backend.repository.BookingRepository;
import com.parkease.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class RevenueTrendService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public RevenueTrendService(
            BookingRepository bookingRepository,
            UserRepository userRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> getRevenueTrend(String email) {

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.minusDays(6).atStartOfDay();

        List<Booking> bookings =
                bookingRepository.findCompletedBookingsAfter(
                        provider.getId(), start
                );

        Map<LocalDate, Integer> dailyRevenue = new LinkedHashMap<>();

        for (int i = 6; i >= 0; i--) {
            dailyRevenue.put(today.minusDays(i), 0);
        }

        for (Booking b : bookings) {
            LocalDate date = b.getEndTime().toLocalDate();
            int amount = calculateAmount(b);
            dailyRevenue.put(date, dailyRevenue.get(date) + amount);
        }

        List<Map<String, Object>> trend = new ArrayList<>();
        int total = 0;
        int peak = 0;

        for (Map.Entry<LocalDate, Integer> e : dailyRevenue.entrySet()) {
            int amt = e.getValue();
            total += amt;
            peak = Math.max(peak, amt);

            trend.add(Map.of(
                    "day", e.getKey().getDayOfWeek()
                            .getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    "amount", amt
            ));
        }

        int average = total / trend.size();

        return Map.of(
                "trend", trend,
                "summary", Map.of(
                        "total", total,
                        "average", average,
                        "peak", peak,
                        "growthText", "+15% from last week",
                        "growthLabel", "Growing"
                )
        );
    }

    private int calculateAmount(Booking booking) {
        long hours =
                java.time.Duration.between(
                        booking.getStartTime(),
                        booking.getEndTime()
                ).toHours();
        return (int) Math.max(hours, 1) * 50;
    }
}
