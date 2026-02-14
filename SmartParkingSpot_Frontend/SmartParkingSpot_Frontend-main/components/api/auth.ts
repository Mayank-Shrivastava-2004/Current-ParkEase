import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './axios';

/* ===== Types ===== */
export interface LoginRequest {
    email: string;
    password: string;
    // Note: Backend doesn't require role in login request
    // Role is determined from the user record in database
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    role: 'DRIVER' | 'PROVIDER' | 'ADMIN';
    // Provider specific fields
    parkingAreaName?: string;
    location?: string;
    totalSlots?: number;
    ownerName?: string;
    aadharNumber?: string;
    propertyPermitNumber?: string;
    // Driver specific fields
    vehicleName?: string;
    vehicleNumber?: string;
    vehicleType?: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        approved?: boolean;
    };
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

// Helper to safely store in AsyncStorage
const safeStore = async (key: string, value: any) => {
    try {
        if (value === null || value === undefined) {
            console.warn(`Attempted to save null/undefined for key: ${key}`);
            return;
        }
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await AsyncStorage.setItem(key, stringValue);
    } catch (error) {
        console.error(`SafeStore failed for ${key}:`, error);
    }
};

/* ===== API Calls ===== */

/**
 * Login user
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post('/auth/login', data);

    // Store data safely
    if (res.data.token) {
        await safeStore('token', res.data.token);
    }
    if (res.data.user) {
        await safeStore('user', res.data.user);
    }

    return res.data;
}

/**
 * Register new user (Driver or Provider)
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await api.post('/auth/register', data);

    // Store data safely
    if (res.data.token) {
        await safeStore('token', res.data.token);
    }
    if (res.data.user) {
        await safeStore('user', res.data.user);
    }

    return res.data;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
    try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
    } catch (error) {
        console.error('Failed to clear auth data:', error);
    }
}

/**
 * Get current user from storage
 */
export async function getCurrentUser(): Promise<any> {
    try {
        const userStr = await AsyncStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Failed to get user:', error);
        return null;
    }
}

/**
 * Get current token from storage
 */
export async function getToken(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem('token');
    } catch (error) {
        console.error('Failed to get token:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const token = await getToken();
    return !!token;
}

/**
 * Forgot password - send reset email
 */
export async function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await api.post('/auth/forgot-password', data);
}

/**
 * Reset password with token
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
    await api.post('/auth/reset-password', data);
}

/**
 * Verify email
 */
export async function verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
}

/**
 * Refresh token
 */
export async function refreshToken(): Promise<AuthResponse> {
    const res = await api.post('/auth/refresh');

    // Update token using AsyncStorage
    try {
        await AsyncStorage.setItem('token', res.data.token);
    } catch (error) {
        console.error('Failed to update token:', error);
    }

    return res.data;
}

/**
 * Change password
 */
export async function changePassword(
    currentPassword: string,
    newPassword: string
): Promise<void> {
    await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
    });
}
