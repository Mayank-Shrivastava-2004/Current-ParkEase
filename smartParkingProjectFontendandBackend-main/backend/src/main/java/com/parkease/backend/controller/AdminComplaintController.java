package com.parkease.backend.controller;

import com.parkease.backend.entity.Complaint;
import com.parkease.backend.enumtype.ComplaintStatus;
import com.parkease.backend.service.ComplaintService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/complaints")
@PreAuthorize("hasRole('ADMIN')")
public class AdminComplaintController {

    private final ComplaintService service;

    public AdminComplaintController(ComplaintService service) {
        this.service = service;
    }

    @GetMapping
    public List<Complaint> all() {
        return service.getAll();
    }

    @GetMapping("/status/{status}")
    public List<Complaint> byStatus(@PathVariable ComplaintStatus status) {
        return service.getByStatus(status);
    }

    @PostMapping("/{id}/resolve")
    public Complaint resolve(
            @PathVariable Long id,
            @RequestBody String resolution
    ) {
        return service.resolve(id, resolution);
    }
}
