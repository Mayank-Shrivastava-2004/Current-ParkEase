import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface PeakHourData {
    hour: string;
    bookings: number;
    percentage: number;
}

interface PeakHoursChartProps {
    data: PeakHourData[];
}

export default function PeakHoursChart({ data }: PeakHoursChartProps) {

    const highest = data.reduce(
        (max, item) => item.bookings > max ? item.bookings : max,
        0
    );

    return (
        <View className="bg-white rounded-3xl p-5 shadow-sm shadow-gray-200 border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
                <View>
                    <Text className="text-dark-900 font-bold text-lg">
                        Peak Hours
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                        Busiest times today
                    </Text>
                </View>
                <View className="bg-orange-50 px-3 py-1.5 rounded-xl">
                    <Text className="text-orange-600 font-bold text-xs">
                        Today
                    </Text>
                </View>
            </View>

            <View className="gap-3">
                {data.map((item, index) => {
                    const isHighest = item.bookings === highest;

                    return (
                        <Animated.View
                            key={index}
                            entering={FadeInRight.delay(index * 100).springify()}
                            className={`rounded-2xl p-4 ${
                                isHighest ? 'bg-indigo-50' : 'bg-gray-50'
                            }`}
                        >
                            <View className="flex-row justify-between items-center mb-3">
                                <View className="flex-row items-center">
                                    <View
                                        className={`w-10 h-10 rounded-xl justify-center items-center mr-3 ${
                                            isHighest ? 'bg-indigo-500' : 'bg-gray-300'
                                        }`}
                                    >
                                        <Ionicons name="time" size={20} color="white" />
                                    </View>
                                    <View>
                                        <Text className="text-dark-900 font-bold text-base">
                                            {item.hour}
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            {item.bookings} bookings
                                        </Text>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text
                                        className={`font-black text-xl ${
                                            isHighest
                                                ? 'text-indigo-600'
                                                : 'text-gray-600'
                                        }`}
                                    >
                                        {item.percentage}%
                                    </Text>

                                    {isHighest && (
                                        <View className="bg-indigo-500 px-2 py-0.5 rounded-full mt-1">
                                            <Text className="text-white text-[8px] font-bold uppercase">
                                                Peak
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <View className="h-2 bg-white rounded-full overflow-hidden">
                                <Animated.View
                                    entering={FadeInRight.delay((index + 1) * 150).springify()}
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${item.percentage}%`,
                                        backgroundColor: isHighest
                                            ? '#5B5FEF'
                                            : '#B2BEC3',
                                    }}
                                />
                            </View>
                        </Animated.View>
                    );
                })}
            </View>

            <View className="mt-4 pt-4 border-t border-gray-100 flex-row items-center">
                <View className="w-8 h-8 bg-yellow-100 rounded-full justify-center items-center mr-3">
                    <Ionicons name="bulb" size={16} color="#F59E0B" />
                </View>
                <Text className="flex-1 text-gray-600 text-xs">
                    <Text className="font-bold">Tip:</Text> Schedule maintenance during low-traffic hours for better efficiency
                </Text>
            </View>
        </View>
    );
}
