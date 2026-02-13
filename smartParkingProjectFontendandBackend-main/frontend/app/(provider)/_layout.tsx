import { Stack } from 'expo-router';

export default function ProviderLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Provider Login', headerShown: false }} />
            <Stack.Screen name="register" options={{ title: 'Provider Registration', headerShown: true }} />
            <Stack.Screen name="forgot-password" options={{ title: 'Forgot Password', headerShown: true }} />
            <Stack.Screen name="dashboard" options={{ title: 'Provider Dashboard', headerShown: false }} />
        </Stack>
    );
}
