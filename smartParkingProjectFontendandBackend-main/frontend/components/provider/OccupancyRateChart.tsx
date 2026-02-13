import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

interface OccupancyData {
    occupied: number;
    available: number;
    total: number;
}

interface OccupancyRateChartProps {
    data: OccupancyData;
    size?: number;
}

export default function OccupancyRateChart({ data, size = 160 }: OccupancyRateChartProps) {
    const { occupied, available, total } = data;

    const occupancyPercentage =
        total > 0 ? (occupied / total) * 100 : 0;

    const radius = size / 2 - 15;
    const circumference = 2 * Math.PI * radius;
    const occupiedStroke = (occupancyPercentage / 100) * circumference;

    return (
        <View className="bg-white rounded-3xl p-5 shadow-sm shadow-gray-200 border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
                <View>
                    <Text className="text-dark-900 font-bold text-lg">
                        Occupancy Rate
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                        Real-time status
                    </Text>
                </View>
                <View className="bg-indigo-50 px-3 py-1.5 rounded-xl">
                    <Text className="text-indigo-600 font-bold text-xs">
                        Live
                    </Text>
                </View>
            </View>

            <View className="items-center py-6">
                <View
                    style={{ width: size, height: size }}
                    className="items-center justify-center"
                >
                    <Svg width={size} height={size}>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#F0F0F0"
                            strokeWidth="20"
                            fill="none"
                        />
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#5B5FEF"
                            strokeWidth="20"
                            fill="none"
                            strokeDasharray={`${occupiedStroke} ${circumference}`}
                            strokeLinecap="round"
                            rotation="-90"
                            origin={`${size / 2}, ${size / 2}`}
                        />
                    </Svg>

                    <View className="absolute items-center">
                        <Text className="text-4xl font-black text-indigo-600">
                            {occupancyPercentage.toFixed(0)}%
                        </Text>
                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-wide mt-1">
                            Occupied
                        </Text>
                    </View>
                </View>
            </View>

            <View className="gap-3 mt-4">
                <Animated.View
                    entering={FadeInDown.delay(100).springify()}
                    className="flex-row justify-between items-center bg-indigo-50 p-4 rounded-2xl"
                >
                    <Text className="text-dark-900 font-bold">
                        Occupied
                    </Text>
                    <Text className="text-indigo-600 font-black text-lg">
                        {occupied}
                    </Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(200).springify()}
                    className="flex-row justify-between items-center bg-green-50 p-4 rounded-2xl"
                >
                    <Text className="text-dark-900 font-bold">
                        Available
                    </Text>
                    <Text className="text-green-600 font-black text-lg">
                        {available}
                    </Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(300).springify()}
                    className="flex-row justify-between items-center bg-gray-50 p-4 rounded-2xl"
                >
                    <Text className="text-dark-900 font-bold">
                        Total Slots
                    </Text>
                    <Text className="text-gray-600 font-black text-lg">
                        {total}
                    </Text>
                </Animated.View>
            </View>
        </View>
    );
}
