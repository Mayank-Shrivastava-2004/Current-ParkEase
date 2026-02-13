package com.parkease.backend.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.parkease.backend.dto.AdminDriverResponse;
import com.parkease.backend.service.AdminDriverService;

@RestController
@RequestMapping("/api/admin/drivers")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDriverController {

    private final AdminDriverService service;

    public AdminDriverController(AdminDriverService service) {
        this.service = service;
    }

    @GetMapping
    public List<AdminDriverResponse> getDrivers(@RequestParam(required = false) String status) {
        return service.getDrivers(status);
    }

    @PutMapping("/{id}/approve")
    public void approve(@PathVariable Long id) {
        service.approveDriver(id);
    }

    @DeleteMapping("/{id}/reject")
    public void reject(@PathVariable Long id) {
        service.rejectDriver(id);
    }

    @PutMapping("/{id}/suspend")
    public void suspend(@PathVariable Long id) {
        service.suspendDriver(id);
    }

    @PutMapping("/{id}/reactivate")
    public void reactivate(@PathVariable Long id) {
        service.reactivateDriver(id);
    }
}
