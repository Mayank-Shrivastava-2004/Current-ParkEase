import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface BookingData {
    day: string;
    bookings: number;
}

interface BookingHistoryChartProps {
    data: BookingData[];
    maxHeight?: number;
}

export default function BookingHistoryChart({ data, maxHeight = 160 }: BookingHistoryChartProps) {
    const maxBookings = Math.max(...data.map(d => d.bookings));

    return (
        <View className="bg-white rounded-[30px] p-6 shadow-sm shadow-gray-200 border border-gray-100">
            <View className="flex-row justify-between items-center mb-8">
                <View>
                    <Text className="text-dark-900 font-black text-xl tracking-tight">Weekly Activity</Text>
                    <View className="flex-row items-center mt-1">
                        <Ionicons name="trending-up" size={14} color="#00B894" />
                        <Text className="text-teal-600 font-bold text-xs ml-1">+12% this week</Text>
                    </View>
                </View>
                <View className="bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                    <Text className="text-gray-500 font-bold text-xs">Last 7 Days</Text>
                </View>
            </View>

            <View className="flex-row items-end justify-between px-2" style={{ height: maxHeight }}>
                {data.map((item, index) => {
                    const heightPercentage = maxBookings > 0 ? (item.bookings / maxBookings) * 100 : 0;
                    const isToday = index === data.length - 1;

                    return (
                        <Animated.View
                            key={index}
                            entering={FadeInDown.delay(index * 100).springify()}
                            className="items-center justify-end h-full"
                            style={{ width: 30 }}
                        >
                            {/* Floating Tooltip for Today */}
                            {isToday && (
                                <Animated.View
                                    entering={FadeInDown.delay(1000)}
                                    className="absolute -top-10 bg-dark-900 px-2 py-1 rounded-lg mb-2"
                                >
                                    <Text className="text-white text-[10px] font-bold">{item.bookings}</Text>
                                    <View className="absolute -bottom-1 left-[10px] w-2 h-2 bg-dark-900 rotate-45" />
                                </Animated.View>
                            )}

                            {/* Bar Container */}
                            <View className="w-full relative items-center justify-end rounded-full overflow-hidden bg-gray-50 h-full">
                                <LinearGradient
                                    colors={isToday ? ['#00B894', '#55efc4'] : ['#B2BEC3', '#dfe6e9']}
                                    start={{ x: 0, y: 1 }}
                                    end={{ x: 0, y: 0 }}
                                    style={{
                                        width: '100%',
                                        height: `${heightPercentage}%`,
                                        borderRadius: 99,
                                        opacity: isToday ? 1 : 0.5
                                    }}
                                />
                            </View>

                            {/* Label */}
                            <Text className={`text-[10px] font-bold mt-3 ${isToday ? 'text-teal-600' : 'text-gray-400'}`}>
                                {item.day}
                            </Text>
                        </Animated.View>
                    );
                })}
            </View>
        </View>
    );
}
