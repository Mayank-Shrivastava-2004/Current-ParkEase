package com.parkease.backend.service;

import com.parkease.backend.entity.Booking;
import com.parkease.backend.entity.User;
import com.parkease.backend.repository.BookingRepository;
import com.parkease.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class PeakHoursService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public PeakHoursService(
            BookingRepository bookingRepository,
            UserRepository userRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    public List<Map<String, Object>> getPeakHours(String email) {

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        List<Booking> bookings =
                bookingRepository.findTodayBookingsForProvider(provider.getId());

        Map<Integer, Integer> hourCount = new HashMap<>();
        LocalDate today = LocalDate.now();

        for (Booking b : bookings) {
            if (!b.getStartTime().toLocalDate().equals(today)) continue;

            int hour = b.getStartTime().getHour();
            hourCount.put(hour, hourCount.getOrDefault(hour, 0) + 1);
        }

        int max = hourCount.values().stream()
                .max(Integer::compareTo)
                .orElse(1);

        List<Map<String, Object>> result = new ArrayList<>();

        hourCount.forEach((hour, count) -> {
            result.add(Map.of(
                    "hour", String.format("%02d:00 - %02d:00", hour, hour + 1),
                    "bookings", count,
                    "percentage", (count * 100) / max
            ));
        });

        result.sort((a, b) ->
                ((Integer) b.get("bookings"))
                        .compareTo((Integer) a.get("bookings"))
        );

        return result;
    }
}
