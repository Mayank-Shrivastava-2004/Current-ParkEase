import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

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

}: UnifiedHeaderProps) {
    const router = useRouter();

    return (
        <LinearGradient colors={gradientColors} className="pt-14 pb-8 px-5 rounded-b-[32px] shadow-lg shadow-black/10">
            <View className="flex-row items-center justify-between">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={showBackButton ? (onBackPress || (() => router.back())) : onMenuPress}
                    className="w-12 h-12 bg-white/20 rounded-2xl justify-center items-center border border-white/30"
                >
                    <Ionicons
                        name={showBackButton ? "arrow-back" : "grid-outline"}
                        size={22}
                        color="white"
                    />
                </TouchableOpacity>

                <View className="flex-1 ml-4">
                    <Text className="text-white/60 text-[9px] font-black uppercase tracking-widest">{subtitle}</Text>
                    <Text className="text-white font-black tracking-tight text-2xl">{title}</Text>
                </View>

                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push(`/(${role})/notifications` as any)}
                        className="w-12 h-12 bg-white/10 rounded-2xl justify-center items-center relative border border-white/10"
                    >
                        <Ionicons name="notifications-outline" size={22} color="white" />
                        {notificationCount > 0 && (
                            <View className="absolute top-2 right-2 w-4 h-4 bg-rose-500 rounded-full items-center justify-center border-2 border-white/20">
                                <Text className="text-white text-[8px] font-black">
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push(`/(${role})/profile` as any)}
                        className="w-12 h-12 bg-white/30 rounded-2xl justify-center items-center border border-white/40 shadow-sm"
                    >
                        <Text className="text-white font-black text-lg">
                            {userName.charAt(0).toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
}
