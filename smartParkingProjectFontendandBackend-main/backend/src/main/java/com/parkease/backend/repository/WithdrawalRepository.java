package com.parkease.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import com.parkease.backend.entity.Withdrawal;

public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {

    @Query("SELECT w FROM Withdrawal w WHERE w.provider.id = :providerId ORDER BY w.requestedAt DESC")
    List<Withdrawal> findByProvider(@Param("providerId") Long providerId);

    @Query("SELECT COALESCE(SUM(w.amount), 0) FROM Withdrawal w WHERE w.provider.id = :providerId AND w.status = 'PROCESSED'")
    Double sumProcessedWithdrawalsByProvider(@Param("providerId") Long providerId);

    @Query("SELECT COALESCE(SUM(w.amount), 0) FROM Withdrawal w WHERE w.provider.id = :providerId AND w.status = 'PENDING'")
    Double sumPendingWithdrawalsByProvider(@Param("providerId") Long providerId);
}
