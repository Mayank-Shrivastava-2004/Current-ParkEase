import { Stack } from 'expo-router';

export default function ProviderLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Provider Login', headerShown: false }} />
            <Stack.Screen name="register" options={{ title: 'Provider Registration', headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ title: 'Forgot Password', headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ title: 'Provider Dashboard', headerShown: false }} />
            <Stack.Screen name="notifications" options={{ title: 'Notifications', headerShown: false }} />
            <Stack.Screen name="profile" options={{ title: 'My Profile', headerShown: false }} />
            <Stack.Screen name="settings" options={{ title: 'Settings', headerShown: false }} />
            <Stack.Screen name="spaces" options={{ title: 'My Spaces', headerShown: false }} />
            <Stack.Screen name="earnings" options={{ title: 'Earnings', headerShown: false }} />
            <Stack.Screen name="traffic" options={{ title: 'Live Traffic', headerShown: false }} />
            <Stack.Screen name="history" options={{ title: 'History', headerShown: false }} />
            <Stack.Screen name="ev-station" options={{ title: 'EV Station', headerShown: false }} />
            <Stack.Screen name="reviews" options={{ title: 'Reviews', headerShown: false }} />
            <Stack.Screen name="support" options={{ title: 'Support', headerShown: false }} />
        </Stack>
    );
}
