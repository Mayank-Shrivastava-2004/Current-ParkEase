import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    Image,
    Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../constants/api';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import BarChart from '../../components/BarChart';
import StatsCard from '../../components/StatsCard';
import PieChart from '../../components/PieChart';
import LineChart from '../../components/LineChart';
import DonutChart from '../../components/DonutChart';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

const API = BASE_URL;

export default function DriverDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Driver');
    const [isDark, setIsDark] = useState(false);
    const [stats, setStats] = useState<any>({
        totalTrips: 0,
        balance: 0, // Used as 'Total Spent' or similar metric
        ecoPoints: 0,
        recentActivity: [],
        spendingTrend: [],
        parkingType: []
    });
    const [spendingRange, setSpendingRange] = useState<'WEEK' | 'MONTH' | 'YEAR'>('MONTH');

    const driverGradient: readonly [string, string, ...string[]] = ['#3B82F6', '#1D4ED8'];

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', route: '/(driver)/dashboard' },
        { icon: 'search', label: 'Find Parking', route: '/(driver)/find' },
        { icon: 'time', label: 'My Bookings', route: '/(driver)/bookings' },
        { icon: 'card', label: 'Payments', route: '/(driver)/payments' },
        { icon: 'flash', label: 'EV Charging', route: '/(driver)/ev' },
        { icon: 'settings', label: 'Settings', route: '/(driver)/settings' },
        { icon: 'person-circle', label: 'Account Profile', route: '/(driver)/profile' },
        { icon: 'headset', label: 'Support', route: '/(driver)/support' },
    ];

    useEffect(() => {
        loadDashboardData();
    }, [spendingRange]);

    const [unreadCount, setUnreadCount] = useState(0);

    const loadDashboardData = async () => {
        try {
            // Load Theme
            const settingsStr = await AsyncStorage.getItem('admin_settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                setIsDark(settings.darkMode ?? false);
            }

            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/driver/dashboard?range=${spendingRange}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setStats(data);
                setUserName(data.userName || 'Driver');
                await AsyncStorage.setItem('userName', data.userName || 'Driver');
            }

            // Fetch Notification Count
            const notifRes = await fetch(`${API}/api/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (notifRes.ok) {
                const count = await notifRes.json();
                setUnreadCount(count);
            }

        } catch (err) {
            console.error('Driver dashboard load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-blue-600 font-bold uppercase tracking-widest text-xs">Calibrating Navigation...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Smart Deck"
                subtitle="Autonomous Mobility"
                role="driver"
                gradientColors={driverGradient}
                onMenuPress={() => setSidebarOpen(true)}
                userName={userName}
                notificationCount={unreadCount}
            />

            <UnifiedSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userName={userName}
                userRole="Pro Driver"
                userStatus="Journey Ready"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={driverGradient}
                dark={isDark}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* LIVE MAP MINI-PREVIEW (MOCK) */}
                <View className="px-5 -mt-8">
                    <Animated.View entering={FadeInUp} className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-blue-50 shadow-blue-900/10'} rounded-[40px] overflow-hidden shadow-2xl border`}>
                        <View className="h-48 bg-gray-200 relative">
                            {/* Mock Map Background */}
                            <View className={`absolute inset-0 ${isDark ? 'bg-slate-800' : 'bg-blue-50'}`}>
                                <View className="w-full h-full opacity-10" style={{ transform: [{ rotate: '45deg' }] }}>
                                    {[...Array(20)].map((_, i) => (
                                        <View key={i} className={`h-[2px] w-full ${isDark ? 'bg-indigo-400' : 'bg-blue-600'} mb-8`} />
                                    ))}
                                    {[...Array(20)].map((_, i) => (
                                        <View key={i} className={`w-[2px] h-full ${isDark ? 'bg-indigo-400' : 'bg-blue-600'} absolute left-8`} style={{ left: i * 32 }} />
                                    ))}
                                </View>
                            </View>
                            {/* Map Pins */}
                            <View className="absolute top-1/2 left-1/3">
                                <Ionicons name="location" size={32} color={isDark ? '#818CF8' : '#3B82F6'} />
                                <View className={`${isDark ? 'bg-slate-900' : 'bg-white'} px-2 py-1 rounded-full shadow-sm mt-1`}>
                                    <Text className={`${isDark ? 'text-white' : 'text-gray-900'} text-[8px] font-black uppercase`}>Current Location</Text>
                                </View>
                            </View>
                            <View className="absolute top-1/4 right-1/4">
                                <Ionicons name="car" size={28} color="#10B981" />
                                <View className="bg-emerald-500 px-2 py-1 rounded-full shadow-sm mt-1 border border-emerald-400">
                                    <Text className="text-[8px] font-black text-white uppercase">Active Spot A-12</Text>
                                </View>
                            </View>

                            <TouchableOpacity className={`${isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-white'} absolute bottom-4 right-4 w-12 h-12 rounded-full items-center justify-center shadow-lg border`}>
                                <Ionicons name="expand-outline" size={20} color={isDark ? '#818CF8' : '#3B82F6'} />
                            </TouchableOpacity>
                        </View>

                        <View className="p-6">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Ongoing Parking</Text>
                                    <Text className={`${isDark ? 'text-white' : 'text-gray-900'} text-2xl font-black mt-1`}>Grand Plaza Lot</Text>
                                    <Text className="text-gray-500 text-xs mt-1">Section B • Level 2 • Spot #104</Text>
                                </View>
                                <View className="bg-blue-600 px-5 py-3 rounded-[24px] items-center">
                                    <Text className="text-white text-lg font-black tracking-widest">02:45</Text>
                                    <Text className="text-white/60 text-[8px] font-bold uppercase">Elapsed</Text>
                                </View>
                            </View>
                            <TouchableOpacity className="mt-6 bg-blue-600 py-4 rounded-[24px] items-center shadow-lg shadow-blue-600/30 flex-row justify-center">
                                <Ionicons name="navigate" size={18} color="white" />
                                <Text className="text-white font-black uppercase tracking-widest text-xs ml-2">Navigation Mode</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>

                {/* STATS STRIP */}
                <View className="px-5 mt-8">
                    <Text className={`font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'} mb-4 px-2`}>Performance Metrics</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-4 pl-1 pb-4">
                        <StatsCard
                            icon="map"
                            iconColor="#3B82F6"
                            iconBgColor={isDark ? 'bg-blue-500/10' : 'bg-blue-50'}
                            label="Total Trips"
                            value={stats.totalTrips?.toString() || "0"}
                            dark={isDark}
                        />
                        <View className="w-4" />
                        <StatsCard
                            icon="wallet"
                            iconColor="#F59E0B"
                            iconBgColor={isDark ? 'bg-amber-500/10' : 'bg-amber-50'}
                            label="Total Spent"
                            value={`₹${stats.totalSpent?.toLocaleString() || "0"}`}
                            dark={isDark}
                        />
                        <View className="w-4" />
                        <StatsCard
                            icon="card"
                            iconColor="#10B981"
                            iconBgColor={isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}
                            label="Balance"
                            value={`₹${stats.balance?.toLocaleString() || "0"}`}
                            dark={isDark}
                        />
                        <View className="w-4" />
                        <View className="w-4" />
                        <StatsCard
                            icon="leaf"
                            iconColor="#10B981"
                            iconBgColor={isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}
                            label="Eco Points"
                            value={stats.ecoPoints?.toLocaleString() || "0"}
                            dark={isDark}
                        />
                        <View className="w-6" />
                    </ScrollView>
                </View>



                {/* WALLET FLOW TREND */}
                <View className="px-5 mt-10">
                    <View className="flex-row items-center justify-between mb-4 px-2">
                        <Text className={`font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Wallet Flow</Text>
                        <View className={`flex-row bg-slate-200 dark:bg-slate-800 p-1.5 rounded-2xl`}>
                            {['WEEK', 'MONTH', 'YEAR'].map((r) => (
                                <Pressable
                                    key={r}
                                    onPress={(e) => {
                                        setSpendingRange(r as any);
                                    }}
                                    className={`px-4 py-2 rounded-xl ${spendingRange === r ? (isDark ? 'bg-slate-700' : 'bg-white shadow-sm') : 'bg-transparent'}`}
                                >
                                    <Text className={`text-[10px] font-black uppercase tracking-widest ${spendingRange === r ? 'text-blue-600' : 'text-gray-500'}`}>
                                        {r}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <LineChart
                        data={stats.spendingTrend?.length > 0 ? stats.spendingTrend : [
                            { label: 'Jan', value: 0 },
                            { label: 'Feb', value: 0 },
                        ]}
                        lineColor="#3B82F6"
                        fillColor="#3B82F6"
                        title={spendingRange === 'WEEK' ? 'Daily Balance' : spendingRange === 'YEAR' ? 'Annual Balance' : 'Monthly Balance History'}
                        dark={isDark}
                    />
                </View>



                {/* CHARGING TYPE DISTRIBUTION */}
                <View className="px-5 mt-10">
                    <View className="flex-row items-center justify-between mb-6 px-2">
                        <Text className={`font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Eco Infrastructure</Text>
                        <TouchableOpacity onPress={() => router.push('/(driver)/charging-points')}>
                            <Text className="text-emerald-500 font-bold text-xs uppercase tracking-widest">View Map</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push('/(driver)/charging-points')}
                        activeOpacity={0.9}
                        className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-blue-50/50 shadow-xl shadow-blue-500/5'} rounded-[40px] border p-2 relative overflow-hidden`}
                    >
                        <DonutChart
                            title=""
                            centerLabel="Units"
                            dark={isDark}
                            data={stats.chargingType?.length > 0 ? stats.chargingType : [
                                { label: 'Slow (L1)', value: 40, color: '#10B981' },
                                { label: 'Medium (L2)', value: 30, color: '#3B82F6' },
                                { label: 'Rapid (L3)', value: 20, color: '#F59E0B' },
                                { label: 'Super (S)', value: 10, color: '#EF4444' },
                            ]}
                        />
                        <View className="absolute top-8 right-8">
                            <Ionicons name="flash" size={20} color="#10B981" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* QUICK ACTIONS GRID */}
                <View className="px-5 mt-12">
                    <View className="flex-row items-center justify-between mb-8 px-2">
                        <Text className={`font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Driver Toolkit</Text>
                        <TouchableOpacity>
                            <Text className="text-blue-600 font-bold text-xs uppercase tracking-widest">Edit</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row flex-wrap justify-between gap-y-6">
                        {[
                            { label: 'Map', icon: 'map', color: '#3B82F6', bg: '#EFF6FF', route: '/(driver)/find' },
                            { label: 'Pre-Book', icon: 'calendar', color: '#6366F1', bg: '#EEF2FF', route: '/(driver)/bookings' },
                            { label: 'EV Scan', icon: 'flash', color: '#10B981', bg: '#ECFDF5', route: '/(driver)/ev' },
                            { label: 'History', icon: 'time', color: '#F43F5E', bg: '#FFF1F2', route: '/(driver)/bookings' },
                            { label: 'Payments', icon: 'card', color: '#8B5CF6', bg: '#F5F3FF', route: '/(driver)/payments' },
                            { label: 'SOS Help', icon: 'medical', color: '#EF4444', bg: '#FEF2F2', route: '/(driver)/support' },
                        ].map((tool, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => router.push(tool.route as any)}
                                activeOpacity={0.7}
                                className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100 shadow-sm'} w-[47%] py-10 rounded-[48px] items-center justify-center border`}
                            >
                                <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : tool.bg }} className="w-16 h-16 rounded-[24px] items-center justify-center mb-4">
                                    <Ionicons name={tool.icon as any} size={28} color={tool.color} />
                                </View>
                                <Text className={`${isDark ? 'text-slate-300' : 'text-gray-900'} font-black text-[10px] uppercase tracking-widest`}>{tool.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="px-5 mt-12 pb-10">
                    <Text className={`font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'} mb-8 px-2`}>Recent Journeys</Text>
                    {stats.recentActivity && stats.recentActivity.length > 0 ? (
                        stats.recentActivity.map((activity: any, i: number) => (
                            <View key={i} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-[40px] p-8 mb-4 border shadow-sm flex-row items-center`}>
                                <View className={`w-16 h-16 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'} rounded-3xl items-center justify-center mr-6 border`}>
                                    <Ionicons name="location" size={28} color={isDark ? '#475569' : '#CBD5E1'} />
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-black ${isDark ? 'text-white' : 'text-gray-900'} text-xl tracking-tight`}>{activity.location || 'Unknown Location'}</Text>
                                    <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1.5">
                                        {activity.date} • ₹{activity.amount || 0}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color={isDark ? '#334155' : '#E2E8F0'} />
                            </View>
                        ))
                    ) : (
                        <View className={`${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-gray-50 border-gray-100'} items-center py-20 rounded-[48px] border-2 border-dashed`}>
                            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                                <Ionicons name="map-outline" size={32} color="#CBD5E1" />
                            </View>
                            <Text className="text-gray-400 font-black uppercase tracking-[4px] text-[10px]">No recent journeys</Text>
                        </View>
                    )}
                </View>

            </ScrollView>
        </View>
    );
}
