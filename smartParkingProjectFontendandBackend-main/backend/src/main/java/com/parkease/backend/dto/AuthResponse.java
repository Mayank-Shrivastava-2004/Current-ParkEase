package com.parkease.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token; // JWT token
    private String role; // ADMIN / PROVIDER / DRIVER
    private String message; // optional message
    private UserInfo user; // 🔥 ADDED for frontend compatibility

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String phoneNumber;
        private String role;
        private boolean approved;
    }
}
