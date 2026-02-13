import axios from 'axios';
import api from './axios';

/* ===== Types ===== */
export interface DriverBooking {
    id: number;
    slotName: string;
    location: string;
    startTime: string;
    endTime: string;
    amount: number;
    status: 'active' | 'completed' | 'cancelled';
}

export interface ParkingSlot {
    id: number;
    name: string;
    location: string;
    price: number;
    available: boolean;
    distance: string;
    rating: number;
}

export interface DriverWallet {
    balance: number;
    transactions: Transaction[];
}

export interface Transaction {
    id: number;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    timestamp: string;
}

/* ===== API Calls ===== */

/**
 * Fetch available parking slots near driver
 */
export async function fetchAvailableSlots(
    latitude?: number,
    longitude?: number
): Promise<ParkingSlot[]> {
    const res = await api.get('/driver/slots/available', {
        params: { latitude, longitude },
    });
    return res.data;
}

/**
 * Book a parking slot
 */
export async function bookParkingSlot(
    slotId: number,
    duration: number
): Promise<{ bookingId: number; message: string }> {
    const res = await api.post('/driver/bookings', {
        slotId,
        duration,
    });
    return res.data;
}

/**
 * Fetch driver's booking history
 */
export async function fetchDriverBookings(): Promise<DriverBooking[]> {
    const res = await api.get('/driver/bookings');
    return res.data;
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: number): Promise<void> {
    await api.delete(`/driver/bookings/${bookingId}`);
}

/**
 * Fetch driver wallet details
 */
export async function fetchDriverWallet(): Promise<DriverWallet> {
    const res = await api.get('/driver/wallet');
    return res.data;
}

/**
 * Add money to wallet
 */
export async function addMoneyToWallet(amount: number): Promise<void> {
    await api.post('/driver/wallet/topup', { amount });
}

/**
 * Get driver profile
 */
export async function fetchDriverProfile(): Promise<any> {
    const res = await api.get('/driver/profile');
    return res.data;
}

/**
 * Update driver profile
 */
export async function updateDriverProfile(data: any): Promise<void> {
    await api.put('/driver/profile', data);
}
