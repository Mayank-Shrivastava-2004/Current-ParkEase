import axios from 'axios';

/* ===== Types ===== */
export type SlotStatus = 'AVAILABLE' | 'OCCUPIED';
export type VehicleType = 'CAR' | 'BIKE' | 'TRUCK';

export interface ParkingSlotApi {
  id: number;
  label: string;        // mapped from slotNumber
  status: SlotStatus;  // derived from occupied
  vehicleType: VehicleType;
}

/* ===== API Call ===== */
export async function fetchAdminParkingSlots(
  vehicleType: VehicleType
): Promise<ParkingSlotApi[]> {
  const res = await axios.get('/api/admin/parking-slots', {
    params: { vehicleType },
  });

  // 🔁 Map backend → frontend shape
  return res.data.map((slot: any) => ({
    id: slot.id,
    label: slot.slotNumber,
    vehicleType: slot.vehicleType,
    status: slot.occupied ? 'OCCUPIED' : 'AVAILABLE',
  }));
}
