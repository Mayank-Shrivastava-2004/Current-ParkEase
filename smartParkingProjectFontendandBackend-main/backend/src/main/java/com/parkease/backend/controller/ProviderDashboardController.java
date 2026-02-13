package com.parkease.backend.controller;

import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.parkease.backend.repository.UserRepository;
import com.parkease.backend.entity.User;
import com.parkease.backend.repository.BookingRepository;
import com.parkease.backend.repository.ParkingLotRepository;
import com.parkease.backend.repository.PaymentRepository;

import com.parkease.backend.repository.WalletTransactionRepository; // Added missing import
import com.parkease.backend.entity.Booking;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import com.parkease.backend.entity.Payment;
import com.parkease.backend.entity.Withdrawal;
import com.parkease.backend.repository.WithdrawalRepository;

@RestController
@RequestMapping("/api/provider")
@PreAuthorize("hasRole('PROVIDER')")
public class ProviderDashboardController {

        private final UserRepository userRepository;
        private final BookingRepository bookingRepository;
        private final PaymentRepository paymentRepository;
        private final ParkingLotRepository parkingLotRepository;
        private final WithdrawalRepository withdrawalRepository;
        private final WalletTransactionRepository walletTransactionRepository;
        private final com.parkease.backend.repository.ReviewRepository reviewRepository;

        public ProviderDashboardController(
                        UserRepository userRepository,
                        BookingRepository bookingRepository,
                        PaymentRepository paymentRepository,
                        ParkingLotRepository parkingLotRepository,
                        WithdrawalRepository withdrawalRepository,
                        WalletTransactionRepository walletTransactionRepository,
                        com.parkease.backend.repository.ReviewRepository reviewRepository) {
                this.userRepository = userRepository;
                this.bookingRepository = bookingRepository;
                this.paymentRepository = paymentRepository;
                this.parkingLotRepository = parkingLotRepository;
                this.withdrawalRepository = withdrawalRepository;
                this.walletTransactionRepository = walletTransactionRepository;
                this.reviewRepository = reviewRepository;
        }

        /*
         * =====================================================
         * GET DASHBOARD SUMMARY
         * =====================================================
         */
        @GetMapping("/dashboard")
        public ResponseEntity<?> getDashboard(
                        @RequestParam(value = "timeframe", defaultValue = "week") String timeframe,
                        Authentication auth) {
                String email = auth.getName();
                User provider = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Account not found for: " + email
                                                + ". Since the database was reset, please Register again."));

                // 1. Total Revenue
                double totalRevenue = paymentRepository.sumTotalEarningsByProvider(provider.getId());

                // 2. Active Cars (Active Bookings)
                long activeCars = bookingRepository.countActiveBookingsByProvider(provider.getId());

                // 3. Total Slots
                int totalSlots = parkingLotRepository.sumTotalSlotsByProvider(provider.getId());

                // 4. Occupancy Rate
                long occupancyRate = (totalSlots > 0) ? (activeCars * 100) / totalSlots : 0;

                // 5. Recent Activity
                List<Map<String, Object>> recentActivity = bookingRepository
                                .findRecentBookingsByProvider(provider.getId(), PageRequest.of(0, 5))
                                .stream()
                                .map(b -> {
                                        Map<String, Object> map = new HashMap<>();
                                        map.put("type", b.getEndTime() == null ? "check-in" : "check-out");
                                        map.put("slotCode", b.getParkingSlot().getSlotNumber());
                                        map.put("time", b.getCreatedAt()
                                                        .format(DateTimeFormatter.ofPattern("hh:mm a")));
                                        map.put("customerName", b.getDriver().getFullName());
                                        return map;
                                })
                                .collect(Collectors.toList());

                // 6. Revenue Trend (Based on timeframe)
                List<Map<String, Object>> revenueTrend = new ArrayList<>();
                java.time.LocalDateTime now = java.time.LocalDateTime.now();

                if ("YEAR".equalsIgnoreCase(timeframe)) {
                        for (int i = 4; i >= 0; i--) {
                                java.time.LocalDate yearDate = java.time.LocalDate.now().minusYears(i);
                                java.time.LocalDateTime yearStart = yearDate.withDayOfYear(1).atStartOfDay();
                                java.time.LocalDateTime yearEnd = yearDate.withDayOfYear(yearDate.lengthOfYear())
                                                .atTime(23, 59, 59);

                                Double yearCredit = walletTransactionRepository.sumCreditsBetween(provider.getId(),
                                                yearStart, yearEnd);
                                Map<String, Object> map = new HashMap<>();
                                map.put("label", String.valueOf(yearDate.getYear()));
                                map.put("value", yearCredit != null ? yearCredit.intValue() : 0);
                                revenueTrend.add(map);
                        }
                } else if ("MONTH".equalsIgnoreCase(timeframe)) {
                        String[] monthLabels = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
                                        "Nov", "Dec" };
                        for (int i = 5; i >= 0; i--) {
                                java.time.LocalDate monthDate = java.time.LocalDate.now().minusMonths(i);
                                java.time.LocalDateTime monthStart = monthDate.withDayOfMonth(1).atStartOfDay();
                                java.time.LocalDateTime monthEnd = monthDate.withDayOfMonth(monthDate.lengthOfMonth())
                                                .atTime(23, 59, 59);

                                Double monthCredit = walletTransactionRepository.sumCreditsBetween(provider.getId(),
                                                monthStart, monthEnd);
                                Map<String, Object> map = new HashMap<>();
                                map.put("label", monthLabels[monthDate.getMonthValue() - 1]);
                                map.put("value", monthCredit != null ? monthCredit.intValue() : 0);
                                revenueTrend.add(map);
                        }
                } else {
                        // Week (Default)
                        String[] dayLabels = { "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };
                        for (int i = 6; i >= 0; i--) {
                                java.time.LocalDateTime dayStart = now.minusDays(i).with(java.time.LocalTime.MIN);
                                java.time.LocalDateTime dayEnd = now.minusDays(i).with(java.time.LocalTime.MAX);

                                Double dayCredit = walletTransactionRepository.sumCreditsBetween(provider.getId(),
                                                dayStart, dayEnd);
                                Map<String, Object> map = new HashMap<>();
                                map.put("label", dayLabels[dayStart.getDayOfWeek().getValue() % 7]);
                                map.put("value", dayCredit != null ? dayCredit.intValue() : 0);
                                revenueTrend.add(map);
                        }
                }

                Map<String, Object> summary = new HashMap<>();
                summary.put("totalRevenue", totalRevenue);
                summary.put("occupancyRate", occupancyRate);
                summary.put("activeCars", activeCars);
                summary.put("totalSlots", totalSlots);

                // Real Rating calculation
                List<com.parkease.backend.entity.Review> reviews = reviewRepository
                                .findByProviderOrderByCreatedAtDesc(provider);
                double avgRating = reviews.stream().mapToInt(com.parkease.backend.entity.Review::getRating).average()
                                .orElse(0.0);
                summary.put("rating", Math.round(avgRating * 10.0) / 10.0);

                Map<String, Object> response = new HashMap<>();
                response.put("summary", summary);
                response.put("recentActivity", recentActivity);
                response.put("revenueTrend", revenueTrend);
                response.put("online", provider.isEnabled());
                response.put("providerName", provider.getFullName() != null ? provider.getFullName() : "Provider");

                return ResponseEntity.ok(response);
        }

        /*
         * =====================================================
         * UPDATE ONLINE STATUS
         * =====================================================
         */
        @PostMapping("/status")
        public ResponseEntity<?> updateStatus(
                        @RequestBody Map<String, Boolean> payload,
                        Authentication auth) {
                String email = auth.getName();
                User provider = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Provider not found"));

                Boolean online = payload.get("online");
                provider.setEnabled(online != null ? online : true);
                userRepository.save(provider);

                return ResponseEntity.ok(Map.of("message", "Status updated", "online", provider.isEnabled()));
        }

        /*
         * =====================================================
         * GET TODAY'S BOOKINGS
         * =====================================================
         */
        @GetMapping("/occupancy")
        public ResponseEntity<?> getOccupancy(Authentication auth) {
                String email = auth.getName();
                User provider = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Provider not found"));

                long activeCars = bookingRepository.countActiveBookingsByProvider(provider.getId());
                int totalSlots = parkingLotRepository.sumTotalSlotsByProvider(provider.getId());
                long occupancyRate = (totalSlots > 0) ? (activeCars * 100) / totalSlots : 0;

                Map<String, Object> current = new HashMap<>();
                current.put("totalSlots", totalSlots);
                current.put("occupied", activeCars);
                current.put("available", Math.max(0, totalSlots - activeCars));
                current.put("occupancyRate", occupancyRate);

                // Real Hourly Data & Peak Hours
                java.time.LocalDateTime startOfDay = java.time.LocalDate.now().atStartOfDay();
                java.time.LocalDateTime endOfDay = java.time.LocalDate.now().atTime(java.time.LocalTime.MAX);

                List<Booking> todayBookings = bookingRepository.findByParkingLot_Provider_IdAndStartTimeBetween(
                                provider.getId(), startOfDay, endOfDay);

                Map<Integer, Integer> hourCounts = new HashMap<>();
                for (Booking b : todayBookings) {
                        int hour = b.getStartTime().getHour();
                        hourCounts.put(hour, hourCounts.getOrDefault(hour, 0) + 1);
                }

                List<Map<String, Object>> hourlyData = new ArrayList<>();
                int[] hoursToCheck = { 8, 10, 12, 14, 16, 18, 20 };

                for (int h : hoursToCheck) {
                        Map<String, Object> map = new HashMap<>();
                        map.put("label", (h > 12 ? (h - 12) + "PM" : h + "AM"));
                        // Sum previous hour and current hour for a 2-hour block logic or just take
                        // current
                        int count = hourCounts.getOrDefault(h, 0) + hourCounts.getOrDefault(h + 1, 0);
                        map.put("value", count);
                        hourlyData.add(map);
                }

                // Calculate Real Peak Hours
                List<Map<String, Object>> peakHours = new ArrayList<>();

                // Find max hour
                int maxHour = -1;
                int maxCount = -1;

                for (Map.Entry<Integer, Integer> entry : hourCounts.entrySet()) {
                        if (entry.getValue() > maxCount) {
                                maxCount = entry.getValue();
                                maxHour = entry.getKey();
                        }
                }

                if (maxHour != -1) {
                        Map<String, Object> p1 = new HashMap<>();
                        String timeLabel = (maxHour > 12 ? (maxHour - 12) + " PM" : maxHour + " AM") + " - " +
                                        ((maxHour + 1) > 12 ? ((maxHour + 1) - 12) + " PM" : (maxHour + 1) + " AM");
                        p1.put("timeRange", timeLabel);
                        p1.put("bookings", maxCount);
                        p1.put("load", maxCount > 5 ? "High" : "Medium"); // Threshold logic
                        peakHours.add(p1);
                } else {
                        // Fallback if no bookings yet
                        Map<String, Object> p1 = new HashMap<>();
                        p1.put("timeRange", "No Data Yet");
                        p1.put("bookings", 0);
                        p1.put("load", "Low");
                        peakHours.add(p1);
                }

                Map<String, Object> response = new HashMap<>();
                response.put("current", current);
                response.put("hourlyData", hourlyData);
                response.put("peakHours", peakHours);

                return ResponseEntity.ok(response);
        }

        /*
         * =====================================================
         * GET TODAY'S BOOKINGS
         * =====================================================
         */
        @GetMapping("/bookings/today")
        public ResponseEntity<?> getTodayBookings(Authentication auth) {
                String email = auth.getName();
                User provider = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Provider not found"));

                List<Map<String, Object>> bookings = bookingRepository
                                .findRecentBookingsByProvider(provider.getId(), PageRequest.of(0, 50))
                                .stream()
                                .filter(b -> b.getCreatedAt().toLocalDate().isEqual(java.time.LocalDate.now()))
                                .map(b -> {
                                        Map<String, Object> map = new HashMap<>();
                                        map.put("id", b.getId().toString());
                                        map.put("slot", b.getParkingSlot().getSlotNumber());
                                        map.put("time", b.getCreatedAt()
                                                        .format(DateTimeFormatter.ofPattern("hh:mm a")));

                                        double earnings = paymentRepository.findByBooking(b)
                                                        .map(Payment::getProviderEarning)
                                                        .orElse(0.0);
                                        map.put("earnings", earnings);

                                        map.put("status", b.getStatus());
                                        return map;
                                })
                                .collect(Collectors.toList());

                return ResponseEntity.ok(bookings);
        }

        /*
         * =====================================================
         * GET EARNINGS
         * =====================================================
         */
        @GetMapping("/earnings")
        public ResponseEntity<?> getEarnings(Authentication auth) {
                String email = auth.getName();
                User provider = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Account not found for: " + email
                                                + ". Since the database was reset, please Register again."));

                // 1. Summary
                double totalEarnings = paymentRepository.sumTotalEarningsByProvider(provider.getId());

                java.time.LocalDateTime startOfMonth = java.time.LocalDate.now().withDayOfMonth(1).atStartOfDay();
                double thisMonth = paymentRepository.sumProviderEarningBetweenForProvider(
                                startOfMonth, java.time.LocalDateTime.now().plusDays(1), provider.getId());

                java.time.LocalDateTime startOfLastMonth = java.time.LocalDate.now().minusMonths(1).withDayOfMonth(1)
                                .atStartOfDay();
                java.time.LocalDateTime endOfLastMonth = startOfMonth.minusSeconds(1);
                double lastMonth = paymentRepository.sumProviderEarningBetweenForProvider(
                                startOfLastMonth, endOfLastMonth, provider.getId());

                double growth = (lastMonth > 0) ? ((thisMonth - lastMonth) / lastMonth) * 100 : 100;

                // Balance calculations
                double processedWithdrawals = withdrawalRepository.sumProcessedWithdrawalsByProvider(provider.getId());
                double pendingWithdrawals = withdrawalRepository.sumPendingWithdrawalsByProvider(provider.getId());
                double availableBalance = totalEarnings + provider.getWalletBalance() - processedWithdrawals
                                - pendingWithdrawals;

                Map<String, Object> summary = new HashMap<>();
                summary.put("totalEarnings", totalEarnings);
                summary.put("thisMonth", thisMonth);
                summary.put("lastMonth", lastMonth);
                summary.put("growth", String.format("%.1f", growth));
                summary.put("pendingPayout", pendingWithdrawals);
                summary.put("availableBalance", availableBalance);

                // 2. Weekly Data (Real from Wallet Transactions)
                List<Map<String, Object>> weeklyData = new ArrayList<>();
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                String[] dayLabels = { "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };
                for (int i = 6; i >= 0; i--) {
                        java.time.LocalDateTime dayStart = now.minusDays(i).with(java.time.LocalTime.MIN);
                        java.time.LocalDateTime dayEnd = now.minusDays(i).with(java.time.LocalTime.MAX);

                        Double dayCredit = walletTransactionRepository.sumCreditsBetween(provider.getId(), dayStart,
                                        dayEnd);
                        if (dayCredit == null)
                                dayCredit = 0.0;

                        Map<String, Object> map = new HashMap<>();
                        map.put("label", dayLabels[dayStart.getDayOfWeek().getValue() % 7]);
                        map.put("value", dayCredit.intValue());
                        weeklyData.add(map);
                }

                // 3. Monthly Trend (Real from Wallet Transactions)
                List<Map<String, Object>> monthlyTrend = new ArrayList<>();
                String[] monthLabels = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov",
                                "Dec" };
                for (int i = 4; i >= 0; i--) {
                        java.time.LocalDate monthDate = java.time.LocalDate.now().minusMonths(i);
                        java.time.LocalDateTime monthStart = monthDate.withDayOfMonth(1).atStartOfDay();
                        java.time.LocalDateTime monthEnd = monthDate.withDayOfMonth(monthDate.lengthOfMonth())
                                        .atTime(23, 59, 59);

                        Double monthCredit = walletTransactionRepository.sumCreditsBetween(provider.getId(), monthStart,
                                        monthEnd);
                        if (monthCredit == null)
                                monthCredit = 0.0;

                        Map<String, Object> map = new HashMap<>();
                        map.put("label", monthLabels[monthDate.getMonthValue() - 1]);
                        map.put("value", monthCredit.intValue());
                        monthlyTrend.add(map);
                }

                // 4. Transactions (Real)
                List<Map<String, Object>> transactions = paymentRepository
                                .findRecentPaymentsByProvider(provider.getId())
                                .stream()
                                .limit(10)
                                .map(p -> {
                                        Map<String, Object> map = new HashMap<>();
                                        map.put("id", "TXN" + p.getId());
                                        map.put("date", p.getPaidAt().toLocalDate().toString());
                                        map.put("amount", p.getProviderEarning());
                                        map.put("slot", p.getBooking().getParkingSlot().getSlotNumber());
                                        map.put("status", "completed");
                                        return map;
                                })
                                .collect(Collectors.toList());

                Map<String, Object> response = new HashMap<>();
                response.put("summary", summary);
                response.put("weeklyData", weeklyData);
                response.put("monthlyTrend", monthlyTrend);
                response.put("transactions", transactions);

                return ResponseEntity.ok(response);
        }

        /*
         * =====================================================
         * GET HISTORY
         * =====================================================
         */
        @GetMapping("/history")
        public ResponseEntity<?> getHistory(Authentication auth) {
                String email = auth.getName();
                User provider = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Account not found for: " + email
                                                + ". Since the database was reset, please Register again."));

                List<Map<String, Object>> history = bookingRepository
                                .findRecentBookingsByProvider(provider.getId(), PageRequest.of(0, 100))
                                .stream()
                                .map(b -> {
                                        Map<String, Object> map = new HashMap<>();
                                        map.put("id", "BK-" + b.getId());
                                        map.put("date", b.getCreatedAt().toLocalDate().toString());
                                        map.put("slot", b.getParkingSlot().getSlotNumber());

                                        double amount = paymentRepository.findByBooking(b)
                                                        .map(Payment::getTotalAmount)
                                                        .orElse(0.0);
                                        map.put("amount", amount);

                                        map.put("customer", b.getDriver().getFullName());
                                        map.put("vehicleNumber", b.getDriver().getVehicleNumber());
                                        map.put("vehicleType", b.getDriver().getVehicleType());

                                        // Calculate duration
                                        String duration = "N/A";
                                        if (b.getEndTime() != null) {
                                                long diff = java.time.Duration.between(b.getCreatedAt(), b.getEndTime())
                                                                .toMinutes();
                                                long hours = diff / 60;
                                                long minutes = diff % 60;
                                                duration = (hours > 0 ? hours + "h " : "") + minutes + "m";
                                        }
                                        map.put("duration", duration);

                                        map.put("status", b.getStatus().toString().toLowerCase());
                                        return map;
                                })
                                .collect(Collectors.toList());

                return ResponseEntity.ok(history);
        }

        /*
         * =====================================================
         * REQUEST WITHDRAWAL
         * =====================================================
         */
        @PostMapping("/withdraw")
        public ResponseEntity<?> requestWithdrawal(@RequestBody Map<String, Object> payload, Authentication auth) {
                String email = auth.getName();
                User provider = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Account not found for: " + email
                                                + ". Since the database was reset, please Register again."));

                if (!payload.containsKey("amount") || !payload.containsKey("upiId")) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Amount and UPI ID are required"));
                }

                double amount;
                try {
                        amount = Double.parseDouble(payload.get("amount").toString());
                } catch (NumberFormatException e) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Invalid amount format"));
                }

                String upiId = payload.get("upiId").toString();

                // Check balance
                double totalEarnings = paymentRepository.sumTotalEarningsByProvider(provider.getId());
                double processed = withdrawalRepository.sumProcessedWithdrawalsByProvider(provider.getId());
                double pending = withdrawalRepository.sumPendingWithdrawalsByProvider(provider.getId());
                double available = totalEarnings - processed - pending;

                if (amount <= 0) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Amount must be positive"));
                }

                if (amount > available) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Insufficient funds"));
                }

                Withdrawal withdrawal = new Withdrawal();
                withdrawal.setProvider(provider);
                withdrawal.setAmount(amount);
                withdrawal.setUpiId(upiId);
                withdrawal.setStatus("PENDING");
                withdrawal.setRequestedAt(java.time.LocalDateTime.now());
                withdrawalRepository.save(withdrawal);

                return ResponseEntity.ok(Map.of("message", "Withdrawal requested successfully", "remainingBalance",
                                available - amount));
        }

        /*
         * =====================================================
         * ADD MONEY TO WALLET
         * =====================================================
         */
        @PostMapping("/add-money")
        public ResponseEntity<?> addMoney(@RequestBody Map<String, Object> payload, Authentication auth) {
                String email = auth.getName();
                User provider = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Account not found for: " + email
                                                + ". Since the database was reset, please Register again."));

                if (!payload.containsKey("amount")) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Amount is required"));
                }

                double amount;
                try {
                        amount = Double.parseDouble(payload.get("amount").toString());
                } catch (NumberFormatException e) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Invalid amount format"));
                }

                if (amount <= 0) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Amount must be positive"));
                }

                provider.setWalletBalance(provider.getWalletBalance() + amount);
                userRepository.save(provider);

                return ResponseEntity.ok(Map.of(
                                "message", "Money added successfully",
                                "newWalletBalance", provider.getWalletBalance()));
        }
}
