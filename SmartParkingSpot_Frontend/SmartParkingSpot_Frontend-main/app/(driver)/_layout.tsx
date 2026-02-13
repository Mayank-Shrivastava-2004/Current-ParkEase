import { Stack } from 'expo-router';

export default function DriverLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Driver Login', headerShown: false }} />
            <Stack.Screen name="register" options={{ title: 'Driver Registration', headerShown: true }} />
            <Stack.Screen name="forgot-password" options={{ title: 'Forgot Password', headerShown: true }} />
            <Stack.Screen name="dashboard" options={{ title: 'Driver Dashboard', headerShown: false }} />
            <Stack.Screen name="notifications" options={{ title: 'Notifications', headerShown: false }} />
            <Stack.Screen name="profile" options={{ title: 'My Profile', headerShown: false }} />
            <Stack.Screen name="settings" options={{ title: 'Settings', headerShown: false }} />
            <Stack.Screen name="find" options={{ title: 'Find Parking', headerShown: false }} />
            <Stack.Screen name="bookings" options={{ title: 'My Bookings', headerShown: false }} />
            <Stack.Screen name="payments" options={{ title: 'Payments', headerShown: false }} />
            <Stack.Screen name="ev" options={{ title: 'EV Charging', headerShown: false }} />
            <Stack.Screen name="support" options={{ title: 'Support', headerShown: false }} />
            <Stack.Screen name="charging-points" options={{ headerShown: false }} />
        </Stack>
    );
}
