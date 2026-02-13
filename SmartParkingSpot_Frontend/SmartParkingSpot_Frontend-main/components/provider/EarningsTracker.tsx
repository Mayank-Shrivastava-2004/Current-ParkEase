import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function EarningsTracker() {
    const stats = [
        { label: 'Today', amount: '₹1,240', trend: '+8%' },
        { label: 'Week', amount: '₹8,650', trend: '+12%' },
        { label: 'Month', amount: '₹34,200', trend: '+5%' },
    ];

    const RecentEarnings = [
        { id: '1', date: '02 Feb, 2026', slots: 14, amount: '₹1,240' },
        { id: '2', date: '01 Feb, 2026', slots: 18, amount: '₹1,560' },
        { id: '3', date: '31 Jan, 2026', slots: 12, amount: '₹1,100' },
        { id: '4', date: '30 Jan, 2026', slots: 15, amount: '₹1,320' },
    ];

    return (
        <View className="flex-1 px-6 pt-24 pb-32">
            <View className="mb-8">
                <Text className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] mb-1">Financial Insights</Text>
                <Text className="text-gray-900 text-3xl font-black">Earnings</Text>
            </View>

            {/* Quick Stats */}
            <View className="flex-row gap-4 mb-8">
                {stats.map((stat, index) => (
                    <Animated.View
                        key={index}
                        entering={FadeInUp.delay(index * 100)}
                        className="flex-1 bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm"
                    >
                        <Text className="text-gray-400 font-bold text-[10px] uppercase mb-2">{stat.label}</Text>
                        <Text className="text-xl font-black text-gray-900">{stat.amount}</Text>
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="trending-up" size={12} color="#10B981" />
                            <Text className="text-green-500 font-bold text-[10px] ml-1">{stat.trend}</Text>
                        </View>
                    </Animated.View>
                ))}
            </View>

            {/* Main Balance Card */}
            <View className="bg-indigo-600 rounded-[40px] p-8 mb-8 shadow-xl shadow-indigo-200">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-indigo-100 font-bold text-[10px] uppercase tracking-[2px]">Available Balance</Text>
                        <Text className="text-white text-4xl font-black mt-1">₹ 12,450.00</Text>
                    </View>
                    <View className="w-14 h-14 bg-white/20 rounded-2xl justify-center items-center backdrop-blur-md">
                        <Ionicons name="wallet-outline" size={30} color="white" />
                    </View>
                </View>
                <TouchableOpacity className="bg-white py-4 rounded-2xl items-center">
                    <Text className="text-indigo-600 font-black uppercase tracking-wider text-sm">Withdraw Earnings</Text>
                </TouchableOpacity>
            </View>

            <Text className="text-gray-900 font-black text-xl mb-6">Recent Reports</Text>
            <View className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                {RecentEarnings.map((item, index) => (
                    <View key={item.id} className={`flex-row justify-between items-center p-6 ${index !== RecentEarnings.length - 1 ? 'border-b border-gray-50' : ''}`}>
                        <View>
                            <Text className="text-gray-900 font-bold">{item.date}</Text>
                            <Text className="text-gray-400 text-xs font-medium">{item.slots} slots booked</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-gray-900 font-black text-lg">{item.amount}</Text>
                            <TouchableOpacity className="flex-row items-center">
                                <Text className="text-indigo-600 font-bold text-[10px] uppercase mr-1">View Details</Text>
                                <Ionicons name="chevron-forward" size={10} color="#6C5CE7" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}
