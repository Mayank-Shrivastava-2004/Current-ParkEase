import { Stack } from 'expo-router';

export default function DriverLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Driver Login', headerShown: false }} />
            <Stack.Screen name="register" options={{ title: 'Driver Registration', headerShown: true }} />
            <Stack.Screen name="forgot-password" options={{ title: 'Forgot Password', headerShown: true }} />
            <Stack.Screen name="dashboard" options={{ title: 'Driver Dashboard', headerShown: false }} />
        </Stack>
    );
}
