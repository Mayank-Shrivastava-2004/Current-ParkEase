package com.parkease.backend.repository;

import com.parkease.backend.entity.User;
import com.parkease.backend.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT SUM(t.amount) FROM WalletTransaction t WHERE t.user.id = :userId AND t.type = 'CREDIT' AND t.createdAt BETWEEN :start AND :end")
    Double sumCreditsBetween(@Param("userId") Long userId, @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT SUM(t.amount) FROM WalletTransaction t WHERE t.user.id = :userId AND t.type = 'DEBIT' AND t.createdAt BETWEEN :start AND :end")
    Double sumDebitsBetween(@Param("userId") Long userId, @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT SUM(t.amount) FROM WalletTransaction t WHERE t.type = 'CREDIT' AND t.createdAt BETWEEN :start AND :end")
    Double sumAllCreditsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
