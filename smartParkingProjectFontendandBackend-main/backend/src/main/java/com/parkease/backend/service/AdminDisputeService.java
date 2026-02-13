package com.parkease.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.parkease.backend.dto.AdminDisputeResponse;

@Service
public class AdminDisputeService {

    // ===== GET ALL DISPUTES =====
    // Currently returns empty list (no dispute system yet)
    public List<AdminDisputeResponse> getAllDisputes() {
        return List.of();
    }

    // ===== MARK RESOLVED =====
    public void markResolved(Long id) {
        // NO-OP for now (real logic added with Complaint table)
    }

    // ===== ESCALATE =====
    public void escalate(Long id) {
        // NO-OP for now
    }
}
