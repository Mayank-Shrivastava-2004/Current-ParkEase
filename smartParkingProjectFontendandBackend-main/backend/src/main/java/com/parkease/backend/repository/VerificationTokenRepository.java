package com.parkease.backend.repository;

import com.parkease.backend.entity.VerificationToken;
import com.parkease.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    // 🔍 Find token by OTP value
    Optional<VerificationToken> findByToken(String token);

    // 🔍 Find latest token for a user (forgot password flow)
    Optional<VerificationToken> findTopByUserOrderByExpiryTimeDesc(User user);

    // ❌ Delete all tokens for a user (after successful reset)
    void deleteByUser(User user);
}
