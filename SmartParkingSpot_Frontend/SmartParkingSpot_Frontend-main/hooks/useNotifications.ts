import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 🔔 ROBUST NOTIFICATION HOOK
 * 
 * This hook properly manages Expo notification listeners with:
 * - Automatic cleanup on unmount (prevents memory leaks)
 * - Safe navigation using expo-router
 * - No dependency on component-specific navigation props
 * 
 * Usage: Call this hook in your root layout or admin dashboard
 */
export function useNotifications() {
    // Use refs to track if component is mounted
    const isMounted = useRef(true);
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);

    useEffect(() => {
        // Mark component as mounted
        isMounted.current = true;

        // 🔓 Request permissions on mount
        requestNotificationPermissions();

        // 🔧 Configure how notifications should be handled when app is in foreground
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });

        // 📥 LISTENER 1: When notification is RECEIVED (app is open)
        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                if (!isMounted.current) return; // Safety check

                console.log('📥 Notification received:', notification);

                // You can update state here if needed
                // Example: Show a toast, update badge count, etc.
                const data = notification.request.content.data;

                if (data?.type === 'PROVIDER_REGISTRATION' || data?.type === 'DRIVER_REGISTRATION') {
                    console.log('New registration notification:', data);
                    // Optionally trigger a refresh of notifications
                }
            }
        );

        // 👆 LISTENER 2: When notification is TAPPED/CLICKED
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                if (!isMounted.current) return; // Safety check

                console.log('👆 Notification tapped:', response);

                const data = response.notification.request.content.data;

                // ✅ SAFE NAVIGATION: Using expo-router's global router
                // This doesn't depend on any component's navigation prop
                try {
                    if (data?.type === 'PROVIDER_REGISTRATION') {
                        router.push('/(admin)/providers');
                    } else if (data?.type === 'DRIVER_REGISTRATION') {
                        router.push('/(admin)/drivers');
                    } else if (data?.route) {
                        // Generic route navigation
                        router.push(data.route as any);
                    } else {
                        // Default: Go to admin dashboard
                        router.push('/(admin)/dashboard');
                    }
                } catch (error) {
                    console.error('Navigation error:', error);
                }
            }
        );

        // 🧹 CLEANUP FUNCTION: This runs when component unmounts
        return () => {
            console.log('🧹 Cleaning up notification listeners...');
            isMounted.current = false;

            // Remove listeners to prevent memory leaks
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []); // Empty dependency array = runs once on mount, cleanup on unmount
}

/**
 * 🔔 REQUEST NOTIFICATION PERMISSIONS
 * 
 * Call this when user logs in or when app starts
 */
export async function requestNotificationPermissions() {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('⚠️ Notification permissions not granted');
            return false;
        }

        console.log('✅ Notification permissions granted');
        return true;
    } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return false;
    }
}

/**
 * 📤 SEND LOCAL NOTIFICATION (for testing)
 */
export async function sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "New Registration! 🎉",
            body: 'A new provider has registered and needs approval',
            data: {
                type: 'PROVIDER_REGISTRATION',
                refId: 123
            },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1,
        },
    });
}

/**
 * 🔢 GET PUSH TOKEN (for backend integration)
 */
export async function getPushToken() {
    try {
        const token = await Notifications.getExpoPushTokenAsync({
            projectId: 'your-project-id', // Replace with your Expo project ID
        });
        console.log('Push token:', token.data);

        // Save to AsyncStorage
        await AsyncStorage.setItem('pushToken', token.data);

        return token.data;
    } catch (error) {
        console.error('Error getting push token:', error);
        return null;
    }
}
