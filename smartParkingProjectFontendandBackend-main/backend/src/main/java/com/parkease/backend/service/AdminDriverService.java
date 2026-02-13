package com.parkease.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.parkease.backend.dto.AdminDriverResponse;
import com.parkease.backend.entity.User;
import com.parkease.backend.enumtype.Role;
import com.parkease.backend.repository.UserRepository;

@Service
public class AdminDriverService {

    private final UserRepository userRepository;

    public AdminDriverService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ===== GET ALL DRIVERS =====
    public List<AdminDriverResponse> getDrivers(String status) {
        return userRepository.findByRole(Role.DRIVER)
                .stream()
                .filter(u -> {
                    if ("PENDING".equalsIgnoreCase(status))
                        return !u.isApproved();
                    if ("APPROVED".equalsIgnoreCase(status))
                        return u.isApproved();
                    return true;
                })
                .map(this::map)
                .toList();
    }

    // ===== APPROVE DRIVER =====
    public void approveDriver(Long id) {
        User u = getDriver(id);
        u.setApproved(true);
        u.setVerificationStatus(com.parkease.backend.enumtype.VerificationStatus.APPROVED);
        userRepository.save(u);
    }

    // ===== REJECT DRIVER =====
    public void rejectDriver(Long id) {
        User u = getDriver(id);
        userRepository.delete(u);
    }

    // ===== SUSPEND DRIVER =====
    public void suspendDriver(Long id) {
        User u = getDriver(id);
        u.setEnabled(false);
        userRepository.save(u);
    }

    // ===== REACTIVATE DRIVER =====
    public void reactivateDriver(Long id) {
        User u = getDriver(id);
        u.setEnabled(true);
        userRepository.save(u);
    }

    // ===== HELPERS =====
    private User getDriver(Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        if (u.getRole() != Role.DRIVER) {
            throw new RuntimeException("User is not a driver");
        }
        return u;
    }

    private AdminDriverResponse map(User u) {
        AdminDriverResponse d = new AdminDriverResponse();
        d.id = u.getId();
        d.name = u.getFullName();
        d.email = u.getEmail();
        d.phone = u.getPhoneNumber();
        d.joinedDate = u.getCreatedAt();
        d.status = !u.isApproved() ? "pending" : (u.isEnabled() ? "active" : "suspended");
        d.approved = u.isApproved();

        if (u.getVehicleNumber() != null)
            d.vehicleNumber = u.getVehicleNumber();
        if (u.getVehicleType() != null)
            d.vehicleType = u.getVehicleType();

        return d;
    }
}
