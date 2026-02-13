import axios from 'axios';
import api from './axios';

/* ===== Types ===== */
export interface ProviderSlot {
    id: number;
    code: string;
    slotNumber: string;
    isOccupied: boolean;
    earnings: number;
    hours: number;
    vehicleType: 'CAR' | 'BIKE' | 'TRUCK';
}

export interface ProviderDashboard {
    summary: {
        totalRevenue: number;
        occupancyRate: number;
        weeklyGrowth: number;
        totalSlots: number;
        occupiedSlots: number;
    };
    online: boolean;
    approved: boolean;
}

export interface ProviderBooking {
    id: number;
    driverName: string;
    slotNumber: string;
    startTime: string;
    endTime: string;
    amount: number;
    status: 'active' | 'completed';
}

export interface ProviderEarnings {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
    transactions: EarningsTransaction[];
}

export interface EarningsTransaction {
    id: number;
    amount: number;
    description: string;
    timestamp: string;
    type: 'booking' | 'settlement';
}

/* ===== API Calls ===== */

/**
 * Fetch provider dashboard data
 */
export async function fetchProviderDashboard(): Promise<ProviderDashboard> {
    const res = await api.get('/provider/dashboard');
    return res.data;
}

/**
 * Fetch all provider slots
 */
export async function fetchProviderSlots(): Promise<ProviderSlot[]> {
    const res = await api.get('/provider/slots');
    return res.data;
}

/**
 * Add a new parking slot
 */
export async function addParkingSlot(data: {
    slotNumber: string;
    vehicleType: 'CAR' | 'BIKE' | 'TRUCK';
    pricePerHour: number;
}): Promise<void> {
    await api.post('/provider/slots', data);
}

/**
 * Delete a parking slot
 */
export async function deleteParkingSlot(slotId: number): Promise<void> {
    await api.delete(`/provider/slots/${slotId}`);
}

/**
 * Toggle provider online/offline status
 */
export async function updateProviderStatus(online: boolean): Promise<void> {
    await api.post('/provider/status', { online });
}

/**
 * Fetch provider bookings
 */
export async function fetchProviderBookings(): Promise<ProviderBooking[]> {
    const res = await api.get('/provider/bookings');
    return res.data;
}

/**
 * Fetch provider earnings
 */
export async function fetchProviderEarnings(): Promise<ProviderEarnings> {
    const res = await api.get('/provider/earnings');
    return res.data;
}

/**
 * Get provider profile
 */
export async function fetchProviderProfile(): Promise<any> {
    const res = await api.get('/provider/profile');
    return res.data;
}

/**
 * Update provider profile
 */
export async function updateProviderProfile(data: any): Promise<void> {
    await api.put('/provider/profile', data);
}

/**
 * Request withdrawal
 */
export async function requestWithdrawal(amount: number): Promise<void> {
    await api.post('/provider/withdrawal', { amount });
}
