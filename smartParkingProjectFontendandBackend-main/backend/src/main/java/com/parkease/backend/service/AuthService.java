package com.parkease.backend.service;

import com.parkease.backend.config.JwtService;
import com.parkease.backend.dto.AuthResponse;
import com.parkease.backend.dto.LoginRequest;
import com.parkease.backend.dto.RegisterRequest;
import com.parkease.backend.entity.Notification;
import com.parkease.backend.entity.User;
import com.parkease.backend.entity.VerificationToken;
import com.parkease.backend.enumtype.Role;
import com.parkease.backend.repository.NotificationRepository;
import com.parkease.backend.repository.UserRepository;
import com.parkease.backend.repository.VerificationTokenRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Autowired
    private NotificationRepository notificationRepository; // 🔔 ADDED

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EmailService emailService;

    /*
     * =====================================================
     * REGISTER
     * =====================================================
     */
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number already registered");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        /* 🔒 Allowed Multiple Admins as requested */
        // Removed 1 admin limit logic to match driver registration flow per user
        // request

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        /* 🔑 Role-based logic and field mapping */
        if (request.getRole() == Role.PROVIDER) {
            user.setApproved(false);
            user.setEnabled(true);
            user.setVerificationStatus(com.parkease.backend.enumtype.VerificationStatus.PENDING);

            // ✅ Set defaults if missing
            user.setParkingAreaName(
                    request.getParkingAreaName() != null ? request.getParkingAreaName() : "Pending Setup");
            user.setLocation(request.getLocation() != null ? request.getLocation() : "Not Specified");
            user.setTotalSlots(request.getTotalSlots() != null ? request.getTotalSlots() : 0);
        } else if (request.getRole() == Role.DRIVER) {
            user.setApproved(false); // Drivers now require admin approval
            user.setEnabled(true);
            user.setVerificationStatus(com.parkease.backend.enumtype.VerificationStatus.PENDING);

            // Map Vehicle Details
            user.setVehicleName(request.getVehicleName());
            user.setVehicleNumber(request.getVehicleNumber());
            user.setVehicleType(request.getVehicleType());
        } else {
            // ADMIN
            user.setApproved(true);
            user.setEnabled(true);
            user.setVerificationStatus(com.parkease.backend.enumtype.VerificationStatus.APPROVED);
        }

        userRepository.save(user);

        /* 🔔 NOTIFY ADMIN ON REGISTRATION */
        if (request.getRole() == Role.PROVIDER || request.getRole() == Role.DRIVER) {
            Notification notification = new Notification();
            String message;
            if (request.getRole() == Role.PROVIDER) {
                message = String.format("New provider registered: %s. Hub: %s, Location: %s, Slots: %d",
                        user.getFullName(),
                        user.getParkingAreaName(),
                        user.getLocation(),
                        user.getTotalSlots());
            } else {
                message = "New driver registered: " + user.getFullName();
            }

            notification.setMessage(message);
            notification.setTargetRole("ADMIN");
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());

            // ✅ Smart Linking
            notification.setType(request.getRole() == Role.PROVIDER ? "PROVIDER_REGISTRATION" : "DRIVER_REGISTRATION");
            notification.setRefId(user.getId());

            notificationRepository.save(notification);
        }

        /* 📩 RESPONSE */
        if (request.getRole() == Role.PROVIDER || request.getRole() == Role.DRIVER) {
            return AuthResponse.builder()
                    .message("Registered successfully. Await admin approval.")
                    .role(user.getRole().name())
                    .build();
        }

        // Auto-login for DRIVER and ADMIN
        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .message("Registered successfully!")
                .token(token)
                .role(user.getRole().name())
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .name(user.getFullName())
                        .email(user.getEmail())
                        .phoneNumber(user.getPhoneNumber())
                        .role(user.getRole().name())
                        .approved(user.isApproved())
                        .build())
                .build();
    }

    /*
     * =====================================================
     * LOGIN
     * =====================================================
     */
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        /*
         * =====================================================
         * PROVIDER & DRIVER APPROVAL ENFORCEMENT
         * =====================================================
         */
        if (user.getRole() == Role.PROVIDER || user.getRole() == Role.DRIVER) {

            if (!user.isApproved()) {
                String type = user.getRole() == Role.PROVIDER ? "provider" : "driver";
                throw new RuntimeException(
                        "Your " + type + " account is awaiting admin approval.");
            }

            if (!user.isEnabled()) {
                String type = user.getRole() == Role.PROVIDER ? "provider" : "driver";
                throw new RuntimeException(
                        "Your " + type + " account has been suspended by admin.");
            }
        }

        /*
         * =====================================================
         * ACCOUNT ENABLE CHECK
         * =====================================================
         */
        if (!user.isEnabled()) {
            throw new RuntimeException("Your account is disabled");
        }

        /*
         * =====================================================
         * GENERATE TOKEN
         * =====================================================
         */
        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .name(user.getFullName())
                        .email(user.getEmail())
                        .phoneNumber(user.getPhoneNumber())
                        .role(user.getRole().name())
                        .approved(user.isApproved())
                        .build())
                .build();
    }

    /*
     * =====================================================
     * FORGOT PASSWORD
     * =====================================================
     */
    public void sendResetOtp(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with this email"));

        String otp = String.valueOf(
                100000 + new Random().nextInt(900000));

        verificationTokenRepository.deleteByUser(user);

        VerificationToken token = new VerificationToken(
                otp,
                LocalDateTime.now().plusMinutes(10),
                user);

        verificationTokenRepository.save(token);
        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    /*
     * =====================================================
     * RESET PASSWORD
     * =====================================================
     */
    public void resetPassword(String email, String otp, String newPassword) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        VerificationToken token = verificationTokenRepository.findByToken(otp)
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));

        if (!token.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("OTP does not belong to this user");
        }

        if (token.isExpired()) {
            throw new RuntimeException("OTP has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        verificationTokenRepository.deleteByUser(user);
    }
}
