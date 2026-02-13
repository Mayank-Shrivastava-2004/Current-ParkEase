package com.parkease.backend.controller;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkease.backend.entity.Booking;
import com.parkease.backend.entity.User;
import com.parkease.backend.repository.BookingRepository;
import com.parkease.backend.repository.PaymentRepository;
import com.parkease.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/driver/dashboard")
public class DriverDashboardController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final com.parkease.backend.repository.WalletTransactionRepository walletTransactionRepository;

    public DriverDashboardController(UserRepository userRepository, BookingRepository bookingRepository,
            PaymentRepository paymentRepository,
            com.parkease.backend.repository.WalletTransactionRepository walletTransactionRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.walletTransactionRepository = walletTransactionRepository;
    }

    @GetMapping
    public ResponseEntity<?> getDashboard(Authentication auth,
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "MONTH") String range) {
        User principal = (User) auth.getPrincipal();
        User driver = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();

        // 1. Total Trips
        List<Booking> bookings = bookingRepository.findByDriver(driver);
        long totalTrips = bookings.size();

        // 2. Balance (Actual Wallet Balance)
        double walletBalance = driver.getWalletBalance() != null ? driver.getWalletBalance() : 0.0;
        double totalSpent = paymentRepository.sumTotalSpentByDriver(driver.getId());

        // 3. Eco Points (10 points per trip)
        long ecoPoints = totalTrips * 10;

        // 4. Recent Activity (Last 5 bookings)
        List<Map<String, Object>> recentActivity = bookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
                .limit(5)
                .map(b -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("location", b.getParkingLot().getName());
                    map.put("date", b.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd • hh:mm a")));
                    map.put("amount", 50.0); // Fixed value for now as it's not in the entity yet
                    return map;
                })
                .collect(Collectors.toList());

        // 5. Running Balance Trend (Reflects true balance evolution)
        List<Map<String, Object>> spendingTrendList = new ArrayList<>();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        double runningBalanceTrend = walletBalance; // Start from current real-time balance

        if ("WEEK".equalsIgnoreCase(range)) {
            String[] dayNames = { "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };
            for (int i = 0; i <= 6; i++) {
                LocalDateTime start = now.minusDays(i).with(LocalTime.MIN);
                LocalDateTime end = now.minusDays(i).with(LocalTime.MAX);

                Map<String, Object> map = new HashMap<>();
                map.put("label", dayNames[start.getDayOfWeek().getValue() % 7]);
                map.put("value", (int) runningBalanceTrend);
                spendingTrendList.add(map);

                // Subtract this day's net change to get previous day's balance
                Double credits = walletTransactionRepository.sumCreditsBetween(driver.getId(), start, end);
                Double debits = walletTransactionRepository.sumDebitsBetween(driver.getId(), start, end);
                double netChange = (credits != null ? credits : 0.0) - (debits != null ? debits : 0.0);
                runningBalanceTrend -= netChange;
            }
        } else if ("YEAR".equalsIgnoreCase(range)) {
            for (int i = 0; i <= 4; i++) {
                LocalDate yearDate = LocalDate.now().minusYears(i);
                LocalDateTime yearStart = yearDate.withDayOfYear(1).atStartOfDay();
                LocalDateTime yearEnd = yearDate.withDayOfYear(yearDate.lengthOfYear()).atTime(23, 59, 59);

                Map<String, Object> map = new HashMap<>();
                map.put("label", String.valueOf(yearDate.getYear()));
                map.put("value", (int) runningBalanceTrend);
                spendingTrendList.add(map);

                Double credits = walletTransactionRepository.sumCreditsBetween(driver.getId(), yearStart, yearEnd);
                Double debits = walletTransactionRepository.sumDebitsBetween(driver.getId(), yearStart, yearEnd);
                double netChange = (credits != null ? credits : 0.0) - (debits != null ? debits : 0.0);
                runningBalanceTrend -= netChange;
            }
        } else { // DEFAULT: MONTH
            String[] monthLabels = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov",
                    "Dec" };
            for (int i = 0; i <= 6; i++) {
                LocalDate monthDate = LocalDate.now().minusMonths(i);
                LocalDateTime monthStart = monthDate.withDayOfMonth(1).atStartOfDay();
                LocalDateTime monthEnd = monthDate.withDayOfMonth(monthDate.lengthOfMonth()).atTime(23, 59, 59);

                Map<String, Object> map = new HashMap<>();
                map.put("label", monthLabels[monthDate.getMonthValue() - 1]);
                map.put("value", (int) runningBalanceTrend);
                spendingTrendList.add(map);

                Double credits = walletTransactionRepository.sumCreditsBetween(driver.getId(), monthStart, monthEnd);
                Double debits = walletTransactionRepository.sumDebitsBetween(driver.getId(), monthStart, monthEnd);
                double netChange = (credits != null ? credits : 0.0) - (debits != null ? debits : 0.0);
                runningBalanceTrend -= netChange;
            }
        }
        // Reverse so it's chronological (Past -> Present)
        Collections.reverse(spendingTrendList);
        List<Map<String, Object>> spendingTrend = spendingTrendList;

        // 6. Usage Intensity (Real based on wallet activity - can remain same or use
        // range too)
        // Let's keep one dedicated Weekly view for Intensity as it was
        List<Map<String, Object>> usageIntensity = new ArrayList<>();
        String[] intensityDayNames = { "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDateTime start = now.minusDays(i).with(java.time.LocalTime.MIN);
            java.time.LocalDateTime end = now.minusDays(i).with(java.time.LocalTime.MAX);
            Double dayCredit = walletTransactionRepository.sumCreditsBetween(driver.getId(), start, end);
            Map<String, Object> map = new HashMap<>();
            map.put("label", intensityDayNames[start.getDayOfWeek().getValue() % 7]);
            map.put("value", dayCredit != null ? dayCredit.intValue() : 0);
            usageIntensity.add(map);
        }

        // 7. Parking Type Distribution (Mocked)
        List<Map<String, Object>> parkingType = new ArrayList<>();
        parkingType.add(Map.of("label", "Mall Parking", "value", 45, "color", "#3B82F6"));
        parkingType.add(Map.of("label", "Airport", "value", 28, "color", "#F59E0B"));
        parkingType.add(Map.of("label", "Office", "value", 18, "color", "#10B981"));
        parkingType.add(Map.of("label", "Street", "value", 9, "color", "#8B5CF6"));

        response.put("totalTrips", totalTrips);
        response.put("balance", walletBalance);
        response.put("totalSpent", totalSpent);
        response.put("ecoPoints", ecoPoints);
        response.put("recentActivity", recentActivity);
        response.put("spendingTrend", spendingTrend);
        response.put("usageIntensity", usageIntensity);
        response.put("parkingType", parkingType);
        response.put("userName", driver.getFullName());
        response.put("phone", driver.getPhoneNumber());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/add-money")
    public ResponseEntity<?> addMoney(@RequestBody Map<String, Object> payload,
            Authentication auth) {
        User principal = (User) auth.getPrincipal();
        User driver = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException(
                        "User account not found (ID: " + principal.getId() + "). Please re-login."));

        if (!payload.containsKey("amount")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Amount is required"));
        }

        double amount = Double.parseDouble(payload.get("amount").toString());
        double currentBalance = driver.getWalletBalance() != null ? driver.getWalletBalance() : 0.0;
        driver.setWalletBalance(currentBalance + amount);
        userRepository.save(driver);

        // Record Transaction for Graphs
        com.parkease.backend.entity.WalletTransaction txt = new com.parkease.backend.entity.WalletTransaction(
                driver, amount, "CREDIT", "Wallet Top-up");
        walletTransactionRepository.save(txt);

        return ResponseEntity.ok(Map.of("message", "Success", "newBalance", driver.getWalletBalance()));
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(Authentication auth) {
        User principal = (User) auth.getPrincipal();
        User driver = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<com.parkease.backend.entity.WalletTransaction> txns = walletTransactionRepository
                .findByUserOrderByCreatedAtDesc(driver);

        List<Map<String, Object>> response = txns.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("type", t.getType());
            map.put("title", t.getDescription());
            map.put("amount", t.getAmount());
            map.put("date", t.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, hh:mm a")));
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
