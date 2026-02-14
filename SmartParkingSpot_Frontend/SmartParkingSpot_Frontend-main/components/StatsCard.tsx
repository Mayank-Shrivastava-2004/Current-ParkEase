import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatsCardProps {
    icon: string;
    iconColor: string;
    iconBgColor: string;
    label: string;
    value: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    dark?: boolean;
    onPress?: () => void;
}

export default function StatsCard({
    icon,
    iconColor,
    iconBgColor,
    label,
    value,
    trend,
    dark = false,
    onPress,
}: StatsCardProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            disabled={!onPress}
            className={`flex-1 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-2xl p-4 border shadow-sm`}
        >
            <View className={`w-12 h-12 ${iconBgColor} rounded-xl items-center justify-center mb-3`}>
                <Ionicons name={icon as any} size={24} color={iconColor} />
            </View>
            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{label}</Text>
            <View className="flex-row items-end mt-1">
                <Text className={`${dark ? 'text-white' : 'text-gray-900'} text-2xl font-black tracking-tight`}>{value}</Text>
            </View>
        </TouchableOpacity>
    );
}
