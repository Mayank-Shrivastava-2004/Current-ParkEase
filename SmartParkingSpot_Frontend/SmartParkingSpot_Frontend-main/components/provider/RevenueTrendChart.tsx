import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface RevenueData {
    day: string;
    amount: number;
}

interface RevenueTrendChartProps {
    data: RevenueData[];
    maxHeight?: number;
}

export default function RevenueTrendChart({ data, maxHeight = 160 }: RevenueTrendChartProps) {
    const maxRevenue = Math.max(...data.map(d => d.amount));
    const totalRevenue = data.reduce((sum, d) => sum + d.amount, 0);
    const avgRevenue = totalRevenue / data.length;

    return (
        <View className="bg-white rounded-3xl p-5 shadow-sm shadow-gray-200 border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
                <View>
                    <Text className="text-dark-900 font-bold text-lg">Revenue Trend</Text>
                    <Text className="text-gray-400 text-xs mt-1">Last 7 days</Text>
                </View>
                <View className="bg-indigo-50 px-3 py-1.5 rounded-xl">
                    <Text className="text-indigo-600 font-bold text-xs">Weekly</Text>
                </View>
            </View>

            <View className="flex-row items-end justify-between mb-4" style={{ height: maxHeight }}>
                {data.map((item, index) => {
                    const heightPercentage = maxRevenue > 0 ? (item.amount / maxRevenue) * 100 : 0;
                    return (
                        <Animated.View
                            key={index}
                            entering={FadeInDown.delay(index * 100).springify()}
                            className="flex-1 items-center"
                        >
                            {item.amount > 0 && (
                                <Text className="text-xs font-bold text-indigo-600 mb-2">₹{item.amount}</Text>
                            )}
                            <View
                                className="w-9 rounded-t-lg"
                                style={{
                                    height: `${heightPercentage}%`,
                                    backgroundColor: index === data.length - 1 ? '#5B5FEF' : '#7C81F0'
                                }}
                            />
                            <Text className="text-[10px] font-bold text-gray-400 mt-2 uppercase">{item.day}</Text>
                        </Animated.View>
                    );
                })}
            </View>

            <View className="border-t border-gray-100 pt-3 flex-row justify-between">
                <View>
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">Total</Text>
                    <Text className="text-dark-900 text-lg font-bold">₹{totalRevenue}</Text>
                </View>
                <View>
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">Avg/Day</Text>
                    <Text className="text-dark-900 text-lg font-bold">₹{avgRevenue.toFixed(0)}</Text>
                </View>
                <View>
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">Peak</Text>
                    <Text className="text-dark-900 text-lg font-bold">₹{maxRevenue}</Text>
                </View>
            </View>

            <View className="mt-4 pt-4 border-t border-gray-100 flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <Ionicons name="trending-up" size={16} color="#00B894" />
                    <Text className="text-teal-600 text-xs font-bold ml-1">+15% from last week</Text>
                </View>
                <View className="bg-green-50 px-3 py-1.5 rounded-lg">
                    <Text className="text-green-600 font-bold text-[10px] uppercase">Growing</Text>
                </View>
            </View>
        </View>
    );
}
