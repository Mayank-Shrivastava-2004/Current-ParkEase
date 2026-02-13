package com.parkease.backend.repository;

import com.parkease.backend.entity.ParkingLot;
import com.parkease.backend.entity.Payment;
import com.parkease.backend.enumtype.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import com.parkease.backend.entity.Booking;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

        // ---------- BASIC QUERIES ----------
        List<Payment> findByStatus(PaymentStatus status);

        long countByStatus(PaymentStatus status);

        // ---------- SUM QUERIES (FIXED) ----------
        @Query("""
                            SELECT COALESCE(SUM(p.totalAmount), 0)
                            FROM Payment p
                            WHERE p.status = :status
                        """)
        double sumTotalAmountByStatus(@Param("status") PaymentStatus status);

        @Query("""
                            SELECT COALESCE(SUM(p.platformFee), 0)
                            FROM Payment p
                            WHERE p.status = :status
                        """)
        double sumPlatformFeeByStatus(@Param("status") PaymentStatus status);

        @Query("""
                            SELECT COALESCE(SUM(p.providerEarning), 0)
                            FROM Payment p
                            WHERE p.status = :status
                        """)
        double sumProviderEarningByStatus(@Param("status") PaymentStatus status);

        // ---------- DATE BASED ----------
        @Query("""
                            SELECT COALESCE(SUM(p.totalAmount), 0)
                            FROM Payment p
                            WHERE p.status = 'PAID' AND p.paidAt BETWEEN :start AND :end
                        """)
        double sumTotalAmountBetween(
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("""
                            SELECT COALESCE(SUM(p.platformFee), 0)
                            FROM Payment p
                            WHERE p.status = 'PAID' AND p.paidAt BETWEEN :start AND :end
                        """)
        double sumPlatformFeeBetween(
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("""
                            SELECT COALESCE(SUM(p.providerEarning), 0)
                            FROM Payment p
                            WHERE p.status = 'PAID' AND p.paidAt BETWEEN :start AND :end
                        """)
        double sumProviderEarningBetween(
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        List<Payment> findByPaidAtAfter(LocalDateTime date);

        @Query("""
                            SELECT COALESCE(SUM(p.totalAmount), 0)
                            FROM Payment p
                            WHERE p.booking.driver.id = :driverId AND p.status = 'PAID'
                        """)
        double sumTotalSpentByDriver(@Param("driverId") Long driverId);

        @Query("""
                            SELECT COALESCE(SUM(p.providerEarning), 0)
                            FROM Payment p
                            WHERE p.booking.parkingLot.provider.id = :providerId AND p.status = 'PAID'
                        """)
        double sumTotalEarningsByProvider(@Param("providerId") Long providerId);

        @Query("""
                            SELECT COALESCE(SUM(p.providerEarning), 0)
                            FROM Payment p
                            WHERE p.booking.parkingLot.provider.id = :providerId
                              AND p.status = 'PAID'
                              AND p.paidAt BETWEEN :start AND :end
                        """)
        double sumProviderEarningBetweenForProvider(
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end,
                        @Param("providerId") Long providerId);

        @Query("SELECT p FROM Payment p WHERE p.booking.parkingLot.provider.id = :providerId ORDER BY p.paidAt DESC")
        List<Payment> findRecentPaymentsByProvider(@Param("providerId") Long providerId);

        Optional<Payment> findByBooking(Booking booking);

}
