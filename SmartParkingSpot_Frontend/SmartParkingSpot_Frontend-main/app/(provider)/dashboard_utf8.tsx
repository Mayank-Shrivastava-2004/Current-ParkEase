import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import StatsCard from '../../components/StatsCard';
import LineChart from '../../components/LineChart';
import DonutChart from '../../components/DonutChart';

const API = 'http://10.67.158.172:8080';

export default function ProviderDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [isDark, setIsDark] = useState(false);
    const [summary, setSummary] = useState({
        totalSlots: 0,
        activeCars: 0,
        totalRevenue: 0,
        occupancyRate: 0,
        rating: 4.8,
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
    const [userName, setUserName] = useState('Provider');
    const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('week');

    const providerGradient: readonly [string, string, ...string[]] = ['#8B5CF6', '#6D28D9'];

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', route: '/(provider)/dashboard' },
        { icon: 'business', label: 'My Spaces', route: '/(provider)/spaces' },
        { icon: 'bar-chart', label: 'Earnings', route: '/(provider)/earnings' },
        { icon: 'car', label: 'Live Traffic', route: '/(provider)/traffic' },
        { icon: 'time', label: 'History', route: '/(provider)/history' },
        { icon: 'flash', label: 'EV Station', route: '/(provider)/ev-station' },
        { icon: 'person-circle', label: 'Account Profile', route: '/(provider)/profile' },
        { icon: 'settings', label: 'Settings', route: '/(provider)/settings' },
        { icon: 'headset', label: 'Support', route: '/(provider)/support' },
    ];

    useEffect(() => {
        loadDashboardData();
    }, [timeFilter]);

    const loadDashboardData = async () => {
        try {
            // Load Theme
            const settingsStr = await AsyncStorage.getItem('admin_settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                setIsDark(settings.darkMode ?? false);
            }

            const token = await AsyncStorage.getItem('token');
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);

            const res = await fetch(`${API}/api/provider/dashboard?timeframe=${timeFilter}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setSummary(data.summary);
                setRecentActivity(data.recentActivity);
                setRevenueTrend(data.revenueTrend);
            }
        } catch (err) {
            console.error('Provider dashboard load failed:', err);
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
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="mt-4 text-purple-500 font-bold uppercase tracking-widest text-xs">Syncing Panel...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Provider Hub"
                subtitle="Parking Management"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => setSidebarOpen(true)}
                userName={userName}
                notificationCount={1}
            />

            <UnifiedSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userName={userName}
                userRole="Parking Provider"
                userStatus={isOnline ? "Online" : "Offline"}
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={providerGradient}
                dark={isDark}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* TIME FILTER - Month/Week Toggle */}
                <View className="px-5 -mt-8 mb-4">
                    <View className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100 shadow-xl shadow-black/5'} rounded-3xl p-2 flex-row border`}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setTimeFilter('week')}
                            className={`flex-1 py-3 rounded-2xl ${timeFilter === 'week' ? (isDark ? 'bg-purple-500' : 'bg-purple-600') : 'bg-transparent'}`}
                        >
                            <Text className={`text-center font-black text-xs uppercase tracking-widest ${timeFilter === 'week' ? 'text-white' : (isDark ? 'text-slate-400' : 'text-gray-500')}`}>
                                Week
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setTimeFilter('month')}
                            className={`flex-1 py-3 rounded-2xl ${timeFilter === 'month' ? (isDark ? 'bg-purple-500' : 'bg-purple-600') : 'bg-transparent'}`}
                        >
                            <Text className={`text-center font-black text-xs uppercase tracking-widest ${timeFilter === 'month' ? 'text-white' : (isDark ? 'text-slate-400' : 'text-gray-500')}`}>
                                Month
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ONLINE TOGGLE */}
                <View className="px-5 -mt-2">
                    <View className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100 shadow-xl shadow-black/5'} rounded-3xl p-5 flex-row items-center justify-between border`}>
                        <View className="flex-row items-center">
                            <View className={`w-3 h-3 rounded-full mr-3 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <View>
                                <Text className={`font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{isOnline ? 'Station Active' : 'Station Inactive'}</Text>
                                <Text className="text-gray-500 text-[10px] font-bold uppercase">Visibility: {isOnline ? 'Public' : 'Hidden'}</Text>
                            </View>
                        </View>
                        <Switch
                            value={isOnline}
                            onValueChange={setIsOnline}
                            trackColor={{ false: isDark ? '#1E293B' : '#E2E8F0', true: isDark ? '#4C1D95' : '#D8B4FE' }}
                            thumbColor={isOnline ? '#8B5CF6' : '#94A3B8'}
                        />
                    </View>
                </View>

                {/* STATS GRID */}
                <View className="px-5 mt-6">
                    <View className="flex-row gap-4 mb-4">
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => router.push('/(provider)/earnings')}
                            className="flex-1"
                        >
                            <StatsCard
                                icon="wallet"
                                iconColor="#8B5CF6"
                                iconBgColor={isDark ? 'bg-purple-500/10' : 'bg-purple-50'}
                                label="Daily Earnings"
                                value={`?${summary.totalRevenue.toLocaleString()}`}
                                trend={{ value: 8, isPositive: true }}
                                dark={isDark}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => router.push('/(provider)/traffic')}
                            className="flex-1"
                        >
                            <StatsCard
                                icon="car-sport"
                                iconColor="#3B82F6"
                                iconBgColor={isDark ? 'bg-blue-500/10' : 'bg-blue-50'}
                                label="Active Cars"
                                value={`${summary.activeCars}/${summary.totalSlots}`}
                                dark={isDark}
                            />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row gap-4">
                        <StatsCard
                            icon="star"
                            iconColor="#F59E0B"
                            iconBgColor={isDark ? 'bg-amber-500/10' : 'bg-amber-50'}
                            label="Avg Rating"
                            value={`${summary.rating}/5.0`}
                            dark={isDark}
                        />
                        <StatsCard
                            icon="flash"
                            iconColor="#10B981"
                            iconBgColor={isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}
                            label="Solar Yield"
                            value={`${summary.occupancyRate}%`}
                            dark={isDark}
                        />
                    </View>
                </View>

                {/* QUICK ACTIONS */}
                <View className="px-5 mt-8">
                    <Text className={`font-black text-lg mb-4 tracking-tight px-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Commands</Text>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => router.push('/(provider)/spaces')}
                            className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100 shadow-sm'} flex-1 rounded-3xl p-5 items-center border`}
                        >
                            <View className={`w-12 h-12 ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'} rounded-2xl items-center justify-center mb-3`}>
                                <Ionicons name="add-circle" size={26} color="#8B5CF6" />
                            </View>
                            <Text className={`font-black text-[10px] uppercase tracking-widest text-center ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>Add Slot</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/(provider)/traffic')}
                            className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100 shadow-sm'} flex-1 rounded-3xl p-5 items-center border`}
                        >
                            <View className={`w-12 h-12 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'} rounded-2xl items-center justify-center mb-3`}>
                                <Ionicons name="analytics" size={24} color="#3B82F6" />
                            </View>
                            <Text className={`font-black text-[10px] uppercase tracking-widest text-center ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>Traffic</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/(provider)/earnings')}
                            className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100 shadow-sm'} flex-1 rounded-3xl p-5 items-center border`}
                        >
                            <View className={`w-12 h-12 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'} rounded-2xl items-center justify-center mb-3`}>
                                <Ionicons name="cash" size={24} color="#10B981" />
                            </View>
                            <Text className={`font-black text-[10px] uppercase tracking-widest text-center ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>Payouts</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* REVENUE TREND */}
                <View className="px-5 mt-8">
                    <LineChart
                        data={revenueTrend && revenueTrend.length > 0 ? revenueTrend : [
                            { label: 'Mon', value: 0 },
                            { label: 'Tue', value: 0 },
                            { label: 'Wed', value: 0 },
                            { label: 'Thu', value: 0 },
                            { label: 'Fri', value: 0 },
                            { label: 'Sat', value: 0 },
                            { label: 'Sun', value: 0 },
                        ]}
                        lineColor="#8B5CF6"
                        fillColor="#8B5CF6"
                        title="Weekly Revenue Trend"
                        dark={isDark}
                    />
                </View>

                {/* OCCUPANCY DISTRIBUTION */}
                <View className="px-5 mt-8">
                    <DonutChart
                        title="Slot Occupancy"
                        data={[
                            { label: 'Occupied', value: summary.activeCars || 0, color: '#8B5CF6' },
                            { label: 'Available', value: Math.max(0, (summary.totalSlots - summary.activeCars)) || 1, color: '#10B981' },
                        ]}
                        dark={isDark}
                    />
                </View>

                {/* LIVE ACTIVITY */}
                <View className="px-5 mt-8">
                    <View className="flex-row items-center justify-between mb-4 px-2">
                        <Text className={`font-black text-lg tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Today's Activity</Text>
                        <TouchableOpacity onPress={() => router.push('/(provider)/history')}>
                            <Text className="text-purple-600 font-bold text-xs uppercase tracking-widest">See All</Text>
                        </TouchableOpacity>
                    </View>
                    {recentActivity.map((activity, index) => (
                        <View key={index} className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100 shadow-sm'} rounded-2xl p-4 mb-3 flex-row items-center border`}>
                            <View className={`w-12 h-12 ${activity.type === 'check-in' ? (isDark ? 'bg-emerald-500/10' : 'bg-emerald-50') : (isDark ? 'bg-blue-500/10' : 'bg-blue-50')} rounded-xl items-center justify-center mr-4`}>
                                <Ionicons
                                    name={activity.type === 'check-in' ? "log-in" : "log-out"}
                                    size={24}
                                    color={activity.type === 'check-in' ? "#10B981" : "#3B82F6"}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.slotCode}</Text>
                                <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{activity.time} • {activity.customerName}</Text>
                            </View>
                            <Text className={`font-black ${activity.type === 'check-in' ? 'text-emerald-500' : 'text-blue-500'}`}>
                                {activity.type === 'check-in' ? 'IN' : 'OUT'}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
