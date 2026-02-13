import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../constants/api';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import BarChart from '../../components/BarChart';
import StatsCard from '../../components/StatsCard';
import LineChart from '../../components/LineChart';
import DonutChart from '../../components/DonutChart';

/* ===== BROADCAST MODAL COMPONENT ===== */
function BroadcastModal({ visible, onClose }: { visible: boolean, onClose: () => void }) {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const API = BASE_URL;
            const res = await fetch(`${API}/api/admin/notifications/broadcast`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            if (res.ok) {
                Alert.alert('Success', 'Broadcast sent to all users!');
                setMessage('');
                onClose();
            } else {
                throw new Error('Failed to send');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to send broadcast');
        } finally {
            setSending(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/50 justify-center px-6">
                <View className="bg-white rounded-3xl p-6">
                    <Text className="text-xl font-black mb-2">System Broadcast</Text>
                    <Text className="text-gray-400 text-xs mb-4 uppercase font-bold tracking-widest">Message for all users</Text>

                    <TextInput
                        multiline
                        numberOfLines={4}
                        placeholder="Type your message here..."
                        value={message}
                        onChangeText={setMessage}
                        className="bg-gray-100 rounded-2xl p-4 text-gray-900 border border-gray-200 h-32 font-semibold"
                        textAlignVertical="top"
                    />

                    <View className="flex-row gap-3 mt-6">
                        <TouchableOpacity onPress={onClose} className="flex-1 py-4 bg-gray-100 rounded-2xl items-center">
                            <Text className="font-bold text-gray-600">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={sending}
                            className={`flex-1 py-4 bg-indigo-600 rounded-2xl items-center shadow-lg shadow-indigo-600/30 ${sending ? 'opacity-50' : ''}`}
                        >
                            <Text className="text-white font-bold">{sending ? 'Sending...' : 'Send Now'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default function AdminDashboardScreen() {
    const router = useRouter();
    const [analytics, setAnalytics] = useState<any>(null);
    const [broadcastVisible, setBroadcastVisible] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [pendingProviders, setPendingProviders] = useState<any[]>([]);
    const [adminProfile, setAdminProfile] = useState<any>(null);
    const [isDark, setIsDark] = useState(false);
    const [range, setRange] = useState('WEEK'); // WEEK | MONTH | YEAR

    const adminGradient: readonly [string, string, ...string[]] = ['#4F46E5', '#312E81'];

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', route: '/(admin)/dashboard' },
        { icon: 'people', label: 'Manage Drivers', route: '/(admin)/drivers' },
        { icon: 'business', label: 'Manage Providers', route: '/(admin)/providers' },
        { icon: 'alert-circle', label: 'Disputes', route: '/(admin)/disputes' },
        { icon: 'bar-chart', label: 'Analytics', route: '/(admin)/analytics' },
        { icon: 'person-circle', label: 'Account Profile', route: '/(admin)/profile' },
        { icon: 'settings', label: 'Settings', route: '/(admin)/settings' },
    ];

    /* ===== FETCH ADMIN DATA & THEME ===== */
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Load Theme
                const settingsStr = await AsyncStorage.getItem('admin_settings');
                if (settingsStr) {
                    const settings = JSON.parse(settingsStr);
                    setIsDark(settings.darkMode ?? false);
                }

                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    router.replace('/' as any);
                    return;
                }

                const [analyticsRes, provRes, profileRes] = await Promise.all([
                    fetch(`${BASE_URL}/api/admin/analytics?range=${range}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${BASE_URL}/api/admin/providers?status=PENDING`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${BASE_URL}/api/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (analyticsRes.status === 401 || analyticsRes.status === 403) {
                    await AsyncStorage.clear();
                    router.replace('/' as any);
                    return;
                }

                if (analyticsRes.ok) {
                    const data = await analyticsRes.json();
                    setAnalytics(data);
                }

                if (provRes.ok) {
                    const provData = await provRes.json();
                    setPendingProviders(provData.slice(0, 3));
                }

                if (profileRes.ok) {
                    const profData = await profileRes.json();
                    setAdminProfile(profData);
                }
            } catch (err) {
                console.error('Failed to load dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, [range]);

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    if (loading) {
        return (
            <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-white'} justify-center items-center`}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-4 text-indigo-500 font-bold uppercase tracking-widest text-[8px]">Synchronizing Mainframe...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Admin Control"
                subtitle="System Root Access"
                role="admin"
                gradientColors={adminGradient}
                onMenuPress={() => setSidebarVisible(true)}
                userName={adminProfile?.name || 'Admin'}
                notificationCount={pendingProviders.length}
            />

            <UnifiedSidebar
                isOpen={sidebarVisible}
                onClose={() => setSidebarVisible(false)}
                userName={adminProfile?.name || 'Administrator'}
                userRole="Root Authority"
                userStatus="Mainframe Online"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={adminGradient}
                dark={isDark}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* USER METRICS */}
                <View className="px-5 mt-6">
                    <Text className={`font-black text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Network Growth</Text>
                    <View className="flex-row gap-4">
                        <StatsCard
                            icon="car"
                            iconColor="#10B981"
                            iconBgColor={isDark ? "bg-emerald-500/10" : "bg-emerald-50"}
                            label="Drivers"
                            value={analytics?.userGrowth?.drivers?.total || 0}
                            trend={{ value: 12, isPositive: true }}
                            dark={isDark}
                        />
                        <StatsCard
                            icon="business"
                            iconColor="#8B5CF6"
                            iconBgColor={isDark ? "bg-purple-500/10" : "bg-purple-50"}
                            label="Providers"
                            value={analytics?.userGrowth?.providers?.total || 0}
                            trend={{ value: 5, isPositive: true }}
                            dark={isDark}
                        />
                    </View>
                </View>

                {/* USER GROWTH CHARTS */}
                <View className="px-5 mt-8">
                    {/* Range Selector */}
                    <View className={`flex-row mb-6 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl self-start`}>
                        {['WEEK', 'MONTH', 'YEAR'].map((r) => (
                            <TouchableOpacity
                                key={r}
                                onPress={() => setRange(r)}
                                className={`px-4 py-2 rounded-lg ${range === r ? 'bg-white shadow-sm' : ''}`}
                            >
                                <Text className={`text-xs font-bold ${range === r ? 'text-indigo-600' : 'text-gray-500'}`}>{r}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Driver Growth Chart */}
                    <View className="mb-8">
                        <LineChart
                            data={(analytics?.userGrowth?.growthTrend || []).map((t: any) => ({
                                label: t.label,
                                value: t.drivers || 0
                            }))}
                            lineColor="#10B981"
                            fillColor="#10B981"
                            title="Driver Acquisition"
                        />
                    </View>

                    {/* Provider Growth Chart */}
                    <View>
                        <LineChart
                            data={(analytics?.userGrowth?.growthTrend || []).map((t: any) => ({
                                label: t.label,
                                value: t.providers || 0
                            }))}
                            lineColor="#8B5CF6"
                            fillColor="#8B5CF6"
                            title="Provider Onboarding"
                        />
                    </View>
                </View>



                {/* PENDING APPROVALS - REAL DATA */}
                <View className="px-5 mt-10">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className={`font-black text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Identity Verification</Text>
                        <View className="bg-amber-100 px-3 py-1 rounded-full">
                            <Text className="text-amber-600 text-[10px] font-black">{pendingProviders.length} WAITING</Text>
                        </View>
                    </View>

                    {pendingProviders.length === 0 ? (
                        <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} rounded-3xl p-10 items-center border border-dashed`}>
                            <Ionicons name="shield-checkmark" size={48} color={isDark ? "#334155" : "#D1D5DB"} />
                            <Text className="text-gray-500 mt-4 font-bold text-center">All operators verified</Text>
                        </View>
                    ) : (
                        pendingProviders.map((provider, idx) => (
                            <TouchableOpacity
                                key={provider.id}
                                onPress={() => router.push(`/(admin)/providers` as any)}
                                className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-[32px] p-6 mb-4 flex-row items-center border shadow-sm`}
                            >
                                <View className={`w-14 h-14 ${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'} rounded-2xl items-center justify-center mr-4 border`}>
                                    <Text className="text-indigo-600 text-xl font-black">{provider.name?.charAt(0) || '?'}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-black text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{provider.name}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Ionicons name="mail" size={12} color="#94A3B8" />
                                        <Text className="text-gray-400 text-[10px] font-bold ml-1">{provider.email}</Text>
                                    </View>
                                </View>
                                <View className={`${isDark ? 'bg-slate-800' : 'bg-gray-50'} p-2 rounded-xl`}>
                                    <Ionicons name="chevron-forward" size={16} color="#4F46E5" />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <BroadcastModal visible={broadcastVisible} onClose={() => setBroadcastVisible(false)} />
            </ScrollView>
        </View>
    );
}
