import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface DurationData {
    label: string;
    count: number;
    color: string;
}

interface Props {
    data: DurationData[];
    maxHeight?: number;
}

export default function ParkingDurationChart({ data, maxHeight = 180 }: Props) {
    const maxCount = Math.max(...data.map(d => d.count));

    return (
        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-gray-200 border border-gray-100">
            {/* Title */}
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-dark-900 font-bold text-xl">Parking Duration</Text>
                <View className="bg-gray-100 px-3 py-1.5 rounded-lg">
                    <Text className="text-gray-600 text-xs font-bold">Today</Text>
                </View>
            </View>

            {/* Bar Chart */}
            <View className="mb-6" style={{ height: maxHeight }}>
                <View className="flex-row items-end justify-between h-full">
                    {data.map((item, index) => {
                        const heightPercentage = (item.count / maxCount) * 100;

                        return (
                            <Animated.View
                                key={index}
                                entering={FadeInDown.delay(index * 100).springify()}
                                className="flex-1 items-center mx-0.5"
                            >
                                {/* Count label */}
                                <Text className="text-xs font-bold text-gray-600 mb-2">
                                    {item.count}
                                </Text>

                                {/* Bar */}
                                <View
                                    className="w-full rounded-t-lg"
                                    style={{
                                        height: `${Math.max(heightPercentage, 5)}%`,
                                        backgroundColor: item.color
                                    }}
                                />

                                {/* Label */}
                                <Text
                                    className="text-[9px] font-bold text-gray-500 mt-2 text-center"
                                    style={{ transform: [{ rotate: '-45deg' }], width: 60 }}
                                    numberOfLines={2}
                                >
                                    {item.label}
                                </Text>
                            </Animated.View>
                        );
                    })}
                </View>
            </View>

            {/* Legend */}
            <View className="border-t border-gray-100 pt-4">
                <View className="flex-row flex-wrap gap-3">
                    {data.map((item, index) => (
                        <View key={index} className="flex-row items-center">
                            <View
                                className="w-3 h-3 rounded mr-2"
                                style={{ backgroundColor: item.color }}
                            />
                            <Text className="text-gray-600 text-xs">{item.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Summary Stats */}
            <View className="border-t border-gray-100 pt-4 mt-4">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">
                            Median Duration
                        </Text>
                        <Text className="text-dark-900 text-2xl font-black">1h 15m</Text>
                    </View>
                    <View>
                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">
                            Total Vehicles
                        </Text>
                        <Text className="text-dark-900 text-2xl font-black">
                            {data.reduce((sum, item) => sum + item.count, 0)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
