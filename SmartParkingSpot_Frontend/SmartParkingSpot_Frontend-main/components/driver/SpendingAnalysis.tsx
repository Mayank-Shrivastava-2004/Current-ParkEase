import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface SpendingCategory {
    label: string;
    amount: number;
    color: string;
    icon: string;
}

interface SpendingAnalysisProps {
    data: SpendingCategory[];
}

export default function SpendingAnalysis({ data }: SpendingAnalysisProps) {
    const totalSpent = data.reduce((sum, item) => sum + item.amount, 0);

    return (
        <View className="bg-white rounded-3xl p-5 shadow-sm shadow-gray-200 border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
                <View>
                    <Text className="text-dark-900 font-bold text-lg">Spending Analysis</Text>
                    <Text className="text-gray-400 text-xs mt-1">This month</Text>
                </View>
                <View className="items-end">
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">Total</Text>
                    <Text className="text-teal-600 text-2xl font-black">₹{totalSpent}</Text>
                </View>
            </View>

            <View className="gap-3">
                {data.map((item, index) => {
                    const percentage = totalSpent > 0 ? (item.amount / totalSpent) * 100 : 0;
                    return (
                        <Animated.View
                            key={index}
                            entering={FadeInRight.delay(index * 100).springify()}
                            className="gap-2"
                        >
                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center flex-1">
                                    <View
                                        className="w-10 h-10 rounded-xl justify-center items-center mr-3"
                                        style={{ backgroundColor: `${item.color}20` }}
                                    >
                                        <Ionicons name={item.icon as any} size={20} color={item.color} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-dark-900 font-bold text-sm">{item.label}</Text>
                                        <Text className="text-gray-400 text-xs">{percentage.toFixed(0)}% of total</Text>
                                    </View>
                                </View>
                                <Text className="text-dark-900 font-bold text-base">₹{item.amount}</Text>
                            </View>
                            <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <Animated.View
                                    entering={FadeInRight.delay((index + 1) * 150).springify()}
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: item.color
                                    }}
                                />
                            </View>
                        </Animated.View>
                    );
                })}
            </View>

            <View className="mt-4 pt-4 border-t border-gray-100 flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <Ionicons name="trending-down" size={16} color="#00B894" />
                    <Text className="text-teal-600 text-xs font-bold ml-1">8% less than last month</Text>
                </View>
                <View className="bg-teal-50 px-3 py-1.5 rounded-lg">
                    <Text className="text-teal-600 font-bold text-[10px] uppercase">Good!</Text>
                </View>
            </View>
        </View>
    );
}
