import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BASE_URL from '../../constants/api';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';

const API = BASE_URL;

export default function AnalyticsScreen() {
    const router = useRouter();
    const [analytics, setAnalytics] = useState<any>({
        revenue: { total: 0, platformFees: 0, providerEarnings: 0, avgDailyRevenue: 0 },
        userGrowth: {
            drivers: { total: 0, newThisWeek: 0 },
            providers: { total: 0, newThisWeek: 0 },
        },
        bookingTrend: [],
        peakHours: [],
        demandZones: [],
        activeDriversLocation: [],
        providerAvailability: { free: 0, busy: 0, total: 0 }
    });
    const [adminProfile, setAdminProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [revenueTab, setRevenueTab] = useState<'WEEK' | 'MONTH' | 'YEAR'>('WEEK');
    const [isDark, setIsDark] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const adminGradient: readonly [string, string, ...string[]] = ['#4F46E5', '#312E81'];

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', route: '/(admin)/dashboard' },
        { icon: 'people', label: 'Manage Drivers', route: '/(admin)/drivers' },
        { icon: 'business', label: 'Manage Providers', route: '/(admin)/providers' },
        { icon: 'alert-circle', label: 'Disputes', route: '/(admin)/disputes' },
        { icon: 'notifications', label: 'Notifications', route: '/(admin)/notifications' },
        { icon: 'bar-chart', label: 'Analytics', route: '/(admin)/analytics' },
        { icon: 'person-circle', label: 'Account Profile', route: '/(admin)/profile' },
        { icon: 'settings', label: 'Settings', route: '/(admin)/settings' },
    ];

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

                const profRes = await fetch(`${API}/api/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (profRes.ok) {
                    setAdminProfile(await profRes.json());
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

            <UnifiedHeader
                title="Global Intelligence"
                subtitle="Mainframe Analysis"
                role="admin"
                gradientColors={adminGradient}
                onMenuPress={() => setSidebarVisible(true)}
                userName={adminProfile?.name || "Admin"}
                showBackButton={true}
            />

            <UnifiedSidebar
                isOpen={sidebarVisible}
                onClose={() => setSidebarVisible(false)}
                userName={adminProfile?.name || "Administrator"}
                userRole={adminProfile?.role || "System Analyst"}
                userStatus="Mainframe Core Online"
                menuItems={menuItems}
                onLogout={async () => {
                    await AsyncStorage.clear();
                    router.replace('/' as any);
                }}
                gradientColors={adminGradient}
                dark={isDark}
            />

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
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => router.push('/(admin)/drivers')}
                            className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} flex-1 rounded-[32px] p-6 shadow-2xl shadow-black/5 border`}
                        >
                            <View className={`w-14 h-14 ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'} rounded-2xl items-center justify-center mb-4 border`}>
                                <Ionicons name="car" size={24} color="#10B981" />
                            </View>
                            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Active Drivers</Text>
                            <Text className={`text-3xl font-black mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{analytics.userGrowth.drivers.total.toLocaleString()}</Text>
                            <View className={`mt-5 pt-5 border-t ${isDark ? 'border-slate-800' : 'border-gray-50'}`}>
                                <Text className="text-emerald-500 text-[8px] font-black uppercase">Weekly Growth +{analytics.userGrowth.drivers.newThisWeek}</Text>
                                <Text className="text-slate-500 text-[8px] font-black uppercase mt-1">Efficiency ACTIVE</Text>
                            </View>
                        </TouchableOpacity>

                        {/* PROVIDERS CARD */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => router.push('/(admin)/providers')}
                            className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} flex-1 rounded-[32px] p-6 shadow-2xl shadow-black/5 border`}
                        >
                            <View className={`w-14 h-14 ${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'} rounded-2xl items-center justify-center mb-4 border`}>
                                <Ionicons name="business" size={24} color="#6366F1" />
                            </View>
                            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Managed Units</Text>
                            <Text className={`text-3xl font-black mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{analytics.userGrowth.providers.total}</Text>
                            <View className={`mt-5 pt-5 border-t ${isDark ? 'border-slate-800' : 'border-gray-50'}`}>
                                <Text className="text-indigo-500 text-[8px] font-black uppercase">Expansion +{analytics.userGrowth.providers.newThisWeek}</Text>
                                <Text className="text-slate-500 text-[8px] font-black uppercase mt-1">Uptime OPTIMAL</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* FLEET INTELLIGENCE (Requirement 4) */}
                <View className="px-5 mt-10">
                    <Text className={`font-black text-xl mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Demand Zones & Fleet</Text>

                    <View className="flex-row gap-4 mb-4">
                        {/* Provider Availability */}
                        <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} flex-1 rounded-[32px] p-6 border`}>
                            <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-3">Unit Status</Text>
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Available</Text>
                                <Text className={`text-xs font-black text-emerald-500`}>{analytics.providerAvailability.free}</Text>
                            </View>
                            <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <View className="h-full bg-emerald-500" style={{ width: `${(analytics.providerAvailability.free / analytics.providerAvailability.total) * 100}%` }} />
                            </View>
                            <View className="flex-row items-center justify-between mt-4 mb-2">
                                <Text className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Occupied</Text>
                                <Text className={`text-xs font-black text-rose-500`}>{analytics.providerAvailability.busy}</Text>
                            </View>
                            <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <View className="h-full bg-rose-500" style={{ width: `${(analytics.providerAvailability.busy / analytics.providerAvailability.total) * 100}%` }} />
                            </View>
                        </View>

                        {/* Demand Intensity */}
                        <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} flex-1 rounded-[32px] p-6 border`}>
                            <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-4">Demand Surge</Text>
                            {analytics.demandZones.slice(0, 2).map((zone: any, i: number) => (
                                <View key={i} className="mb-3">
                                    <View className="flex-row justify-between mb-1">
                                        <Text className={`text-[10px] font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{zone.area}</Text>
                                        <Text className="text-indigo-500 text-[8px] font-black">{zone.intensity}%</Text>
                                    </View>
                                    <View className="h-1 bg-indigo-100 rounded-full">
                                        <View className="h-full bg-indigo-500" style={{ width: `${zone.intensity}%` }} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Active Drivers List (The "Map") */}
                    <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-[40px] p-8 border mb-6`}>
                        <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[4px] mb-6">Live Fleet Deployment</Text>
                        {analytics.activeDriversLocation.length === 0 ? (
                            <Text className="text-gray-400 text-center py-4 font-bold">No active units detected</Text>
                        ) : analytics.activeDriversLocation.map((driver: any, i: number) => (
                            <View key={i} className={`flex-row items-center justify-between py-4 ${i !== analytics.activeDriversLocation.length - 1 ? 'border-b ' + (isDark ? 'border-slate-800' : 'border-gray-50') : ''}`}>
                                <View className="flex-row items-center">
                                    <View className="w-2 h-2 rounded-full bg-emerald-500 mr-3 shadow-sm shadow-emerald-500" />
                                    <View>
                                        <Text className={`text-xs font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{driver.driverName}</Text>
                                        <Text className="text-[8px] text-gray-400 font-bold uppercase">{driver.area}</Text>
                                    </View>
                                </View>
                                <View className="bg-emerald-500/10 px-2 py-1 rounded-lg">
                                    <Text className="text-emerald-500 text-[8px] font-black">{driver.status}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* COMMAND STATION */}
                <View className="px-5 mt-4">
                    <Text className={`font-black text-xl mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Command Station</Text>
                    <View className="flex-row gap-4 mb-4">
                        <TouchableOpacity
                            onPress={() => Alert.alert("Broadcast", "Initiating global broadcast protocol...")}
                            className="bg-indigo-600 flex-1 py-6 rounded-[32px] items-center justify-center shadow-lg shadow-indigo-600/30"
                        >
                            <Ionicons name="megaphone" size={24} color="white" />
                            <Text className="text-white font-black text-[10px] mt-2 uppercase tracking-widest">Broadcast</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => Alert.alert("System Freeze", "Confirm platform lockdown?", [{ text: "Cancel" }, { text: "Lockdown", style: "destructive" }])}
                            className="bg-rose-500 flex-1 py-6 rounded-[32px] items-center justify-center shadow-lg shadow-rose-500/30"
                        >
                            <Ionicons name="snow" size={24} color="white" />
                            <Text className="text-white font-black text-[10px] mt-2 uppercase tracking-widest">System Freeze</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} w-full py-6 rounded-[32px] border items-center flex-row justify-center`}
                        onPress={() => router.push('/(admin)/settings')}
                    >
                        <Ionicons name="settings" size={20} color="#6366F1" />
                        <Text className="text-indigo-500 font-black text-[10px] ml-3 uppercase tracking-widest">Master Configuration</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
