package com.parkease.backend.repository;

import com.parkease.backend.entity.ParkingLot;
import com.parkease.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ParkingLotRepository extends JpaRepository<ParkingLot, Long> {

    List<ParkingLot> findByProvider(User provider);

    long countByActiveTrue();

    @Query("SELECT COALESCE(SUM(p.totalSlots), 0) FROM ParkingLot p WHERE p.active = true")
    long sumActiveTotalSlots();

    @Query("SELECT COALESCE(SUM(p.totalSlots), 0) FROM ParkingLot p WHERE p.provider.id = :providerId")
    int sumTotalSlotsByProvider(@Param("providerId") Long providerId);
}
