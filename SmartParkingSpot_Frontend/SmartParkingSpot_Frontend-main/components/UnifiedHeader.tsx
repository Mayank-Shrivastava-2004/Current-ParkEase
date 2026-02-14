import React from 'react';
import { View, Text, TouchableOpacity, Platform, StatusBar, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface UnifiedHeaderProps {
    title: string;
    subtitle: string;
    role: 'admin' | 'driver' | 'provider';
    gradientColors: readonly [string, string, ...string[]];
    onMenuPress: () => void;
    userName: string;
    notificationCount?: number;
    showBackButton?: boolean;
    onBackPress?: () => void;
    compact?: boolean;
    // New Props for Provider Status
    showStatusToggle?: boolean;
    isOnline?: boolean;
    onStatusToggle?: (val: boolean) => void;
}

export default function UnifiedHeader({
    title,
    subtitle,
    role,
    gradientColors,
    onMenuPress,
    userName,
    notificationCount = 0,
    showBackButton = false,
    onBackPress,
    compact = false,
    showStatusToggle = false,
    isOnline = true,
    onStatusToggle
}: UnifiedHeaderProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const topPadding = Platform.OS === 'android' ? Math.max(insets.top, StatusBar.currentHeight || 0) + 10 : insets.top + 5;

    return (
        <LinearGradient
            colors={gradientColors}
            className="rounded-b-[40px] shadow-xl shadow-indigo-950/30"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={{ paddingTop: topPadding }} className="pb-6 px-6">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={showBackButton ? (onBackPress || (() => router.back())) : onMenuPress}
                        className="w-12 h-12 bg-white/20 rounded-2xl justify-center items-center border border-white/30"
                    >
                        <Ionicons
                            name={showBackButton ? "chevron-back" : "menu"}
                            size={24}
                            color="white"
                        />
                    </TouchableOpacity>

                    <View className="flex-1 ml-4">
                        <Text className="text-white/40 text-[8px] font-black uppercase tracking-[3px] mb-0.5">{subtitle}</Text>
                        <Text className="text-white font-black tracking-tighter text-xl">{title}</Text>
                    </View>

                    {showStatusToggle && role === 'provider' && (
                        <View className="flex-row items-center mr-4 bg-black/10 px-3 py-1.5 rounded-2xl border border-white/10">
                            <Text className={`text-[8px] font-black uppercase tracking-widest mr-2 ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isOnline ? 'Live' : 'Offline'}
                            </Text>
                            <View className="scale-75">
                                <Switch
                                    value={isOnline}
                                    onValueChange={onStatusToggle}
                                    trackColor={{ false: '#71717a', true: '#10b981' }}
                                    thumbColor="#ffffff"
                                />
                            </View>
                        </View>
                    )}

                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => router.push(`/(${role})/notifications` as any)}
                            className="w-10 h-10 bg-white/10 rounded-2xl justify-center items-center relative border border-white/10"
                        >
                            <Ionicons name="notifications-outline" size={20} color="white" />
                            {notificationCount > 0 && (
                                <View className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full items-center justify-center border border-white/20">
                                    <Text className="text-white text-[7px] font-black">
                                        {notificationCount > 9 ? '9+' : notificationCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => router.push(`/(${role})/profile` as any)}
                            className="w-10 h-10 bg-white/30 rounded-2xl justify-center items-center border border-white/50"
                        >
                            <Text className="text-white font-black text-base">
                                {userName.charAt(0).toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}
