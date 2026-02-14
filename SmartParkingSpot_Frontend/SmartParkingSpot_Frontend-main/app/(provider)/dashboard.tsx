import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import axios from 'axios';
import BASE_URL from '../../constants/api';
import UnifiedHeader from '../../components/UnifiedHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');
const API = BASE_URL;

export default function ProviderDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<any>({
        summary: {
            totalRevenue: 0,
            todayEarnings: 0,
            monthToDateEarnings: 0,
            occupancyRate: 0,
            activeCars: 0,
            totalSlots: 0,
            rating: 5.0,
            totalReviews: 0
        },
        revenueTrend: [],
        recentActivity: [],
        online: true,
        providerName: 'Provider'
    });

    const providerGradient: readonly [string, string, ...string[]] = ['#8B5CF6', '#6D28D9'];

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                router.replace('/(provider)');
                return;
            }

            // Real Data Fetch
            const response = await axios.get(`${API}/api/provider/dashboard-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Failed to load dashboard', err);
            // Fallback for demo if API fails
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleStatusToggle = async (val: boolean) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.put(`${API}/api/provider/status`,
                { online: val },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status === 200) {
                setStats({ ...stats, online: val });
                Alert.alert('Protocol Sync', `System is now ${val ? 'Discovery LIVE' : 'OFFLINE'}.`);
            }
        } catch (err) {
            Alert.alert('Sync Error', 'Cloud interface unreachable.');
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text className="mt-2 text-purple-600 font-bold uppercase tracking-[2px] text-[8px]">Syncing Real-time Flux...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <UnifiedHeader
                title="Hub Central"
                subtitle="DASHBOARD ALPHA"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => { }} // Hook Side Drawer here if configured
                userName={stats.providerName}
                showStatusToggle={true}
                isOnline={stats.online}
                onStatusToggle={handleStatusToggle}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDashboard(); }} tintColor="#8B5CF6" />
                }
            >
                {/* COMPACT KPI GRID */}
                <View className="px-4 mt-4 flex-row flex-wrap justify-between">
                    {[
                        { label: 'Total Spots', value: stats.summary.totalSlots, icon: 'grid-outline', color: '#8B5CF6', route: '/(provider)/spaces' },
                        { label: 'Active Load', value: stats.summary.activeCars, icon: 'car-sport-outline', color: '#10B981', route: '/(provider)/traffic' },
                        { label: 'Today Yield', value: `₹${stats.summary.todayEarnings.toFixed(0)}`, icon: 'cash-outline', color: '#3B82F6', route: '/(provider)/earnings' },
                        { label: 'MTD Revenue', value: `₹${stats.summary.monthToDateEarnings.toFixed(0)}`, icon: 'stats-chart-outline', color: '#F59E0B', route: '/(provider)/earnings' },
                    ].map((widget, i) => (
                        <Animated.View
                            key={i}
                            entering={FadeInDown.delay(i * 50)}
                            style={{ width: (width - 48) / 2 }}
                            className="mb-3"
                        >
                            <TouchableOpacity
                                onPress={() => router.push(widget.route as any)}
                                activeOpacity={0.9}
                                className="bg-white rounded-2xl p-4 border border-purple-50 shadow-sm"
                            >
                                <View className="flex-row items-center justify-between mb-2">
                                    <View style={{ backgroundColor: `${widget.color}15` }} className="w-8 h-8 rounded-lg items-center justify-center">
                                        <Ionicons name={widget.icon as any} size={16} color={widget.color} />
                                    </View>
                                    <Ionicons name="chevron-forward" size={10} color="#CBD5E1" />
                                </View>
                                <Text className="text-gray-400 text-[7px] font-black uppercase tracking-[2px] mb-0.5">{widget.label}</Text>
                                <Text className="text-gray-900 text-xl font-black tracking-tight">{widget.value}</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                {/* BUSINESS FLOW (LINE CHART MOCKUP) */}
                <View className="px-4 mt-2">
                    <Animated.View entering={ZoomIn.delay(200)} className="bg-white rounded-3xl p-5 border border-purple-50 shadow-sm">
                        <View className="flex-row justify-between items-center mb-4">
                            <View>
                                <Text className="text-gray-900 text-base font-black tracking-tight">Business Flow</Text>
                                <Text className="text-gray-400 text-[7px] font-black uppercase tracking-[2px]">30-Day Revenue Flux</Text>
                            </View>
                        </View>

                        <View className="items-center">
                            <LineChart
                                data={{
                                    labels: stats.revenueTrend.filter((_: any, idx: number) => idx % 5 === 0).map((d: any) => d.label),
                                    datasets: [{
                                        data: stats.revenueTrend.length > 0
                                            ? stats.revenueTrend.map((d: any) => d.value)
                                            : [0, 0, 0, 0, 0]
                                    }]
                                }}
                                width={width - 48}
                                height={160}
                                yAxisLabel="₹"
                                yAxisSuffix=""
                                chartConfig={{
                                    backgroundColor: '#ffffff',
                                    backgroundGradientFrom: '#ffffff',
                                    backgroundGradientTo: '#ffffff',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                                    style: { borderRadius: 16 },
                                    propsForDots: { r: "3", strokeWidth: "2", stroke: "#8B5CF6" }
                                }}
                                bezier
                                style={{ borderRadius: 16, paddingRight: 40 }}
                            />
                        </View>
                    </Animated.View>
                </View>

                {/* SYSTEM HEALTH (CLICKABLE) */}
                <View className="px-5 mt-6">
                    <Text className="text-gray-900 text-lg font-black tracking-tight ml-2 mb-4">System Health</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(provider)/performance')}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#1F2937', '#111827']}
                            className="rounded-[40px] p-8 flex-row justify-between items-center shadow-lg shadow-black/20"
                        >
                            {[
                                { label: 'Occupancy', value: `${stats.summary.occupancyRate}%`, icon: 'analytics', color: '#A855F7' },
                                { label: 'Trust', value: stats.summary.rating.toFixed(1), icon: 'ribbon', color: '#FACC15' },
                                { label: 'Integrity', value: `${Math.round((stats.summary.rating / 5) * 100)}%`, icon: 'shield-checkmark', color: '#10B981' },
                            ].map((metric, i) => (
                                <View key={i} className="items-center">
                                    <View className="bg-white/5 w-12 h-12 rounded-2xl items-center justify-center mb-3">
                                        <Ionicons name={metric.icon as any} size={22} color={metric.color} />
                                    </View>
                                    <Text className="text-white text-xl font-black">{metric.value}</Text>
                                    <Text className="text-white/30 text-[7px] font-black uppercase tracking-[2px] mt-1">{metric.label}</Text>
                                </View>
                            ))}
                            <Ionicons name="chevron-forward" size={16} color="white" style={{ opacity: 0.2 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* QUICK SUPPORT */}
                <View className="px-5 mt-6">
                    <TouchableOpacity
                        onPress={() => router.push('/(provider)/support' as any)}
                        activeOpacity={0.8}
                        className="bg-white rounded-[32px] p-6 border border-purple-50 flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center">
                            <View className="bg-purple-50 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                <Ionicons name="headset" size={24} color="#8B5CF6" />
                            </View>
                            <View>
                                <Text className="text-gray-900 font-black text-base tracking-tight">Concierge Access</Text>
                                <Text className="text-gray-400 text-[8px] font-black uppercase tracking-[2px]">Real-time assistance</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}
