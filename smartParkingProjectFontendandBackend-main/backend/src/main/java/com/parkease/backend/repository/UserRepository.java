package com.parkease.backend.repository;

import com.parkease.backend.entity.User;
import com.parkease.backend.enumtype.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // 🔍 Find user by email (login, forgot password)
    Optional<User> findByEmail(String email);

    // 🔍 Find user by phone number
    Optional<User> findByPhoneNumber(String phoneNumber);

    // 🔍 Check if email already exists (registration)
    boolean existsByEmail(String email);

    // 🔍 Check if phone number already exists (registration)
    boolean existsByPhoneNumber(String phoneNumber);

    // 🔍 Get all users by role (admin use)
    List<User> findByRole(Role role);

    boolean existsByRole(Role role);

    // 🔍 Get providers pending approval (admin use)
    List<User> findByRoleAndApproved(Role role, boolean approved);

    long countByRole(Role role);

    long countByRoleAndCreatedAtAfter(Role role, LocalDateTime date);

    List<User> findByRoleAndApprovedTrue(Role role);

    long countByRoleAndCreatedAtBefore(Role role, LocalDateTime date);
}
