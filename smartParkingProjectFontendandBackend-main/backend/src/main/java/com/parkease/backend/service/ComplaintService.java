package com.parkease.backend.service;

import com.parkease.backend.entity.Complaint;
import com.parkease.backend.enumtype.ComplaintStatus;
import com.parkease.backend.repository.ComplaintRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComplaintService {

    private final ComplaintRepository repository;

    public ComplaintService(ComplaintRepository repository) {
        this.repository = repository;
    }

    public List<Complaint> getAll() {
        return repository.findAll();
    }

    public List<Complaint> getByStatus(ComplaintStatus status) {
        return repository.findByStatus(status);
    }

    public Complaint resolve(Long id, String resolution) {
        Complaint complaint = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setResolution(resolution);
        complaint.setStatus(ComplaintStatus.RESOLVED);

        return repository.save(complaint);
    }
}
