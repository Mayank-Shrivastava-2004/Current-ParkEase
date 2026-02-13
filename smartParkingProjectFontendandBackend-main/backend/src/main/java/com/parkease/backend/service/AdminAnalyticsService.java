package com.parkease.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.parkease.backend.dto.AdminAnalyticsResponse;
import com.parkease.backend.dto.ParkingDurationResponse;
import com.parkease.backend.entity.Booking;
import com.parkease.backend.enumtype.BookingStatus;
import com.parkease.backend.enumtype.Role;
import com.parkease.backend.repository.BookingRepository;
import com.parkease.backend.repository.PaymentRepository;
import com.parkease.backend.repository.UserRepository;
import com.parkease.backend.repository.ParkingLotRepository;
import com.parkease.backend.repository.ParkingSlotRepository;

@Service
public class AdminAnalyticsService {

        private final UserRepository userRepository;
        private final BookingRepository bookingRepository;
        private final PaymentRepository paymentRepository;
        private final ParkingLotRepository parkingLotRepository;
        private final ParkingSlotRepository parkingSlotRepository;
        private final com.parkease.backend.repository.WalletTransactionRepository walletTransactionRepository;

        public AdminAnalyticsService(
                        UserRepository userRepository,
                        BookingRepository bookingRepository,
                        PaymentRepository paymentRepository,
                        ParkingLotRepository parkingLotRepository,
                        ParkingSlotRepository parkingSlotRepository,
                        com.parkease.backend.repository.WalletTransactionRepository walletTransactionRepository) {
                this.userRepository = userRepository;
                this.bookingRepository = bookingRepository;
                this.paymentRepository = paymentRepository;
                this.parkingLotRepository = parkingLotRepository;
                this.parkingSlotRepository = parkingSlotRepository;
                this.walletTransactionRepository = walletTransactionRepository;
        }

        /* ================= MAIN ANALYTICS ================= */

        /* ================= MAIN ANALYTICS ================= */

        public AdminAnalyticsResponse getAnalytics(String range) {

                AdminAnalyticsResponse res = new AdminAnalyticsResponse();
                LocalDateTime endDateTime = LocalDateTime.now();
                LocalDateTime startDateTime;
                int points;
                boolean isAnnual = "YEAR".equalsIgnoreCase(range);

                if (isAnnual) {
                        startDateTime = endDateTime.minusMonths(11).withDayOfMonth(1).toLocalDate()
                                        .atStartOfDay();
                        points = 12;
                } else if ("MONTH".equalsIgnoreCase(range)) {
                        startDateTime = endDateTime.minusDays(29).toLocalDate().atStartOfDay();
                        points = 30;
                } else {
                        // Default to WEEK
                        startDateTime = endDateTime.minusDays(6).toLocalDate().atStartOfDay();
                        points = 7;
                }

                /* ===== USER GROWTH (Global) ===== */
                LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
                AdminAnalyticsResponse.UserGrowth growth = new AdminAnalyticsResponse.UserGrowth();
                growth.growthTrend = new ArrayList<>();

                AdminAnalyticsResponse.UserGrowth.Group drivers = new AdminAnalyticsResponse.UserGrowth.Group();
                drivers.total = userRepository.countByRole(Role.DRIVER);
                drivers.newThisWeek = userRepository.countByRoleAndCreatedAtAfter(Role.DRIVER, weekAgo);

                AdminAnalyticsResponse.UserGrowth.Group providers = new AdminAnalyticsResponse.UserGrowth.Group();
                providers.total = userRepository.countByRole(Role.PROVIDER);
                providers.newThisWeek = userRepository.countByRoleAndCreatedAtAfter(Role.PROVIDER, weekAgo);

                if (isAnnual) {
                        for (int i = 11; i >= 0; i--) {
                                LocalDateTime monthStart = endDateTime.minusMonths(i).withDayOfMonth(1).toLocalDate()
                                                .atStartOfDay();
                                LocalDateTime monthEnd = monthStart.plusMonths(1);

                                AdminAnalyticsResponse.UserGrowthTrend trend = new AdminAnalyticsResponse.UserGrowthTrend();
                                trend.label = monthStart.getMonth().name().substring(0, 3);
                                trend.drivers = (int) userRepository.countByRoleAndCreatedAtBefore(Role.DRIVER,
                                                monthEnd);
                                trend.providers = (int) userRepository.countByRoleAndCreatedAtBefore(Role.PROVIDER,
                                                monthEnd);
                                growth.growthTrend.add(trend);
                        }
                } else {
                        for (int i = points - 1; i >= 0; i--) {
                                LocalDate day = LocalDate.now().minusDays(i);
                                LocalDateTime dayEnd = day.atTime(23, 59, 59);

                                AdminAnalyticsResponse.UserGrowthTrend trend = new AdminAnalyticsResponse.UserGrowthTrend();
                                if (points <= 7) {
                                        trend.label = day.getDayOfWeek().name().substring(0, 3);
                                } else {
                                        trend.label = String.valueOf(day.getDayOfMonth());
                                }
                                trend.drivers = (int) userRepository.countByRoleAndCreatedAtBefore(Role.DRIVER, dayEnd);
                                trend.providers = (int) userRepository.countByRoleAndCreatedAtBefore(Role.PROVIDER,
                                                dayEnd);
                                growth.growthTrend.add(trend);
                        }
                }

                growth.drivers = drivers;
                growth.providers = providers;
                res.userGrowth = growth;

                /* ===== TOP PROVIDERS ===== */
                res.topProviders = userRepository.findByRoleAndApprovedTrue(Role.PROVIDER)
                                .stream()
                                .map(p -> {
                                        AdminAnalyticsResponse.TopProvider tp = new AdminAnalyticsResponse.TopProvider();
                                        tp.id = p.getId();
                                        tp.name = p.getFullName();
                                        tp.activeSinceDays = (int) ChronoUnit.DAYS.between(
                                                        p.getCreatedAt(), LocalDateTime.now());
                                        return tp;
                                })
                                .toList();

                /* ===== REVENUE (Calculated for Range) ===== */
                AdminAnalyticsResponse.Revenue revenue = new AdminAnalyticsResponse.Revenue();

                revenue.total = (long) paymentRepository.sumTotalAmountBetween(startDateTime, endDateTime);
                revenue.platformFees = (long) paymentRepository.sumPlatformFeeBetween(startDateTime, endDateTime);
                revenue.providerEarnings = (long) paymentRepository.sumProviderEarningBetween(startDateTime,
                                endDateTime);

                long rangeDays = ChronoUnit.DAYS.between(startDateTime, endDateTime);
                if (rangeDays > 0) {
                        revenue.avgDailyRevenue = revenue.total / rangeDays;
                } else {
                        revenue.avgDailyRevenue = revenue.total;
                }

                res.revenue = revenue;

                /* ===== BOOKING TREND ===== */
                res.bookingTrend = new ArrayList<>();

                if (isAnnual) {
                        // Group by Month for the last 12 months
                        for (int i = points - 1; i >= 0; i--) {
                                LocalDateTime monthStart = endDateTime.minusMonths(i).withDayOfMonth(1).toLocalDate()
                                                .atStartOfDay();
                                LocalDateTime monthEnd = monthStart.plusMonths(1);

                                AdminAnalyticsResponse.BookingTrend bt = new AdminAnalyticsResponse.BookingTrend();
                                bt.label = monthStart.getMonth().name().substring(0, 3);
                                bt.value = (int) bookingRepository.countByStatusAndCreatedAtBetween(
                                                BookingStatus.COMPLETED, monthStart, monthEnd);
                                bt.revenue = (long) paymentRepository.sumTotalAmountBetween(monthStart, monthEnd);
                                res.bookingTrend.add(bt);
                        }
                } else {
                        // Group by Day for Week or Month
                        for (int i = points - 1; i >= 0; i--) {
                                LocalDate day = LocalDate.now().minusDays(i);
                                LocalDateTime start = day.atStartOfDay();
                                LocalDateTime end = start.plusDays(1);

                                AdminAnalyticsResponse.BookingTrend bt = new AdminAnalyticsResponse.BookingTrend();
                                bt.label = i % 5 == 0 || points <= 7 ? day.getDayOfWeek().name().substring(0, 3)
                                                : String.valueOf(day.getDayOfMonth());
                                bt.value = (int) bookingRepository
                                                .countByStatusAndCreatedAtBetween(BookingStatus.COMPLETED, start, end);

                                Double dailyCredits = walletTransactionRepository.sumAllCreditsBetween(start, end);
                                if (dailyCredits == null)
                                        dailyCredits = 0.0;

                                bt.revenue = dailyCredits.longValue();
                                res.bookingTrend.add(bt);
                        }
                }

                /* ===== OCCUPANCY (Current State) ===== */
                AdminAnalyticsResponse.Occupancy occ = new AdminAnalyticsResponse.Occupancy();
                occ.totalSlots = parkingLotRepository.sumActiveTotalSlots();
                occ.occupiedSlots = parkingSlotRepository.countByOccupiedTrue();
                occ.availableSlots = parkingSlotRepository.countByOccupiedFalse();
                occ.occupancyPercentage = occ.totalSlots > 0
                                ? (int) ((occ.occupiedSlots * 100) / occ.totalSlots)
                                : 0;
                res.occupancy = occ;

                /* ===== SUMMARY METRICS ===== */
                AdminAnalyticsResponse.SummaryMetrics sm = new AdminAnalyticsResponse.SummaryMetrics();
                sm.totalProviders = userRepository.countByRole(Role.PROVIDER);
                sm.pendingApprovals = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == Role.PROVIDER && !u.isApproved()).count();
                sm.activeDrivers = userRepository.countByRole(Role.DRIVER);

                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                sm.todaysBookings = bookingRepository.countByCreatedAtAfter(startOfDay);
                sm.totalRevenue = (long) paymentRepository
                                .sumTotalAmountByStatus(com.parkease.backend.enumtype.PaymentStatus.PAID);
                sm.availableSlots = occ.availableSlots;

                // UI aesthetics growth data
                sm.providersGrowth = (int) (Math.random() * 15);
                sm.pendingUrgent = (int) sm.pendingApprovals;
                sm.driversGrowth = (int) (Math.random() * 20);
                sm.bookingsGrowth = (int) (Math.random() * 25);
                sm.revenueGrowth = (int) (Math.random() * 30);
                res.summary = sm;

                /* ===== PEAK PARKING HOURS (Mocked Intelligence) ===== */
                res.peakHours = new ArrayList<>();
                res.peakHours.add(createPeakHour("8-10 AM", 85, (int) (sm.todaysBookings * 0.4)));
                res.peakHours.add(createPeakHour("12-2 PM", 72, (int) (sm.todaysBookings * 0.3)));
                res.peakHours.add(createPeakHour("6-8 PM", 94, (int) (sm.todaysBookings * 0.5)));

                return res;
        }

        private AdminAnalyticsResponse.PeakHour createPeakHour(String time, int pct, int count) {
                AdminAnalyticsResponse.PeakHour ph = new AdminAnalyticsResponse.PeakHour();
                ph.timeSlot = time;
                ph.percentage = pct;
                ph.bookings = count;
                return ph;
        }

        /* ================= PARKING DURATION ================= */

        public ParkingDurationResponse getParkingDurationAnalytics() {

                ParkingDurationResponse res = new ParkingDurationResponse();
                List<ParkingDurationResponse.Bucket> buckets = new ArrayList<>();

                buckets.add(bucket("0–30 min"));
                buckets.add(bucket("30–60 min"));
                buckets.add(bucket("1–2 hrs"));
                buckets.add(bucket("2–4 hrs"));
                buckets.add(bucket("4+ hrs"));

                List<Booking> bookings = bookingRepository.findByStatusAndEndTimeIsNotNull(
                                BookingStatus.COMPLETED);

                for (Booking b : bookings) {
                        long minutes = ChronoUnit.MINUTES.between(
                                        b.getStartTime(), b.getEndTime());

                        if (minutes <= 30)
                                buckets.get(0).count++;
                        else if (minutes <= 60)
                                buckets.get(1).count++;
                        else if (minutes <= 120)
                                buckets.get(2).count++;
                        else if (minutes <= 240)
                                buckets.get(3).count++;
                        else
                                buckets.get(4).count++;
                }

                res.buckets = buckets;
                return res;
        }

        private ParkingDurationResponse.Bucket bucket(String label) {
                ParkingDurationResponse.Bucket b = new ParkingDurationResponse.Bucket();
                b.label = label;
                b.count = 0;
                return b;
        }
}
