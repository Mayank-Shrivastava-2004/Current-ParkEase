package com.parkease.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.parkease.backend.dto.AdminProviderResponse;
import com.parkease.backend.service.AdminProviderService;

@RestController
@RequestMapping("/api/admin/providers")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProviderController {

    private final AdminProviderService service;

    public AdminProviderController(AdminProviderService service) {
        this.service = service;
    }

    /*
     * =====================================================
     * GET ALL PROVIDERS (ADMIN APPROVAL LIST)
     * =====================================================
     */
    @GetMapping
    public ResponseEntity<List<AdminProviderResponse>> getProviders(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(service.getProviders(status));
    }

    /*
     * =====================================================
     * APPROVE PROVIDER
     * =====================================================
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable("id") String id) {
        System.out.println("ADMIN ACTION: Approving Provider ID: " + id);
        try {
            Long providerId = Long.parseLong(id);
            service.approveProvider(providerId);
            return ResponseEntity.ok().body("{\"message\": \"Provider approved successfully\"}");
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("{\"message\": \"Invalid Provider ID format\"}");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/{id}/suspend")
    public ResponseEntity<?> suspend(@PathVariable("id") String id) {
        System.out.println("ADMIN ACTION: Suspending Provider ID: " + id);
        try {
            Long providerId = Long.parseLong(id);
            service.suspendProvider(providerId);
            return ResponseEntity.ok().body("{\"message\": \"Provider suspended successfully\"}");
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("{\"message\": \"Invalid Provider ID format\"}");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/{id}/reactivate")
    public ResponseEntity<?> reactivate(@PathVariable("id") String id) {
        System.out.println("ADMIN ACTION: Reactivating Provider ID: " + id);
        try {
            Long providerId = Long.parseLong(id);
            service.reactivateProvider(providerId);
            return ResponseEntity.ok().body("{\"message\": \"Provider reactivated successfully\"}");
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("{\"message\": \"Invalid Provider ID format\"}");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable("id") String id) {
        System.out.println("ADMIN ACTION: Rejecting Provider ID: " + id);
        try {
            Long providerId = Long.parseLong(id);
            service.rejectProvider(providerId);
            return ResponseEntity.ok().body("{\"message\": \"Provider rejected successfully\"}");
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("{\"message\": \"Invalid Provider ID format\"}");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }
}
