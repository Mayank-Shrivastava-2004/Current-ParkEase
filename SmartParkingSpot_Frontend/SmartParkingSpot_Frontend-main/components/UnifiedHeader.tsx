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

    const topPadding = Platform.OS === 'android' ? Math.max(insets.top, StatusBar.currentHeight || 0) + 5 : insets.top;

    return (
        <LinearGradient
            colors={gradientColors}
            className="rounded-b-[24px] shadow-sm shadow-indigo-950/20"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={{ paddingTop: topPadding }} className="pb-3 px-4">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={showBackButton ? (onBackPress || (() => router.back())) : onMenuPress}
                        className="w-9 h-9 bg-white/20 rounded-xl justify-center items-center border border-white/30"
                    >
                        <Ionicons
                            name={showBackButton ? "chevron-back" : "menu"}
                            size={18}
                            color="white"
                        />
                    </TouchableOpacity>

                    <View className="flex-1 ml-3">
                        <Text className="text-white/40 text-[7px] font-black uppercase tracking-[2px] mb-0">{subtitle}</Text>
                        <Text className="text-white font-black tracking-tight text-lg">{title}</Text>
                    </View>

                    {showStatusToggle && role === 'provider' && (
                        <View className="flex-row items-center mr-3 bg-black/10 px-2 py-1 rounded-xl border border-white/10">
                            <Text className={`text-[7px] font-black uppercase tracking-widest mr-1.5 ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isOnline ? 'Live' : 'Off'}
                            </Text>
                            <View className="scale-[0.6]">
                                <Switch
                                    value={isOnline}
                                    onValueChange={onStatusToggle}
                                    trackColor={{ false: '#71717a', true: '#10b981' }}
                                    thumbColor="#ffffff"
                                />
                            </View>
                        </View>
                    )}

                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => router.push(`/(${role})/notifications` as any)}
                            className="w-8 h-8 bg-white/10 rounded-xl justify-center items-center relative border border-white/10"
                        >
                            <Ionicons name="notifications-outline" size={16} color="white" />
                            {notificationCount > 0 && (
                                <View className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full items-center justify-center border border-white/20">
                                    <Text className="text-white text-[6px] font-black">
                                        {notificationCount > 9 ? '9+' : notificationCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => router.push(`/(${role})/profile` as any)}
                            className="w-8 h-8 bg-white/30 rounded-xl justify-center items-center border border-white/50"
                        >
                            <Text className="text-white font-black text-xs">
                                {userName.charAt(0).toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}
