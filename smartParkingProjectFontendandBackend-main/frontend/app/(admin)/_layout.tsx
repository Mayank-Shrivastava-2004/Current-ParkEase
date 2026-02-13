import { Stack } from 'expo-router';

export default function AdminLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Admin Login', headerShown: false }} />
            <Stack.Screen name="register" options={{ title: 'Admin Registration', headerShown: true }} />
            <Stack.Screen name="forgot-password" options={{ title: 'Forgot Password', headerShown: true }} />
            <Stack.Screen name="dashboard" options={{ title: 'Admin Dashboard', headerShown: false }} />
        </Stack>
    );
}
