import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { login } from '../api/auth';
import ParkEaseLogo from '../ParkEaseLogo';

type Role = 'driver' | 'provider' | 'admin';

interface UnifiedLoginProps {
    role: Role;
}

export default function UnifiedLogin({ role }: UnifiedLoginProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const config = {
        driver: {
            title: 'Welcome Back',
            subtitle: 'Access smart mobility tools',
            icon: 'car-sport' as const,
            colors: ['#3B82F6', '#1D4ED8'],
            dashRoute: '/(driver)/dashboard',
            forgotRoute: '/(driver)/forgot-password',
            registerRoute: '/(driver)/register',
        },
        provider: {
            title: 'Partner Login',
            subtitle: 'Secure asset management',
            icon: 'business' as const,
            colors: ['#8B5CF6', '#6D28D9'],
            dashRoute: '/(provider)/dashboard',
            forgotRoute: '/(provider)/forgot-password',
            registerRoute: '/(provider)/register',
        },
        admin: {
            title: 'Admin Terminal',
            subtitle: 'Full system encryption active',
            icon: 'shield-checkmark' as const,
            colors: ['#1F2937', '#111827'],
            dashRoute: '/(admin)/dashboard',
            forgotRoute: '/(admin)/forgot-password',
            registerRoute: '/(admin)/register',
        },
    };

    const currentConfig = config[role];

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Incomplete', 'Credentials required for secure entry.');
            return;
        }

        setIsLoading(true);
        console.log(`Attempting login for ${email} as ${role}...`);

        try {
            const response = await login({ email: email.trim(), password });
            console.log('Login successful, navigating to dashboard...');

            // Small delay to ensure state updates if needed
            setTimeout(() => {
                setIsLoading(false);
                router.replace(currentConfig.dashRoute as any);
            }, 100);
        } catch (error: any) {
            setIsLoading(false);
            console.error('Login Error:', error);

            let errorMessage = 'Authentication error. Please re-verify.';
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Server connection timed out. Please check if the backend is running and the IP is correct (10.67.158.172).';
            } else if (error.response) {
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'No response from server. Check your network or backend IP configuration (10.67.158.172).';
            } else {
                errorMessage = error.message || errorMessage;
            }

            Alert.alert('Access Denied', errorMessage);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                {/* DYNAMIC GRADIENT HEADER */}
                <LinearGradient
                    colors={currentConfig.colors as any}
                    className="h-96 justify-center items-center rounded-b-[60px] relative overflow-hidden shadow-2xl shadow-black/20"
                >
                    <Ionicons
                        name={currentConfig.icon}
                        size={300}
                        color="white"
                        style={{ position: 'absolute', right: -60, top: -60, opacity: 0.1 }}
                    />

                    <Animated.View entering={FadeInUp.duration(1000).springify()} className="items-center z-10">
                        <ParkEaseLogo size={90} dark={true} />
                        <Text className="text-3xl font-black text-white mt-6">{currentConfig.title}</Text>
                        <Text className="text-white/60 mt-2 text-xs font-black uppercase tracking-[3px]">{currentConfig.subtitle}</Text>
                    </Animated.View>
                </LinearGradient>

                {/* FORM LAYER */}
                <View className="px-8 -mt-10 mb-10">
                    <Animated.View
                        entering={FadeInDown.delay(200).duration(600)}
                        className="bg-white rounded-[45px] p-8 shadow-2xl shadow-black/5 border border-gray-100"
                    >
                        <View className="space-y-6">
                            <View>
                                <Text className="text-[10px] text-gray-400 font-black mb-3 uppercase tracking-widest ml-1">Secure Email</Text>
                                <View className="bg-gray-50 flex-row items-center p-5 rounded-[22px] border border-gray-100">
                                    <Ionicons name="mail" size={20} color="#94A3B8" />
                                    <TextInput
                                        placeholder="Enter your email"
                                        placeholderTextColor="#94A3B8"
                                        value={email}
                                        onChangeText={setEmail}
                                        className="flex-1 ml-4 font-bold text-gray-900"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            <View className="mt-6">
                                <Text className="text-[10px] text-gray-400 font-black mb-3 uppercase tracking-widest ml-1">Key Password</Text>
                                <View className="bg-gray-50 flex-row items-center p-5 rounded-[22px] border border-gray-100">
                                    <Ionicons name="lock-closed" size={20} color="#94A3B8" />
                                    <TextInput
                                        placeholder="••••••••"
                                        placeholderTextColor="#94A3B8"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        className="flex-1 ml-4 font-bold text-gray-900"
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#94A3B8" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => router.push(currentConfig.forgotRoute as any)}
                                className="mt-4 self-end"
                            >
                                <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Recovery Access?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleLogin}
                                disabled={isLoading}
                                className="mt-8 overflow-hidden rounded-[25px]"
                            >
                                <LinearGradient colors={currentConfig.colors as any} className="py-5 items-center">
                                    {isLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-black uppercase tracking-widest">Authorize Access</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* ACTIONS */}
                    <View className="mt-10 items-center">
                        <View className="flex-row items-center">
                            <Text className="text-gray-400 font-bold text-xs">New user protocol? </Text>
                            <TouchableOpacity onPress={() => router.push(currentConfig.registerRoute as any)}>
                                <Text style={{ color: currentConfig.colors[0] }} className="font-black text-xs uppercase tracking-widest underline">Initialize Account</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={() => router.replace('/')}
                            className="mt-8 flex-row items-center bg-gray-100 px-6 py-3 rounded-full"
                        >
                            <Ionicons name="apps" size={16} color="#475569" />
                            <Text className="text-gray-500 font-black text-[9px] uppercase tracking-widest ml-2">Switch Workspace</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
