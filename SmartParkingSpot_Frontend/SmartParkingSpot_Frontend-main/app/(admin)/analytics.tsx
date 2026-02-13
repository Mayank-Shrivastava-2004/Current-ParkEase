import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BASE_URL from '../../constants/api';

const API = BASE_URL;

export default function AnalyticsScreen() {
    const router = useRouter();
    const [analytics, setAnalytics] = useState<any>({
        revenue: { total: 0, platformFees: 0, providerEarnings: 0, avgDailyRevenue: 0 },
        userGrowth: {
            drivers: { total: 0, newThisWeek: 0, activeRate: 0 },
            providers: { total: 0, newThisWeek: 0, activeRate: 0 },
        },
        bookingTrend: [],
        peakHours: [],
    });
    const [loading, setLoading] = useState(true);
    const [revenueTab, setRevenueTab] = useState<'WEEK' | 'MONTH' | 'YEAR'>('WEEK');
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                // Load Theme
                const settingsStr = await AsyncStorage.getItem('admin_settings');
                if (settingsStr) {
                    const settings = JSON.parse(settingsStr);
                    setIsDark(settings.darkMode ?? false);
                }

                const token = await AsyncStorage.getItem('token');
                const res = await fetch(`${API}/api/admin/analytics?range=${revenueTab}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    setAnalytics(data);
                }
            } catch (err) {
                console.error('Analytics fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, [revenueTab]);

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-indigo-500 font-bold mt-4 uppercase tracking-[4px] text-[8px]">Decrypting Data...</Text>
            </View>
        );
    }

    const maxBookings = Math.max(...(analytics.bookingTrend || []).map((b: any) => b.value), 1);
    const maxPeakBookings = Math.max(...(analytics.peakHours || []).map((p: any) => p.bookings), 1);

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            {/* HEADER */}
            <LinearGradient colors={['#4F46E5', '#312E81']} className="pt-14 pb-12 px-5 rounded-b-[40px] shadow-2xl">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/20 rounded-2xl justify-center items-center mr-4 border border-white/30"
                    >
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest">Global Intelligence</Text>
                        <Text className="text-white text-3xl font-black tracking-tight">Mainframe Analysis</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* REVENUE OVERVIEW */}
                <View className="px-5 mt-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className={`font-black text-xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Revenue Performance</Text>
                        <View className="flex-row gap-2 bg-indigo-500/10 p-1.5 rounded-2xl border border-indigo-500/20">
                            {['WEEK', 'MONTH', 'YEAR'].map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => {
                                        setLoading(true);
                                        setRevenueTab(tab as any);
                                    }}
                                    className={`px-4 py-2 rounded-xl ${revenueTab === tab ? 'bg-indigo-600 shadow-md shadow-indigo-600/20' : ''}`}
                                >
                                    <Text className={`text-[10px] font-black uppercase tracking-widest ${revenueTab === tab ? 'text-white' : 'text-slate-400'}`}>
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-[40px] p-8 shadow-2xl shadow-black/5 border`}>
                        <View className="flex-row items-center mb-8">
                            <Text className={`${isDark ? 'text-white' : 'text-gray-900'} text-5xl font-black tracking-tighter`}>?{(analytics.revenue.total / 100000).toFixed(1)}L</Text>
                            <View className="ml-4 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                                <Text className="text-emerald-500 text-xs font-black">? 12.4%</Text>
                            </View>
                        </View>

                        <View className="gap-5">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-3 shadow-sm shadow-indigo-500" />
                                    <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Platform Commissions</Text>
                                </View>
                                <Text className={`font-black text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>?{(analytics.revenue.platformFees / 100000).toFixed(1)}L</Text>
                            </View>

                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-2.5 h-2.5 rounded-full bg-slate-400 mr-3 shadow-sm shadow-slate-400" />
                                    <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Provider Payouts</Text>
                                </View>
                                <Text className={`font-black text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>?{(analytics.revenue.providerEarnings / 100000).toFixed(1)}L</Text>
                            </View>

                            <View className={`flex-row items-center justify-between pt-5 border-t ${isDark ? 'border-slate-800' : 'border-gray-50'}`}>
                                <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Daily Average Velocity</Text>
                                <Text className={`font-black ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>?{(analytics.revenue.avgDailyRevenue / 1000).toFixed(1)}K</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* BOOKING TREND */}
                <View className="px-5 mt-10">
                    <Text className={`font-black text-xl mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>System Utilization</Text>
                    <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-[40px] p-8 shadow-2xl shadow-black/5 border`}>
                        <View className="flex-row items-end justify-between h-48">
                            {(analytics.bookingTrend || []).map((item: any, index: number) => {
                                const height = (item.value / maxBookings) * 100;
                                return (
                                    <View key={index} className="flex-1 items-center justify-end">
                                        <Text className={`text-[10px] font-black ${isDark ? 'text-slate-500' : 'text-gray-400'} mb-2`}>{item.value}</Text>
                                        <View
                                            className={`w-8 ${isDark ? 'bg-indigo-500/80 shadow-lg shadow-indigo-500/20' : 'bg-slate-800'} rounded-t-2xl`}
                                            style={{ height: `${height}%` }}
                                        />
                                        <Text className="text-[9px] font-black text-gray-500 mt-2">{item.label}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>

                {/* USER GROWTH */}
                <View className="px-5 mt-10">
                    <Text className={`font-black text-xl mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Network Expansion</Text>
                    <View className="flex-row gap-4">
                        {/* DRIVERS CARD */}
                        <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} flex-1 rounded-[32px] p-6 shadow-2xl shadow-black/5 border`}>
                            <View className={`w-14 h-14 ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'} rounded-2xl items-center justify-center mb-4 border`}>
                                <Ionicons name="car" size={24} color="#10B981" />
                            </View>
                            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Active Drivers</Text>
                            <Text className={`text-3xl font-black mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{analytics.userGrowth.drivers.total.toLocaleString()}</Text>
                            <View className={`mt-5 pt-5 border-t ${isDark ? 'border-slate-800' : 'border-gray-50'}`}>
                                <Text className="text-emerald-500 text-[8px] font-black uppercase">Weekly Growth +{analytics.userGrowth.drivers.newThisWeek}</Text>
                                <Text className="text-slate-500 text-[8px] font-black uppercase mt-1">Efficiency ACTIVE</Text>
                            </View>
                        </View>

                        {/* PROVIDERS CARD */}
                        <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} flex-1 rounded-[32px] p-6 shadow-2xl shadow-black/5 border`}>
                            <View className={`w-14 h-14 ${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'} rounded-2xl items-center justify-center mb-4 border`}>
                                <Ionicons name="business" size={24} color="#6366F1" />
                            </View>
                            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Managed Units</Text>
                            <Text className={`text-3xl font-black mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{analytics.userGrowth.providers.total}</Text>
                            <View className={`mt-5 pt-5 border-t ${isDark ? 'border-slate-800' : 'border-gray-50'}`}>
                                <Text className="text-indigo-500 text-[8px] font-black uppercase">Expansion +{analytics.userGrowth.providers.newThisWeek}</Text>
                                <Text className="text-slate-500 text-[8px] font-black uppercase mt-1">Uptime OPTIMAL</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* PEAK HOURS ANALYSIS */}
                <View className="px-5 mt-10">
                    <Text className={`font-black text-xl mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Operational Hotspots</Text>
                    <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-[40px] p-8 shadow-2xl shadow-black/5 border`}>
                        {(analytics.peakHours || []).map((hour: any, index: number) => {
                            const width = (hour.bookings / maxPeakBookings) * 100;
                            return (
                                <View key={index} className="mb-6">
                                    <View className="flex-row items-center justify-between mb-2.5">
                                        <Text className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{hour.timeSlot}</Text>
                                        <Text className={`text-xs font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{hour.bookings} EVENTS</Text>
                                    </View>
                                    <View className={`h-2.5 ${isDark ? 'bg-slate-800' : 'bg-indigo-50'} rounded-full overflow-hidden`}>
                                        <View
                                            className={`h-full ${isDark ? 'bg-indigo-500' : 'bg-slate-800'} rounded-full`}
                                            style={{ width: `${width}%` }}
                                        />
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
