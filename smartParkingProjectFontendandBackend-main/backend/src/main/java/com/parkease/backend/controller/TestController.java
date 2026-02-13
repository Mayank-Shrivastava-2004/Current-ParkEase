package com.parkease.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    // 🔓 Public test (no auth)
    @GetMapping("/public")
    public String publicTest() {
        return "Public endpoint is working";
    }

    // 🔐 Any authenticated user
    @GetMapping("/secured")
    public String securedTest() {
        return "JWT authentication is working";
    }

    // 👮 Admin only
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public String adminTest() {
        return "ADMIN access confirmed";
    }

    // 🅿 Provider only
    @PreAuthorize("hasRole('PROVIDER')")
    @GetMapping("/provider")
    public String providerTest() {
        return "PROVIDER access confirmed";
    }

    // 🚗 Driver only
    @PreAuthorize("hasRole('DRIVER')")
    @GetMapping("/driver")
    public String driverTest() {
        return "DRIVER access confirmed";
    }
}
