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
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedHeader from '../../components/UnifiedHeader';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import axios from 'axios';
import BASE_URL from '../../constants/api';

const API = BASE_URL;

export default function PerformanceScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    const providerGradient: readonly [string, string, ...string[]] = ['#8B5CF6', '#6D28D9'];

    useEffect(() => {
        loadPerformance();
    }, []);

    const loadPerformance = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await axios.get(`${API}/api/provider/dashboard-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 200) {
                setStats(res.data.summary);
            }
        } catch (err) {
            console.error('Performance load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="mt-4 text-purple-600 font-bold uppercase tracking-widest text-xs">Calibrating Metrics...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <UnifiedHeader
                title="Business Core"
                subtitle="Performance Saturation"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => { }}
                userName="Admin"
                showBackButton={true}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* EFFICIENCY GAUGE */}
                <View className="px-6 -mt-12">
                    <Animated.View entering={ZoomIn} className="bg-white rounded-[60px] p-12 shadow-2xl shadow-indigo-900/10 border border-white items-center">
                        <View className="w-64 h-64 rounded-full border-[20px] border-gray-50 items-center justify-center relative shadow-inner">
                            <LinearGradient
                                colors={['#8B5CF6', '#6D28D9']}
                                className="absolute w-full h-full rounded-full opacity-10"
                            />
                            <View className="items-center">
                                <Text className="text-7xl font-black text-gray-900 tracking-tighter">{stats.occupancyRate}%</Text>
                                <Text className="text-gray-400 text-[11px] font-black uppercase tracking-[4px] mt-2">Aggregate Efficiency</Text>
                            </View>
                        </View>

                        <View className="flex-row w-full justify-between mt-16 px-6">
                            <View className="items-center">
                                <Text className="text-purple-600 text-4xl font-black tracking-tighter">{stats.rating.toFixed(1)}</Text>
                                <Text className="text-gray-400 text-[9px] font-black uppercase tracking-[3px] mt-1">Community Trust</Text>
                            </View>
                            <View className="w-[1.5px] bg-gray-100 h-12 self-center" />
                            <View className="items-center">
                                <Text className="text-gray-900 text-4xl font-black tracking-tighter">{stats.totalReviews}</Text>
                                <Text className="text-gray-400 text-[9px] font-black uppercase tracking-[3px] mt-1">Network Reliability</Text>
                            </View>
                        </View>
                    </Animated.View>
                </View>

                {/* METRICS BREAKDOWN */}
                <View className="px-7 mt-16">
                    <Text className="text-gray-900 text-3xl font-black tracking-tighter mb-10 px-2">Key Drivers</Text>

                    {[
                        { label: 'Network Occupancy', color: '#8B5CF6', value: stats.occupancyRate, icon: 'analytics-outline', detail: 'Real-time asset utilization across all registered hubs.' },
                        { label: 'Provider Integrity', color: '#10B981', value: stats.rating * 20, icon: 'shield-checkmark-outline', detail: 'Feedback-driven verification of service consistency.' },
                        { label: 'Growth Velocity', color: '#F59E0B', value: 88, icon: 'trending-up-outline', detail: 'Month-over-month increase in unique driver bookings.' },
                    ].map((metric, i) => (
                        <Animated.View
                            key={i}
                            entering={FadeInUp.delay(i * 150)}
                            className="bg-white rounded-[45px] p-10 mb-8 border border-white shadow-sm"
                        >
                            <View className="flex-row items-center justify-between mb-8">
                                <View className="flex-row items-center">
                                    <View style={{ backgroundColor: `${metric.color}15` }} className="w-16 h-16 rounded-[28px] items-center justify-center mr-6">
                                        <Ionicons name={metric.icon as any} size={32} color={metric.color} />
                                    </View>
                                    <View>
                                        <Text className="text-gray-900 font-black text-xl tracking-tight">{metric.label}</Text>
                                        <Text className="text-gray-400 text-[9px] font-black uppercase tracking-[3px] mt-1">Institutional Grade</Text>
                                    </View>
                                </View>
                                <Text className="text-gray-900 text-3xl font-black">{metric.value}%</Text>
                            </View>

                            <View className="h-2 w-full bg-gray-50 rounded-full overflow-hidden mb-6 border border-gray-100/50 shadow-inner">
                                <Animated.View
                                    className="h-full rounded-full"
                                    style={{ width: `${metric.value}%`, backgroundColor: metric.color }}
                                />
                            </View>
                            <Text className="text-gray-400 text-[12px] font-medium leading-relaxed px-2">{metric.detail}</Text>
                        </Animated.View>
                    ))}
                </View>

                {/* OPTIMIZATION PROTOCOL */}
                <View className="px-7 mt-10">
                    <TouchableOpacity
                        activeOpacity={0.9}
                        className="bg-gray-900 rounded-[50px] p-12 shadow-2xl shadow-gray-900/60 border border-gray-800"
                    >
                        <View className="flex-row items-center justify-between mb-10">
                            <View className="bg-white/10 w-20 h-20 rounded-[30px] items-center justify-center">
                                <Ionicons name="bulb-outline" size={44} color="#FACC15" />
                            </View>
                            <View className="bg-emerald-500/20 px-6 py-2 rounded-full border border-emerald-500/30">
                                <Text className="text-emerald-400 font-black text-[9px] uppercase tracking-[3px]">Protocol Active</Text>
                            </View>
                        </View>
                        <Text className="text-white text-3xl font-black tracking-tight mb-4">Optimization Strategy</Text>
                        <Text className="text-white/40 text-[14px] leading-relaxed font-medium">
                            Based on current occupancy data, we recommend introducing "Weekend Flash Rates" to boost retention by 22% during off-peak windows.
                        </Text>
                        <View className="mt-12 flex-row items-center">
                            <Text className="text-purple-400 font-black uppercase tracking-[3px] text-[10px] mr-3">Launch Simulation</Text>
                            <Ionicons name="arrow-forward" size={16} color="#A855F7" />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
