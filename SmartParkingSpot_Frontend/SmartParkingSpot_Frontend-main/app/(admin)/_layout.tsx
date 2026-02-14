import { Stack } from 'expo-router';
import { useNotifications } from '@/hooks/useNotifications';
import React from 'react';

export default function AdminLayout() {
    // 🔔 Register global notification listeners for Admin
    // This hook handles cleanup automatically on unmount!
    useNotifications();

    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Admin Login', headerShown: false }} />
            <Stack.Screen name="register" options={{ title: 'Admin Registration', headerShown: true }} />
            <Stack.Screen name="forgot-password" options={{ title: 'Forgot Password', headerShown: true }} />
            <Stack.Screen name="dashboard" options={{ title: 'Admin Dashboard', headerShown: false }} />
            <Stack.Screen name="drivers" options={{ title: 'Manage Drivers', headerShown: false }} />
            <Stack.Screen name="providers" options={{ title: 'Manage Providers', headerShown: false }} />
            <Stack.Screen name="analytics" options={{ title: 'Analytics', headerShown: false }} />
            <Stack.Screen name="disputes" options={{ title: 'Disputes', headerShown: false }} />
            <Stack.Screen name="settings" options={{ title: 'System Settings', headerShown: false }} />
            <Stack.Screen name="notifications" options={{ title: 'Notifications', headerShown: false }} />
            <Stack.Screen name="profile" options={{ title: 'My Profile', headerShown: false }} />
        </Stack>
    );
}
