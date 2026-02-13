package com.parkease.backend.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.parkease.backend.dto.AdminDisputeResponse;
import com.parkease.backend.service.AdminDisputeService;

@RestController
@RequestMapping("/api/admin/disputes")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDisputeController {

    private final AdminDisputeService service;

    public AdminDisputeController(AdminDisputeService service) {
        this.service = service;
    }

    @GetMapping
    public List<AdminDisputeResponse> getDisputes() {
        return service.getAllDisputes();
    }

    @PutMapping("/{id}/resolve")
    public void resolve(@PathVariable Long id) {
        service.markResolved(id);
    }

    @PutMapping("/{id}/escalate")
    public void escalate(@PathVariable Long id) {
        service.escalate(id);
    }
}
