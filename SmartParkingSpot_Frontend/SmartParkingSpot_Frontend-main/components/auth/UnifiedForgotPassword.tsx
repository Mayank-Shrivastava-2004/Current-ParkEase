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
    View
} from 'react-native';
import Animated, { FadeInUp, SlideInRight, SlideOutLeft } from 'react-native-reanimated';

type Role = 'driver' | 'provider' | 'admin';

interface UnifiedForgotPasswordProps {
    role: Role;
}

export default function UnifiedForgotPassword({ role }: UnifiedForgotPasswordProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Config based on role (Distinct Professional Colors)
    const config = {
        driver: { themeColor: '#00B894', iconColor: '#00B894' },   // Teal
        provider: { themeColor: '#6C5CE7', iconColor: '#6C5CE7' }, // Indigo
        admin: { themeColor: '#2D3436', iconColor: '#2D3436' },    // Slate
    };

    const currentConfig = config[role];

    const handleSendOTP = () => {
        if (!email) return Alert.alert('Error', 'Email is required');
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('otp');
        }, 1500);
    };

    const handleVerifyOTP = () => {
        if (otp !== '1234') return Alert.alert('Error', 'Invalid OTP. Use 1234');
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('reset');
        }, 1000);
    };

    const handleResetPassword = () => {
        if (newPassword !== confirmPassword) return Alert.alert('Error', 'Passwords do not match');
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert('Success', 'Password reset successfully!', [{ text: 'Login', onPress: () => router.back() }]);
        }, 1500);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <View className="px-6 pt-16 pb-8 h-full">
                    <Animated.View entering={FadeInUp.duration(1000)} className="mb-10">
                        <TouchableOpacity onPress={() => step === 'email' ? router.back() : setStep(prev => prev === 'reset' ? 'otp' : 'email')} className="w-10 h-10 bg-gray-50 rounded-full justify-center items-center mb-6 border border-gray-100">
                            <Ionicons name="arrow-back" size={24} color="#2D3436" />
                        </TouchableOpacity>
                        <Text className="text-3xl font-black text-gray-900">
                            {step === 'email' ? 'Forgot Password?' : step === 'otp' ? 'Verify OTP' : 'Reset Password'}
                        </Text>
                        <Text className="text-gray-500 mt-2 text-lg leading-6 font-medium">
                            {step === 'email' ? 'Enter your email to receive a recovery code.' :
                                step === 'otp' ? `Enter the 4-digit code sent to ${email}` :
                                    'Create a strong new password.'}
                        </Text>
                    </Animated.View>

                    <View className="flex-1 justify-between">
                        <Animated.View className="w-full">
                            {step === 'email' && (
                                <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
                                    <View className="bg-gray-50 rounded-2xl px-5 py-3 border border-gray-100 mb-6 focus:border-gray-400">
                                        <Text className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-widest">Email Address</Text>
                                        <View className="flex-row items-center">
                                            <Ionicons name="mail-outline" size={20} color="#9CA3AF" className="mr-3" />
                                            <TextInput
                                                className="flex-1 text-base text-gray-900 font-bold p-0"
                                                placeholder="name@example.com"
                                                placeholderTextColor="#9CA3AF"
                                                value={email}
                                                onChangeText={setEmail}
                                                autoCapitalize="none"
                                                keyboardType="email-address"
                                            />
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={{ backgroundColor: currentConfig.themeColor }}
                                        className="rounded-2xl py-4 items-center shadow-lg shadow-gray-200"
                                        onPress={handleSendOTP}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold uppercase tracking-wide">Send Code</Text>}
                                    </TouchableOpacity>
                                </Animated.View>
                            )}

                            {step === 'otp' && (
                                <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
                                    <View className="bg-gray-50 rounded-2xl px-5 py-3 border border-gray-100 mb-6 focus:border-gray-400">
                                        <Text className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-widest">4-Digit Code</Text>
                                        <View className="flex-row items-center">
                                            <Ionicons name="keypad-outline" size={20} color="#9CA3AF" className="mr-3" />
                                            <TextInput
                                                className="flex-1 text-base text-gray-900 font-bold p-0 tracking-[5px]"
                                                placeholder="0000"
                                                placeholderTextColor="#9CA3AF"
                                                value={otp}
                                                onChangeText={setOtp}
                                                keyboardType="number-pad"
                                                maxLength={4}
                                            />
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={{ backgroundColor: currentConfig.themeColor }}
                                        className="rounded-2xl py-4 items-center shadow-lg shadow-gray-200"
                                        onPress={handleVerifyOTP}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold uppercase tracking-wide">Verify</Text>}
                                    </TouchableOpacity>
                                </Animated.View>
                            )}

                            {step === 'reset' && (
                                <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
                                    <View className="bg-gray-50 rounded-2xl px-5 py-3 border border-gray-100 mb-4 focus:border-gray-400">
                                        <Text className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-widest">New Password</Text>
                                        <View className="flex-row items-center">
                                            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" className="mr-3" />
                                            <TextInput
                                                className="flex-1 text-base text-gray-900 font-bold p-0"
                                                placeholder="••••••••"
                                                placeholderTextColor="#9CA3AF"
                                                value={newPassword}
                                                onChangeText={setNewPassword}
                                                secureTextEntry
                                            />
                                        </View>
                                    </View>
                                    <View className="bg-gray-50 rounded-2xl px-5 py-3 border border-gray-100 mb-6 focus:border-gray-400">
                                        <Text className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-widest">Confirm Password</Text>
                                        <View className="flex-row items-center">
                                            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" className="mr-3" />
                                            <TextInput
                                                className="flex-1 text-base text-gray-900 font-bold p-0"
                                                placeholder="••••••••"
                                                placeholderTextColor="#9CA3AF"
                                                value={confirmPassword}
                                                onChangeText={setConfirmPassword}
                                                secureTextEntry
                                            />
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={{ backgroundColor: currentConfig.themeColor }}
                                        className="rounded-2xl py-4 items-center shadow-lg shadow-gray-200"
                                        onPress={handleResetPassword}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold uppercase tracking-wide">Reset Password</Text>}
                                    </TouchableOpacity>
                                </Animated.View>
                            )}
                        </Animated.View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
