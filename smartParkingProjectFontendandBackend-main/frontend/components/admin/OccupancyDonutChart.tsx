import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

/* ===== BACKEND-DRIVEN SHAPE ===== */
interface OccupancyData {
    totalSlots: number;
    occupiedSlots: number;
    availableSlots: number;
    occupancyPercentage: number;
}

interface Props {
    data?: OccupancyData;   // 👈 optional
    size?: number;
}

export default function OccupancyDonutChart({ data, size = 200 }: Props) {

    /* ===== SAFETY GUARD (CRITICAL) ===== */
    if (!data) {
        return (
            <View className="bg-white rounded-3xl p-6 border border-gray-100">
                <Text className="text-gray-400 font-bold text-center">
                    Loading occupancy…
                </Text>
            </View>
        );
    }

    const {
        totalSlots,
        occupiedSlots,
        availableSlots,
        occupancyPercentage
    } = data;

    const safeTotal = totalSlots > 0 ? totalSlots : 1;

    /* ===== SVG CALCULATIONS ===== */
    const strokeWidth = 30;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const occupiedLength =
        (occupiedSlots / safeTotal) * circumference;

    const availableLength =
        (availableSlots / safeTotal) * circumference;

    return (
        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-gray-200 border border-gray-100">
            {/* Title */}
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-dark-900 font-bold text-xl">
                    Occupancy
                </Text>
                <View className="w-2 h-2 bg-green-500 rounded-full" />
            </View>

            {/* Donut Chart */}
            <View className="items-center mb-6">
                <Svg width={size} height={size}>
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#F0F0F0"
                        strokeWidth={strokeWidth}
                        fill="none"
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                    />

                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#636E72"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={`${occupiedLength} ${circumference}`}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                    />

                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#DFE6E9"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={`${availableLength} ${circumference}`}
                        strokeDashoffset={-occupiedLength}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                    />
                </Svg>

                <View className="absolute" style={{ top: size / 2 - 30 }}>
                    <Text className="text-dark-900 text-4xl font-black text-center">
                        {occupancyPercentage}%
                    </Text>
                    <Text className="text-gray-400 text-xs text-center uppercase tracking-wide">
                        Occupied
                    </Text>
                </View>
            </View>

            {/* Stats */}
            <View className="gap-3">
                <Animated.View entering={FadeInDown.delay(100).springify()} className="flex-row justify-between">
                    <Text className="text-gray-600">Available</Text>
                    <Text className="font-bold">{availableSlots}</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).springify()} className="flex-row justify-between">
                    <Text className="text-gray-600">Occupied</Text>
                    <Text className="font-bold">{occupiedSlots}</Text>
                </Animated.View>

                <View className="border-t border-gray-100 pt-3 mt-2 flex-row justify-between">
                    <Text className="text-gray-400 uppercase text-xs font-bold">
                        Total Slots
                    </Text>
                    <Text className="text-2xl font-black">{totalSlots}</Text>
                </View>
            </View>
        </View>
    );
}
