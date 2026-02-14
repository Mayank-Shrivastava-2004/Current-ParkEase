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
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function EVStationDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Provider');
    const [stats, setStats] = useState({
        activeChargers: 3,
        currentSessions: 2,
        energyDelivered: 450, // kWh today
        peakUsage: '2 PM - 4 PM',
    });

    const providerGradient: readonly [string, string, ...string[]] = ['#10B981', '#059669'];

    useEffect(() => {
        const init = async () => {
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);
            // Simulate API load
            setTimeout(() => setLoading(false), 800);
        };
        init();
    }, []);

    const usageData = [
        { label: 'Mon', value: 45 },
        { label: 'Tue', value: 30 },
        { label: 'Wed', value: 65 },
        { label: 'Thu', value: 40 },
        { label: 'Fri', value: 85 },
        { label: 'Sat', value: 120 },
        { label: 'Sun', value: 95 },
    ];

    const maxUsage = Math.max(...usageData.map(d => d.value));

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#10B981" />
                <Text className="mt-4 text-emerald-600 font-bold uppercase tracking-widest text-xs">Syncing Energy Hub...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <UnifiedHeader
                title="EV Station Hub"
                subtitle="Sustainability Dashboard"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => { }}
                userName={userName}
                showBackButton={true}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* STATION HERO */}
                <View className="px-6 -mt-12">
                    <Animated.View entering={ZoomIn} className="bg-white rounded-[60px] p-12 shadow-2xl shadow-emerald-900/10 border border-white">
                        <View className="flex-row items-center justify-between mb-10">
                            <View>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px]">Grid Status</Text>
                                <View className="flex-row items-center mt-2">
                                    <View className="w-3 h-3 rounded-full bg-emerald-500 mr-2 shadow-lg shadow-emerald-500/50" />
                                    <Text className="text-3xl font-black text-gray-900 tracking-tighter">Operational</Text>
                                </View>
                            </View>
                            <LinearGradient colors={['#10B981', '#059669']} className="w-16 h-16 rounded-[24px] items-center justify-center">
                                <Ionicons name="leaf" size={28} color="white" />
                            </LinearGradient>
                        </View>

                        <View className="h-[1px] w-full bg-gray-50 mb-10" />

                        <View className="flex-row justify-between">
                            <View className="items-center">
                                <Text className="text-gray-900 text-xl font-black">{stats.energyDelivered} kWh</Text>
                                <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest mt-1">Energy Output</Text>
                            </View>
                            <View className="w-[1px] h-8 bg-gray-100" />
                            <View className="items-center">
                                <Text className="text-gray-900 text-xl font-black">{stats.currentSessions}</Text>
                                <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest mt-1">Live Links</Text>
                            </View>
                            <View className="w-[1px] h-8 bg-gray-100" />
                            <View className="items-center">
                                <Text className="text-gray-900 text-xl font-black">98.2%</Text>
                                <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest mt-1">Uptime</Text>
                            </View>
                        </View>
                    </Animated.View>
                </View>

                {/* CONSUMPTION ANALYTICS */}
                <View className="px-8 mt-16">
                    <Text className="text-gray-900 text-3xl font-black tracking-tighter mb-10 px-2">Load Analytics</Text>
                    <View className="bg-white rounded-[50px] p-12 border border-white shadow-sm">
                        <View className="flex-row items-end justify-between h-48">
                            {usageData.map((day, i) => {
                                const barHeight = (day.value / maxUsage) * 100;
                                return (
                                    <View key={i} className="items-center">
                                        <Animated.View
                                            entering={FadeInUp.delay(i * 100)}
                                            style={{ height: Math.max(barHeight, 4) }}
                                            className={`w-10 rounded-[12px] ${i === 5 ? 'bg-emerald-500' : 'bg-emerald-50'}`}
                                        />
                                        <Text className={`text-[8px] font-black uppercase mt-4 ${i === 5 ? 'text-emerald-600' : 'text-gray-300'}`}>{day.label}</Text>
                                    </View>
                                );
                            })}
                        </View>

                        <View className="mt-12 bg-emerald-50/50 p-6 rounded-[30px] border border-emerald-50">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Ionicons name="trending-up" size={20} color="#10B981" />
                                    <Text className="text-emerald-800 text-[10px] font-black uppercase tracking-widest ml-3">Peak Intensity Detected</Text>
                                </View>
                                <Text className="text-emerald-900 font-black text-sm">{stats.peakUsage}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* QUICK ACTIONS */}
                <View className="px-8 mt-16">
                    <View className="flex-row gap-6">
                        <TouchableOpacity
                            onPress={() => router.push('/(provider)/ev-manage')}
                            className="flex-1 bg-gray-900 rounded-[45px] p-10 items-center justify-center shadow-xl shadow-gray-900/20"
                        >
                            <Ionicons name="settings" size={32} color="white" />
                            <Text className="text-white font-black uppercase tracking-[3px] text-[10px] mt-4">Manage units</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-1 bg-white rounded-[45px] p-10 items-center justify-center border border-gray-100">
                            <Ionicons name="analytics" size={32} color="#10B981" />
                            <Text className="text-gray-400 font-black uppercase tracking-[3px] text-[10px] mt-4">Export data</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
