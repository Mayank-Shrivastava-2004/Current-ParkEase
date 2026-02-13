import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import BASE_URL from '../../constants/api';

interface StatItem {
    label: string;
    amount: string;
    trend: string;
}

interface RecentEarning {
    id: string;
    date: string;
    slots: number;
    amount: string;
}

export default function EarningsTracker() {

    const [stats, setStats] = useState<StatItem[]>([]);
    const [balance, setBalance] = useState('₹0');
    const [recent, setRecent] = useState<RecentEarning[]>([]);
    const [loading, setLoading] = useState(true);

    /* ================= LOAD EARNINGS ================= */
    useEffect(() => {
        loadEarnings();
    }, []);

    const loadEarnings = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(
                `${BASE_URL}/api/provider/earnings`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Failed to load earnings');
            }

            const data = await res.json();

            setStats([
                { label: 'Today', amount: data.summary.today.amount, trend: data.summary.today.trend },
                { label: 'Week', amount: data.summary.week.amount, trend: data.summary.week.trend },
                { label: 'Month', amount: data.summary.month.amount, trend: data.summary.month.trend },
            ]);

            setBalance(data.balance);
            setRecent(data.recent);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Unable to load earnings');
        } finally {
            setLoading(false);
        }
    };

    /* ================= UI ================= */
    return (
        <View className="flex-1 px-6 pt-24 pb-32">
            <View className="mb-8">
                <Text className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] mb-1">
                    Financial Insights
                </Text>
                <Text className="text-gray-900 text-3xl font-black">
                    Earnings
                </Text>
            </View>

            {/* Quick Stats */}
            <View className="flex-row gap-4 mb-8">
                {stats.map((stat, index) => (
                    <Animated.View
                        key={stat.label}
                        entering={FadeInUp.delay(index * 100)}
                        className="flex-1 bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm"
                    >
                        <Text className="text-gray-400 font-bold text-[10px] uppercase mb-2">
                            {stat.label}
                        </Text>
                        <Text className="text-xl font-black text-gray-900">
                            {stat.amount}
                        </Text>
                        <View className="flex-row items-center mt-1">
                            <Ionicons
                                name="trending-up"
                                size={12}
                                color="#10B981"
                            />
                            <Text className="text-green-500 font-bold text-[10px] ml-1">
                                {stat.trend}
                            </Text>
                        </View>
                    </Animated.View>
                ))}
            </View>

            {/* Balance Card */}
            <View className="bg-indigo-600 rounded-[40px] p-8 mb-8 shadow-xl shadow-indigo-200">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-indigo-100 font-bold text-[10px] uppercase tracking-[2px]">
                            Available Balance
                        </Text>
                        <Text className="text-white text-4xl font-black mt-1">
                            {balance}
                        </Text>
                    </View>
                    <View className="w-14 h-14 bg-white/20 rounded-2xl justify-center items-center">
                        <Ionicons
                            name="wallet-outline"
                            size={30}
                            color="white"
                        />
                    </View>
                </View>

                <TouchableOpacity className="bg-white py-4 rounded-2xl items-center">
                    <Text className="text-indigo-600 font-black uppercase tracking-wider text-sm">
                        Withdraw Earnings
                    </Text>
                </TouchableOpacity>
            </View>

            <Text className="text-gray-900 font-black text-xl mb-6">
                Recent Reports
            </Text>

            <View className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                {!loading && recent.length === 0 && (
                    <View className="py-10 items-center">
                        <Ionicons name="cash-outline" size={48} color="#E5E7EB" />
                        <Text className="text-gray-400 font-bold mt-3">
                            No earnings yet
                        </Text>
                    </View>
                )}

                {recent.map((item, index) => (
                    <View
                        key={item.id}
                        className={`flex-row justify-between items-center p-6 ${index !== recent.length - 1
                                ? 'border-b border-gray-50'
                                : ''
                            }`}
                    >
                        <View>
                            <Text className="text-gray-900 font-bold">
                                {item.date}
                            </Text>
                            <Text className="text-gray-400 text-xs font-medium">
                                {item.slots} slots booked
                            </Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-gray-900 font-black text-lg">
                                {item.amount}
                            </Text>
                            <TouchableOpacity className="flex-row items-center">
                                <Text className="text-indigo-600 font-bold text-[10px] uppercase mr-1">
                                    View Details
                                </Text>
                                <Ionicons
                                    name="chevron-forward"
                                    size={10}
                                    color="#6C5CE7"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}
