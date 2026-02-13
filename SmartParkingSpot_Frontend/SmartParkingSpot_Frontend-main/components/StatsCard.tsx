import React from 'react';
import { View, Text } from 'react-native';
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
}

export default function StatsCard({
    icon,
    iconColor,
    iconBgColor,
    label,
    value,
    trend,
    dark = false,
}: StatsCardProps) {
    return (
        <View className={`flex-1 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-2xl p-4 border shadow-sm`}>
            <View className={`w-12 h-12 ${iconBgColor} rounded-xl items-center justify-center mb-3`}>
                <Ionicons name={icon as any} size={24} color={iconColor} />
            </View>
            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{label}</Text>
            <View className="flex-row items-end mt-1">
                <Text className={`${dark ? 'text-white' : 'text-gray-900'} text-2xl font-black tracking-tight`}>{value}</Text>
                {trend && (
                    <View className={`ml-2 px-2 py-0.5 rounded-lg ${trend.isPositive ? (dark ? 'bg-emerald-500/10' : 'bg-emerald-50') : (dark ? 'bg-rose-500/10' : 'bg-rose-50')}`}>
                        <Text className={`text-[8px] font-black ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
