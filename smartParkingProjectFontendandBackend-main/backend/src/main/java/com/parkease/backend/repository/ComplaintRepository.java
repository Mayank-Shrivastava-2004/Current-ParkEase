package com.parkease.backend.repository;

import com.parkease.backend.entity.Complaint;
import com.parkease.backend.enumtype.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByStatus(ComplaintStatus status);

    long countByStatus(ComplaintStatus status);
}
