package com.parkease.backend.repository;

import com.parkease.backend.entity.ParkingLot;
import com.parkease.backend.entity.ParkingSlot;
import com.parkease.backend.enumtype.VehicleType;
import com.parkease.backend.enumtype.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

    List<ParkingSlot> findByParkingLot(ParkingLot parkingLot);

    Optional<ParkingSlot> findByIdAndParkingLot(Long id, ParkingLot lot);

    List<ParkingSlot> findByVehicleType(VehicleType vehicleType);

    boolean existsBySlotNumberIgnoreCaseAndParkingLot_Id(String slotNumber, Long parkingLotId);

    long countByStatus(SlotStatus status);

    long countByOccupiedTrue();

    long countByOccupiedFalse();

    long countByParkingLotAndOccupiedTrue(ParkingLot parkingLot);

    long countByParkingLotAndOccupiedFalse(ParkingLot parkingLot);

    long countByParkingLotAndStatus(ParkingLot parkingLot, SlotStatus status);

    long countByParkingLot(ParkingLot parkingLot);

    List<ParkingSlot> findByParkingLotAndVehicleType(ParkingLot parkingLot, VehicleType vehicleType);
}
