package com.parkease.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkease.backend.dto.AdminProviderResponse;
import com.parkease.backend.entity.Notification;
import com.parkease.backend.entity.User;
import com.parkease.backend.enumtype.Role;
import com.parkease.backend.enumtype.VerificationStatus;
import com.parkease.backend.repository.NotificationRepository;
import com.parkease.backend.repository.UserRepository;

@Service
@Transactional
public class AdminProviderService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public AdminProviderService(
            UserRepository userRepository,
            NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    /*
     * =====================================================
     * GET ALL PROVIDERS (ADMIN DASHBOARD)
     * =====================================================
     */
    public List<AdminProviderResponse> getProviders(String status) {
        List<User> providers = userRepository.findByRole(Role.PROVIDER);

        if (status != null) {
            if ("PENDING".equalsIgnoreCase(status)) {
                providers = providers.stream().filter(u -> !u.isApproved()).toList();
            } else if ("APPROVED".equalsIgnoreCase(status)) {
                providers = providers.stream().filter(u -> u.isApproved() && u.isEnabled()).toList();
            } else if ("SUSPENDED".equalsIgnoreCase(status)) {
                providers = providers.stream().filter(u -> u.isApproved() && !u.isEnabled()).toList();
            }
        }

        return providers.stream()
                .map(this::mapToDto)
                .toList();
    }

    /*
     * =====================================================
     * APPROVE PROVIDER
     * =====================================================
     */
    public void approveProvider(Long id) {
        System.out.println("DEBUG: Entering approveProvider for ID: " + id);
        User provider = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Provider with ID " + id + " not found in database."));

        // ✅ REPAIR DATA ON THE FLY (Fail-proof)
        if (provider.getFullName() == null)
            provider.setFullName("User_" + id);
        if (provider.getPhoneNumber() == null)
            provider.setPhoneNumber("0000000000");
        if (provider.getParkingAreaName() == null)
            provider.setParkingAreaName("Pending Setup");
        if (provider.getLocation() == null)
            provider.setLocation("Not Specified");
        if (provider.getTotalSlots() == null)
            provider.setTotalSlots(0);

        provider.setApproved(true);
        provider.setEnabled(true);
        provider.setVerificationStatus(VerificationStatus.APPROVED);

        try {
            userRepository.saveAndFlush(provider);
            System.out.println("DEBUG: Provider " + id + " status updated and flushed.");
        } catch (Exception e) {
            System.err.println("DB ERROR during approval: " + e.getMessage());
            throw new RuntimeException("Database could not save provider: " + e.getMessage());
        }

        // ✅ SILENT NOTIFICATION (Does not block approval)
        try {
            createNotification(
                    "Account Approved! Welcome to ParkEase.",
                    "PROVIDER", "INFO", id);
        } catch (Exception e) {
            System.err.println("Non-critical: Notification failed, but provider is approved.");
        }
    }

    /*
     * =====================================================
     * SUSPEND PROVIDER
     * =====================================================
     */
    public void suspendProvider(Long id) {
        User provider = getProvider(id);

        provider.setEnabled(false);
        provider.setVerificationStatus(VerificationStatus.SUSPENDED);
        userRepository.save(provider);

        createNotification(
                "Your provider account has been suspended by admin.",
                "PROVIDER");
    }

    /*
     * =====================================================
     * REACTIVATE PROVIDER
     * =====================================================
     */
    public void reactivateProvider(Long id) {
        User provider = getProvider(id);

        provider.setEnabled(true);
        provider.setVerificationStatus(VerificationStatus.APPROVED);
        userRepository.save(provider);

        createNotification(
                "Your provider account has been reactivated by admin.",
                "PROVIDER");
    }

    /*
     * =====================================================
     * REJECT PROVIDER
     * =====================================================
     */
    public void rejectProvider(Long id) {
        User provider = getProvider(id);

        provider.setVerificationStatus(VerificationStatus.REJECTED);
        userRepository.delete(provider);

        createNotification(
                "A provider application was rejected by admin.",
                "ADMIN");
    }

    /*
     * =====================================================
     * HELPERS
     * =====================================================
     */

    private User getProvider(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        if (user.getRole() != Role.PROVIDER) {
            throw new RuntimeException("User is not a provider");
        }
        return user;
    }

    private void createNotification(String message, String targetRole) {
        createNotification(message, targetRole, "INFO", null);
    }

    private void createNotification(String message, String targetRole, String type, Long refId) {
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setTargetRole(targetRole);
        notification.setType(type);
        notification.setRefId(refId);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }

    private AdminProviderResponse mapToDto(User u) {
        AdminProviderResponse dto = new AdminProviderResponse();
        dto.id = u.getId();
        dto.name = u.getFullName();
        dto.ownerName = u.getFullName();
        dto.email = u.getEmail();
        dto.phone = u.getPhoneNumber();
        dto.appliedDate = u.getCreatedAt();
        dto.parkingAreaName = u.getParkingAreaName();
        dto.location = u.getLocation();
        dto.totalSlots = u.getTotalSlots() != null ? u.getTotalSlots() : 0;

        if (!u.isApproved()) {
            dto.status = "pending";
        } else if (!u.isEnabled()) {
            dto.status = "suspended";
        } else {
            dto.status = "approved";
        }
        return dto;
    }
}
