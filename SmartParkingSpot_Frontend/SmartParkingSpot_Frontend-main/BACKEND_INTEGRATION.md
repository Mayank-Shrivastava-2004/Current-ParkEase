# Backend Integration Guide

## Overview
This document explains the backend integration that has been added to the SmartParkingSpot_Frontend project.

## Changes Made

### 1. Dependencies Added
The following packages have been added to `package.json`:
- **axios** (^1.13.4): HTTP client for making API requests
- **@react-native-async-storage/async-storage** (2.2.0): For storing authentication tokens

### 2. API Configuration Files

#### `constants/api.ts`
Centralized base URL configuration for the backend:
```typescript
const BASE_URL = "http://localhost:8080";
export default BASE_URL;
```

#### `components/api/axios.ts`
Axios instance with default configuration:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

#### `components/api/adminParkingSlots.ts`
API service for admin parking slot management with TypeScript types.

### 3. Backend-Integrated Components

#### `components/admin/NotificationBell.tsx`
- Fetches real-time notifications from backend
- Displays unread count badge
- Allows marking notifications as read
- Navigates to provider approvals when clicking provider-related notifications

### 4. Backend-Integrated Screens

#### `app/(admin)/dashboard.tsx`
- Fetches real analytics data from `/api/admin/analytics`
- Displays:
  - Total users (drivers + providers)
  - Total revenue
  - Weekly growth statistics
- Includes working notification bell
- Links to analytics and provider management screens

#### `app/(admin)/analytics.tsx`
- Comprehensive analytics dashboard
- Fetches data from:
  - `/api/admin/analytics` - Main analytics
  - `/api/admin/analytics/parking-duration` - Duration statistics
- Displays:
  - Revenue overview (total, platform fees, provider earnings)
  - Occupancy donut chart
  - Parking duration bar chart
  - User growth statistics
  - Top providers list

#### `app/(admin)/providers.tsx`
- Provider management screen
- Fetches providers from `/api/admin/providers`
- Actions available:
  - **Approve** pending providers: `PUT /api/admin/providers/{id}/approve`
  - **Reject** pending providers: `PUT /api/admin/providers/{id}/reject`
  - **Suspend** approved providers: `PUT /api/admin/providers/{id}/suspend`
  - **Reactivate** suspended providers: `PUT /api/admin/providers/{id}/reactivate`

## Backend API Endpoints Used

### Admin Analytics
- `GET /api/admin/analytics` - Main analytics data
- `GET /api/admin/analytics/parking-duration` - Parking duration statistics

### Admin Notifications
- `GET /api/admin/notifications` - Fetch all notifications
- `PUT /api/admin/notifications/{id}/read` - Mark notification as read

### Admin Provider Management
- `GET /api/admin/providers` - Fetch all providers
- `PUT /api/admin/providers/{id}/approve` - Approve provider
- `PUT /api/admin/providers/{id}/reject` - Reject provider
- `PUT /api/admin/providers/{id}/suspend` - Suspend provider
- `PUT /api/admin/providers/{id}/reactivate` - Reactivate provider

## Authentication

All API calls use Bearer token authentication:
```typescript
const token = localStorage.getItem('token');

fetch(url, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## Running the Application

### Prerequisites
1. **Backend Server**: Ensure the Java Spring Boot backend is running on `http://localhost:8080`
2. **Database**: Backend should be connected to the database

### Installation
```bash
cd "c:\JAVA Springboard Internship\current work 06\SmartParkingSpot_Frontend\SmartParkingSpot_Frontend-main"
npm install
```

### Running on Expo
```bash
npm start
```

### Important Notes for Mobile Testing

#### Localhost Issue on Physical Devices
If you're testing on a physical phone using Expo Go:

1. **Find your computer's IP address**:
   - Windows: Run `ipconfig` in terminal, look for IPv4 Address
   - Mac/Linux: Run `ifconfig`, look for inet address

2. **Update the base URL** in these files:
   - `constants/api.ts`
   - `components/api/axios.ts`
   - Any screen files that use `http://localhost:8080`

   Change from:
   ```typescript
   const BASE_URL = "http://localhost:8080";
   ```
   
   To (example):
   ```typescript
   const BASE_URL = "http://192.168.1.100:8080";
   ```

3. **Ensure your phone and computer are on the same Wi-Fi network**

#### Testing on Emulator/Simulator
- Android Emulator: `http://10.0.2.2:8080` (maps to localhost)
- iOS Simulator: `http://localhost:8080` works fine

## Next Steps

### Remaining Integration Tasks
1. **Driver Panel Integration**:
   - Booking API integration
   - Payment processing
   - Booking history
   - Real-time parking availability

2. **Provider Panel Integration**:
   - Space management API
   - Earnings tracking
   - Booking notifications
   - Analytics dashboard

3. **Authentication Flow**:
   - Login API integration
   - Registration API integration
   - Token storage using AsyncStorage (for mobile)
   - Forgot password flow

4. **Environment Configuration**:
   - Create `.env` file for environment variables
   - Use `expo-constants` for accessing environment variables
   - Different configs for development/production

### Recommended File Structure for API Services
```
components/
  api/
    axios.ts              ✅ Created
    adminParkingSlots.ts  ✅ Created
    auth.ts              ⏳ To be created
    driver.ts            ⏳ To be created
    provider.ts          ⏳ To be created
    booking.ts           ⏳ To be created
    payment.ts           ⏳ To be created
```

## Troubleshooting

### Common Issues

1. **Network Request Failed**
   - Check if backend is running
   - Verify the base URL is correct
   - Check if phone and computer are on same network (for physical devices)

2. **401 Unauthorized**
   - Token might be expired or invalid
   - Implement token refresh logic
   - Check if token is being sent correctly

3. **CORS Errors** (Web only)
   - Configure CORS in Spring Boot backend
   - Add allowed origins in backend configuration

4. **Data Not Loading**
   - Check browser/React Native debugger console for errors
   - Verify API endpoint paths match backend routes
   - Check network tab for failed requests

## Testing Checklist

- [ ] Backend server is running
- [ ] Dependencies are installed (`npm install`)
- [ ] Base URL is configured correctly
- [ ] Admin dashboard loads analytics data
- [ ] Notifications bell shows notifications
- [ ] Provider management screen loads providers
- [ ] Provider approve/reject/suspend actions work
- [ ] Analytics screen displays charts
- [ ] Navigation between screens works

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Axios Documentation](https://axios-http.com/)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
