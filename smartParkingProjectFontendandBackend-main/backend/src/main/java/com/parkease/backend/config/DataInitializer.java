package com.parkease.backend.config;

import com.parkease.backend.entity.User;
import com.parkease.backend.enumtype.Role;
import com.parkease.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder,
            com.parkease.backend.repository.NotificationRepository notificationRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                // Admin
                User admin = new User();
                admin.setFullName("Mayank");
                admin.setEmail("admin@gmail.com");
                admin.setPhoneNumber("9876543210");
                admin.setLocation("Noida, Uttar Pradesh");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                admin.setApproved(true);
                admin.setEnabled(true);
                admin.setCreatedAt(java.time.LocalDateTime.now().minusMonths(3));
                userRepository.save(admin);

                // Add Initial Audit Log
                com.parkease.backend.entity.Notification initLog = new com.parkease.backend.entity.Notification();
                initLog.setMessage("System initialized with verified root admin credentials.");
                initLog.setType("SYSTEM");
                initLog.setTargetRole("ADMIN");
                initLog.setRead(false);
                initLog.setCreatedAt(java.time.LocalDateTime.now());
                notificationRepository.save(initLog);

                // Driver
                User driver = new User();
                driver.setFullName("Test Driver");
                driver.setEmail("driver@parkease.com");
                driver.setPhoneNumber("1111111111");
                driver.setPassword(passwordEncoder.encode("driver123"));
                driver.setRole(Role.DRIVER);
                driver.setApproved(true);
                driver.setEnabled(true);
                driver.setCreatedAt(java.time.LocalDateTime.now().minusMonths(2));
                userRepository.save(driver);

                // Provider
                User provider = new User();
                provider.setFullName("Test Provider");
                provider.setEmail("provider@parkease.com");
                provider.setPhoneNumber("2222222222");
                provider.setPassword(passwordEncoder.encode("provider123"));
                provider.setRole(Role.PROVIDER);
                provider.setApproved(true);
                provider.setEnabled(true);
                provider.setVerificationStatus(com.parkease.backend.enumtype.VerificationStatus.APPROVED);
                provider.setCreatedAt(java.time.LocalDateTime.now().minusWeeks(1));
                userRepository.save(provider);

                System.out.println(
                        "Default users created: admin@gmail.com / admin123, driver@parkease.com / driver123");
            }
        };
    }
}
