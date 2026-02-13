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
import UnifiedSidebar from '../../components/UnifiedSidebar';
import StatsCard from '../../components/StatsCard';
import BarChart from '../../components/BarChart';

const API = 'http://10.67.158.172:8080';

export default function ProviderEVStationScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Provider');
    const [data, setData] = useState<any>({
        summary: {
            totalChargers: 4,
            activeChargers: 3,
            inUse: 2,
            available: 1,
            totalSessions: 142,
            energyDelivered: 1240,
        },
        chargers: [
            { id: 'EV-01', type: 'Level 2', power: 22, status: 'available', currentSession: null },
            { id: 'EV-02', type: 'DC Fast', power: 50, status: 'in-use', currentSession: 45 },
            { id: 'EV-03', type: 'Level 2', power: 22, status: 'in-use', currentSession: 120 },
            { id: 'EV-04', type: 'DC Fast', power: 50, status: 'unavailable', currentSession: null },
        ],
        usageData: [
            { label: 'Mon', value: 12 },
            { label: 'Tue', value: 18 },
            { label: 'Wed', value: 15 },
            { label: 'Thu', value: 22 },
            { label: 'Fri', value: 30 },
            { label: 'Sat', value: 25 },
            { label: 'Sun', value: 20 },
        ],
    });

    const providerGradient: readonly [string, string, ...string[]] = ['#10B981', '#047857'];

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
        const loadEVData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const name = await AsyncStorage.getItem('userName');
                if (name) setUserName(name);

                const res = await fetch(`${API}/api/provider/ev-station`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const json = await res.json();
                    if (json.summary) setData(json);
                }
            } catch (err) {
                console.error('EV data load failed:', err);
            } finally {
                setLoading(false);
            }
        };
        loadEVData();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#10B981" />
                <Text className="mt-4 text-emerald-600 font-bold uppercase tracking-widest text-xs">Energizing Panel...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="EV Ecosystem"
                subtitle="Sustainability Hub"
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
                userStatus="Clean Energy Active"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={providerGradient}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* ENERGY METRICS */}
                <View className="px-5 -mt-8">
                    <View className="bg-white rounded-[40px] p-8 shadow-2xl shadow-emerald-900/10 border border-emerald-50">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Energy Delivered</Text>
                                <Text className="text-gray-900 text-4xl font-black mt-1">{data.summary.energyDelivered} kWh</Text>
                            </View>
                            <View className="w-14 h-14 bg-emerald-50 rounded-2xl items-center justify-center">
                                <Ionicons name="flash" size={28} color="#10B981" />
                            </View>
                        </View>
                        <View className="bg-gray-50 rounded-[30px] p-5 flex-row justify-between">
                            <View className="items-center">
                                <Text className="text-gray-900 text-xl font-black">{data.summary.totalSessions}</Text>
                                <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Sessions</Text>
                            </View>
                            <View className="w-[1px] bg-gray-200" />
                            <View className="items-center">
                                <Text className="text-emerald-500 text-xl font-black">{data.summary.activeChargers}</Text>
                                <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Active</Text>
                            </View>
                            <View className="w-[1px] bg-gray-200" />
                            <View className="items-center">
                                <Text className="text-blue-500 text-xl font-black">{data.summary.inUse}</Text>
                                <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">In Use</Text>
                            </View>
                        </View>
                    </View>

                    {/* MANAGE CHARGERS BUTTON */}
                    <View className="px-5 mt-6">
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => router.push('/(provider)/ev-manage' as any)}
                            className="bg-emerald-600 rounded-[32px] p-6 flex-row items-center justify-between shadow-lg shadow-emerald-900/40"
                        >
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mr-4">
                                    <Ionicons name="settings" size={24} color="white" />
                                </View>
                                <View>
                                    <Text className="text-white text-lg font-black">Manage Chargers</Text>
                                    <Text className="text-white/70 text-xs font-medium mt-1">Add, Edit & Configure</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ASSET GRID */}
                <View className="px-5 mt-10">
                    <Text className="font-black text-2xl tracking-tight text-gray-900 mb-6 px-2">Charger Network</Text>
                    <View className="flex-row flex-wrap justify-between gap-y-4">
                        {data.chargers.map((charger: any) => (
                            <View key={charger.id} className="w-[48%] bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
                                <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-4 ${charger.status === 'in-use' ? 'bg-blue-50' :
                                    charger.status === 'available' ? 'bg-emerald-50' : 'bg-gray-100'
                                    }`}>
                                    <Ionicons
                                        name="battery-charging"
                                        size={22}
                                        color={charger.status === 'in-use' ? "#3B82F6" :
                                            charger.status === 'available' ? "#10B981" : "#94A3B8"}
                                    />
                                </View>
                                <Text className="text-gray-900 font-black text-lg">{charger.id}</Text>
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                                    {charger.type} • {charger.power}kW
                                </Text>
                                <View className={`mt-4 px-3 py-1 rounded-full self-start ${charger.status === 'in-use' ? 'bg-blue-100' :
                                    charger.status === 'available' ? 'bg-emerald-100' : 'bg-gray-100'
                                    }`}>
                                    <Text className={`text-[8px] font-black uppercase ${charger.status === 'in-use' ? 'text-blue-600' :
                                        charger.status === 'available' ? 'text-emerald-600' : 'text-gray-600'
                                        }`}>
                                        {charger.status}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* WEEKLY SESSIONS CHART */}
                <View className="px-5 mt-10">
                    <BarChart
                        data={data.usageData}
                        barColor="bg-emerald-500"
                        title="Weekly Utilization Trend"
                    />
                </View>

                {/* GREEN IMPACT */}
                <View className="px-5 mt-10">
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        className="rounded-[40px] p-8 overflow-hidden shadow-2xl shadow-emerald-900/40"
                    >
                        <Ionicons name="leaf" size={64} color="white" style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.2 }} />
                        <Text className="text-white text-2xl font-black">Eco Milestone</Text>
                        <Text className="text-white/80 text-sm mt-2 font-medium">
                            Your EV infrastructure has offset 2,400kg of CO2 emissions this quarter. You are in the top 5% of green providers!
                        </Text>
                        <TouchableOpacity className="mt-6 bg-white/20 py-4 rounded-2xl items-center border border-white/30">
                            <Text className="text-white font-black uppercase tracking-widest text-[10px]">View Impact Report</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </ScrollView>
        </View>
    );
}
