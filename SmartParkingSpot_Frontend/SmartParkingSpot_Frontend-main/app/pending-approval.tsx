import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function PendingApprovalScreen() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = async () => {
        try {
            const role = await AsyncStorage.getItem('role');
            const name = await AsyncStorage.getItem('userName');
            setUserRole(role || 'User');
            setUserName(name || 'User');
        } catch (err) {
            console.error('Failed to load user info', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    const roleColor = userRole === 'DRIVER' ? ['#10B981', '#059669'] : ['#8B5CF6', '#7C3AED'];
    const roleIcon = userRole === 'DRIVER' ? 'car' : 'business';

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" />

            {/* HEADER */}
            <LinearGradient
                colors={roleColor}
                className="pt-16 pb-12 px-6 rounded-b-[40px]"
            >
                <View className="items-center">
                    <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-4 border-4 border-white/30">
                        <Ionicons name={roleIcon as any} size={48} color="white" />
                    </View>
                    <Text className="text-white text-2xl font-black tracking-tight">
                        {userName}
                    </Text>
                    <View className="bg-white/20 px-4 py-1.5 rounded-full mt-2">
                        <Text className="text-white text-xs font-bold uppercase tracking-widest">
                            {userRole}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* CONTENT */}
            <View className="flex-1 px-6 pt-10">
                <Animated.View
                    entering={FadeInUp.delay(200)}
                    className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
                >
                    {/* Icon */}
                    <View className="items-center mb-6">
                        <View className="w-20 h-20 bg-amber-50 rounded-full items-center justify-center border-4 border-amber-100">
                            <Ionicons name="time" size={40} color="#F59E0B" />
                        </View>
                    </View>

                    {/* Title */}
                    <Text className="text-2xl font-black text-gray-900 text-center mb-3">
                        Awaiting Approval
                    </Text>

                    {/* Message */}
                    <Text className="text-gray-500 text-center text-sm leading-6 mb-8">
                        Your {userRole?.toLowerCase()} account has been successfully registered and is currently under review by our admin team.
                        {'\n\n'}
                        You will receive a notification once your account is approved. This typically takes 24-48 hours.
                    </Text>

                    {/* Status Timeline */}
                    <View className="bg-gray-50 rounded-2xl p-6 mb-6">
                        <View className="flex-row items-center mb-4">
                            <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center">
                                <Ionicons name="checkmark" size={18} color="white" />
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="text-gray-900 font-bold text-sm">Registration Complete</Text>
                                <Text className="text-gray-400 text-xs">Account created successfully</Text>
                            </View>
                        </View>

                        <View className="w-0.5 h-6 bg-gray-200 ml-4" />

                        <View className="flex-row items-center mb-4">
                            <View className="w-8 h-8 bg-amber-500 rounded-full items-center justify-center">
                                <Ionicons name="hourglass" size={16} color="white" />
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="text-gray-900 font-bold text-sm">Admin Review</Text>
                                <Text className="text-amber-600 text-xs font-bold">In Progress...</Text>
                            </View>
                        </View>

                        <View className="w-0.5 h-6 bg-gray-200 ml-4" />

                        <View className="flex-row items-center opacity-40">
                            <View className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center">
                                <Ionicons name="shield-checkmark" size={16} color="white" />
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="text-gray-900 font-bold text-sm">Account Activation</Text>
                                <Text className="text-gray-400 text-xs">Pending approval</Text>
                            </View>
                        </View>
                    </View>

                    {/* Info Box */}
                    <View className="bg-blue-50 rounded-2xl p-4 flex-row items-start border border-blue-100">
                        <Ionicons name="information-circle" size={20} color="#3B82F6" />
                        <Text className="flex-1 ml-3 text-blue-700 text-xs leading-5">
                            You can log out and check back later. We'll send you an email notification once your account is approved.
                        </Text>
                    </View>
                </Animated.View>

                {/* Logout Button */}
                <Animated.View entering={FadeInDown.delay(400)} className="mt-8">
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-gray-800 py-4 rounded-2xl items-center shadow-lg"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="log-out-outline" size={20} color="white" />
                            <Text className="text-white font-bold ml-2 uppercase tracking-widest text-xs">
                                Logout
                            </Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}
