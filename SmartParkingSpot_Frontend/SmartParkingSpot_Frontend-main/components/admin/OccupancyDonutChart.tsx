import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

interface OccupancyData {
    available: number;
    occupied: number;
    total: number;
}

interface Props {
    data: OccupancyData;
    size?: number;
}

export default function OccupancyDonutChart({ data, size = 200 }: Props) {
    const { available, occupied, total } = data;
    const occupancyPercentage = (occupied / total) * 100;

    // Calculate circle parameters
    const strokeWidth = 30;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const occupiedLength = (occupied / total) * circumference;
    const availableLength = (available / total) * circumference;

    return (
        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-gray-200 border border-gray-100">
            {/* Title */}
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-dark-900 font-bold text-xl">Occupancy</Text>
                <View className="w-2 h-2 bg-green-500 rounded-full" />
            </View>

            {/* Donut Chart */}
            <View className="items-center mb-6">
                <Svg width={size} height={size}>
                    {/* Background circle */}
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

                    {/* Occupied arc (dark gray) */}
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

                    {/* Available arc (light gray) */}
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

                {/* Center percentage */}
                <View className="absolute" style={{ top: size / 2 - 30 }}>
                    <Text className="text-dark-900 text-4xl font-black text-center">
                        {occupancyPercentage.toFixed(0)}%
                    </Text>
                    <Text className="text-gray-400 text-xs text-center uppercase tracking-wide">
                        Occupied
                    </Text>
                </View>
            </View>

            {/* Stats */}
            <View className="gap-3">
                <Animated.View
                    entering={FadeInDown.delay(100).springify()}
                    className="flex-row justify-between items-center"
                >
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                        <Text className="text-gray-600 text-base">Available</Text>
                    </View>
                    <Text className="text-dark-900 text-xl font-bold">{available}</Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(200).springify()}
                    className="flex-row justify-between items-center"
                >
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 bg-slate-600 rounded-full mr-2" />
                        <Text className="text-gray-600 text-base">Occupied</Text>
                    </View>
                    <Text className="text-dark-900 text-xl font-bold">{occupied}</Text>
                </Animated.View>

                <View className="border-t border-gray-100 pt-3 mt-2">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-gray-400 text-sm font-bold uppercase tracking-wide">Total Slots</Text>
                        <Text className="text-dark-900 text-2xl font-black">{total}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
