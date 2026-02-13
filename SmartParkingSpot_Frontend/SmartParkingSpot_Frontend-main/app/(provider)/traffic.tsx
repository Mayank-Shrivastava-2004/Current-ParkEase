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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import BarChart from '../../components/BarChart';
import StatsCard from '../../components/StatsCard';
import BASE_URL from '../../constants/api';

const API = BASE_URL;

export default function ProviderTrafficScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [userName, setUserName] = useState('Provider');
    const [data, setData] = useState<any>({
        current: {
            totalSlots: 50,
            occupied: 32,
            available: 18,
            occupancyRate: 64,
        },
        hourlyData: [
            { label: '8AM', value: 12 },
            { label: '10AM', value: 25 },
            { label: '12PM', value: 42 },
            { label: '2PM', value: 48 },
            { label: '4PM', value: 35 },
            { label: '6PM', value: 20 },
            { label: '8PM', value: 10 },
        ],
        peakHours: [
            { timeRange: '12:00 PM - 02:00 PM', bookings: 24, load: 'High' },
            { timeRange: '09:00 AM - 11:00 AM', bookings: 12, load: 'Medium' },
            { timeRange: '04:00 PM - 06:00 PM', bookings: 18, load: 'High' },
        ],
    });

    const providerGradient: readonly [string, string, ...string[]] = ['#4F46E5', '#312E81'];

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', route: '/(provider)/dashboard' },
        { icon: 'business', label: 'My Spaces', route: '/(provider)/spaces' },
        { icon: 'bar-chart', label: 'Earnings', route: '/(provider)/earnings' },
        { icon: 'car', label: 'Live Traffic', route: '/(provider)/traffic' },
        { icon: 'time', label: 'History', route: '/(provider)/history' },
        { icon: 'flash', label: 'EV Station', route: '/(provider)/ev-station' },
        { icon: 'headset', label: 'Support', route: '/(provider)/support' },
    ];

    useEffect(() => {
        const loadTraffic = async () => {
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

                const res = await fetch(`${API}/api/provider/occupancy`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (err) {
                console.error('Traffic load failed:', err);
            } finally {
                setLoading(false);
            }
        };
        loadTraffic();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="mt-4 text-indigo-500 font-bold uppercase tracking-widest text-xs">Scanning Sensors...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Live Traffic"
                subtitle="Occupancy Monitor"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => setSidebarOpen(true)}
                userName={userName}
                showBackButton={true}
            />

            <UnifiedSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userName={userName}
                userRole="Parking Provider"
                userStatus="Live Feed Online"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={providerGradient}
                dark={isDark}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* HERO CIRCULAR GAUGE (MOCK) */}
                <View className="px-5 mt-6">
                    <View className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-blue-50 shadow-blue-900/10'} rounded-[40px] p-8 shadow-2xl border items-center`}>
                        <View className={`w-48 h-48 rounded-full border-[12px] ${isDark ? 'border-slate-800' : 'border-blue-50'} items-center justify-center relative`}>
                            <View
                                className="absolute w-full h-full rounded-full border-[12px] border-indigo-500"
                                style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent', transform: [{ rotate: '45deg' }] }}
                            />
                            <View className="items-center">
                                <Text className={`text-5xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{data.current.occupancyRate}%</Text>
                                <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Full Capacity</Text>
                            </View>
                        </View>

                        <View className="flex-row w-full justify-between mt-10 px-2">
                            <View className="items-center">
                                <Text className="text-indigo-500 text-2xl font-black">{data.current.occupied}</Text>
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Occupied Slots</Text>
                            </View>
                            <View className={`w-[1px] ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`} />
                            <View className="items-center">
                                <Text className="text-emerald-500 text-2xl font-black">{data.current.available}</Text>
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Available Now</Text>
                            </View>
                            <View className={`w-[1px] ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`} />
                            <View className="items-center">
                                <Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{data.current.totalSlots}</Text>
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Total Assets</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* HOURLY LOAD CHART */}
                <View className="px-5 mt-8">
                    <BarChart
                        data={data.hourlyData}
                        barColor="bg-indigo-600"
                        title="Hourly Load Distribution"
                        dark={isDark}
                    />
                </View>

                {/* PEAK HOUR INTELLIGENCE */}
                <View className="px-5 mt-10">
                    <Text className={`font-black text-2xl tracking-tight mb-6 px-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Peak Intelligence</Text>
                    {data.peakHours.map((item: any, index: number) => (
                        <View key={index} className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100 shadow-sm'} rounded-[32px] p-6 mb-4 border flex-row items-center`}>
                            <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-5 ${item.load === 'High' ? (isDark ? 'bg-rose-500/10' : 'bg-rose-50') : (isDark ? 'bg-indigo-500/10' : 'bg-blue-50')}`}>
                                <Ionicons
                                    name="flame"
                                    size={24}
                                    color={item.load === 'High' ? "#EF4444" : "#6366F1"}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-black text-lg tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.timeRange}</Text>
                                <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                                    Load Velocity: {item.load}
                                </Text>
                            </View>
                            <View className="items-end">
                                <Text className={`font-black text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.bookings}</Text>
                                <Text className="text-gray-500 text-[8px] font-bold">AVG BOOKINGS</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* ACTION CARD */}
                <View className="px-5 mt-6">
                    <TouchableOpacity className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-gray-900 shadow-gray-900/30'} rounded-[35px] p-8 flex-row items-center justify-between overflow-hidden shadow-2xl border`}>
                        <View className="flex-1">
                            <Text className={`text-xl font-black ${isDark ? 'text-white' : 'text-white'}`}>Optimization Alert</Text>
                            <Text className={`${isDark ? 'text-slate-400' : 'text-white/60'} text-xs mt-2 font-medium`}>Demand is surging near 2PM. Consider adjusting rates.</Text>
                        </View>
                        <View className={`w-12 h-12 ${isDark ? 'bg-indigo-500/20' : 'bg-white/10'} rounded-2xl items-center justify-center`}>
                            <Ionicons name="flash" size={24} color={isDark ? '#6366F1' : 'white'} />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
