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
    Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import BASE_URL from '../../constants/api';

const API = BASE_URL;

type ChargerType = 'L1' | 'L2' | 'L3' | 'S';

export default function ProviderEVStationScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [userName, setUserName] = useState('Provider');
    const [activeTab, setActiveTab] = useState<ChargerType>('L1');

    const [chargers, setChargers] = useState<any[]>([
        // L1 Data
        { id: 'A1', type: 'L1', connector: 'Type-2', status: 'Available', power: '7kW' },
        { id: 'A2', type: 'L1', connector: 'Type-2', status: 'Occupied', power: '7kW' },
        { id: 'A3', type: 'L1', connector: 'Type-2', status: 'Available', power: '7kW' },
        { id: 'A4', type: 'L1', connector: 'Type-2', status: 'Maintenance', power: '7kW' },
        { id: 'A5', type: 'L1', connector: 'Type-2', status: 'Available', power: '7kW' },

        // L2 Data
        { id: 'B1', type: 'L2', connector: 'Type-2', status: 'Available', power: '22kW' },
        { id: 'B2', type: 'L2', connector: 'Type-2', status: 'Available', power: '22kW' },
        { id: 'B3', type: 'L2', connector: 'Type-2', status: 'Occupied', power: '22kW' },
        { id: 'B4', type: 'L2', connector: 'Type-2', status: 'Available', power: '22kW' },
        { id: 'B5', type: 'L2', connector: 'Type-2', status: 'Available', power: '22kW' },

        // L3 Data
        { id: 'C1', type: 'L3', connector: 'CCS2', status: 'Occupied', power: '50kW' },
        { id: 'C2', type: 'L3', connector: 'CCS2', status: 'Occupied', power: '150kW' },
        { id: 'C3', type: 'L3', connector: 'CCS2', status: 'Available', power: '150kW' },
        { id: 'C4', type: 'L3', connector: 'CCS2', status: 'Available', power: '150kW' },
        { id: 'C5', type: 'L3', connector: 'CCS2', status: 'Maintenance', power: '150kW' },

        // S Data
        { id: 'S1', type: 'S', connector: 'CCS2', status: 'Occupied', power: '350kW' },
        { id: 'S2', type: 'S', connector: 'CCS2', status: 'Occupied', power: '350kW' },
        { id: 'S3', type: 'S', connector: 'CCS2', status: 'Occupied', power: '350kW' },
        { id: 'S4', type: 'S', connector: 'CCS2', status: 'Occupied', power: '350kW' },
        { id: 'S5', type: 'S', connector: 'CCS2', status: 'Available', power: '350kW' },
    ]);

    const headerGradient: readonly [string, string] = ['#111827', '#1F2937']; // Dark Header

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', route: '/(provider)/dashboard' },
        { icon: 'business', label: 'My Spaces', route: '/(provider)/spaces' },
        { icon: 'bar-chart', label: 'Earnings', route: '/(provider)/earnings' },
        { icon: 'car', label: 'Live Traffic', route: '/(provider)/traffic' },
        { icon: 'flash', label: 'Charger Network', route: '/(provider)/ev-station' },
        { icon: 'settings', label: 'Settings', route: '/(provider)/settings' },
    ];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settingsStr = await AsyncStorage.getItem('admin_settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                setIsDark(settings.darkMode ?? false);
            }
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    // Helper to get active chargers count for current tab
    const getAvailability = () => {
        const currentChargers = chargers.filter(c => c.type === activeTab);
        const available = currentChargers.filter(c => c.status === 'Available').length;
        const total = currentChargers.length;
        return `${available}/${total} AVAILABLE`;
    };

    const toggleStatus = (id: string, type: 'maintenance' | 'occupancy') => {
        setChargers(prev => prev.map(c => {
            if (c.id !== id) return c;

            if (type === 'maintenance') {
                // Toggle Maintenance. If currently Maintenance, go to Available.
                // If currently Available or Occupied, go to Maintenance.
                return { ...c, status: c.status === 'Maintenance' ? 'Available' : 'Maintenance' };
            }

            if (type === 'occupancy') {
                // Toggle Occupancy. Only works if not Maintenance.
                if (c.status === 'Maintenance') return c;
                return { ...c, status: c.status === 'Occupied' ? 'Available' : 'Occupied' };
            }

            return c;
        }));
    };

    // Configuration for each tab type
    const tabConfig = {
        L1: {
            color: '#3B82F6', // Blue
            bg: 'bg-blue-500',
            lightBg: 'bg-blue-50',
            border: 'border-blue-100',
            text: 'text-blue-500',
            title: 'Slow Grid',
            subtitle: 'Standard AC Charging • 7kW',
            badge: 'INFRASTRUCTURE L1',
            icon: 'battery-charging' as any
        },
        L2: {
            color: '#F59E0B', // Amber/Orange
            bg: 'bg-amber-500',
            lightBg: 'bg-amber-50',
            border: 'border-amber-100',
            text: 'text-amber-500',
            title: 'Medium Hub',
            subtitle: 'Fast AC Charging • 22kW',
            badge: 'INFRASTRUCTURE L2',
            icon: 'flash' as any
        },
        L3: {
            color: '#10B981', // Emerald
            bg: 'bg-emerald-500',
            lightBg: 'bg-emerald-50',
            border: 'border-emerald-100',
            text: 'text-emerald-500',
            title: 'Rapid Port',
            subtitle: 'DC Fast Charging • 150kW',
            badge: 'INFRASTRUCTURE L3',
            icon: 'speedometer' as any
        },
        S: {
            color: '#8B5CF6', // Purple
            bg: 'bg-purple-500',
            lightBg: 'bg-purple-50',
            border: 'border-purple-100',
            text: 'text-purple-500',
            title: 'Super Sonic',
            subtitle: 'Ultra DC Charging • 350kW',
            badge: 'INFRASTRUCTURE S',
            icon: 'thunderstorm' as any
        }
    };

    const currentConfig = tabConfig[activeTab];
    const filteredChargers = chargers.filter(c => c.type === activeTab);

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            {/* HEADER */}
            <UnifiedHeader
                title="Charging Network"
                subtitle="High-Voltage Infrastructure"
                role="provider"
                gradientColors={headerGradient}
                onMenuPress={() => setSidebarOpen(true)}
                userName={userName}
                showBackButton={true}
                notificationCount={2}
            />

            <UnifiedSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userName={userName}
                userRole="Parking Provider"
                userStatus="Clean Energy Active"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={headerGradient}
                dark={isDark}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* TABS */}
                <View className="px-5 mt-6">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-4">
                        {(['L1', 'L2', 'L3', 'S'] as ChargerType[]).map((tab) => {
                            const isActive = activeTab === tab;
                            const conf = tabConfig[tab];
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    activeOpacity={0.8}
                                    className={`px-6 py-4 rounded-[20px] flex-row items-center justify-center min-w-[100px] border shadow-sm items-center
                                        ${isActive ? conf.bg : (isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100')}
                                        ${isActive ? 'border-transparent' : ''}`}
                                >
                                    <Ionicons
                                        name={conf.icon}
                                        size={20}
                                        color={isActive ? 'white' : (isDark ? '#94A3B8' : '#9CA3AF')}
                                    />
                                    <Text className={`ml-2 font-black text-sm uppercase ${isActive ? 'text-white' : (isDark ? 'text-slate-400' : 'text-gray-400')}`}>
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* HERO CARD */}
                <View className="px-5 mt-8 hover:scale-105 transition-transform">
                    <View className={`rounded-[32px] p-8 relative overflow-hidden shadow-xl shadow-gray-200 ${currentConfig.bg}`}>
                        {/* Background Decoration */}
                        <View className="absolute -right-10 -bottom-10 opacity-20">
                            <Ionicons name={currentConfig.icon} size={150} color="white" />
                        </View>

                        <View className="bg-white/20 self-start px-3 py-1 rounded-full backdrop-blur-sm mb-4">
                            <Text className="text-white text-[10px] font-black uppercase tracking-widest">{currentConfig.badge}</Text>
                        </View>

                        <Text className="text-white text-3xl font-black">{currentConfig.title}</Text>
                        <Text className="text-white/80 text-sm font-bold mt-1">{currentConfig.subtitle}</Text>

                        <View className="mt-8 flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="w-2 h-2 rounded-full bg-white mr-2" />
                                <Text className="text-white text-[10px] font-black uppercase tracking-widest">{getAvailability()}</Text>
                            </View>
                            <TouchableOpacity className="bg-white px-6 py-3 rounded-[20px] shadow-sm">
                                <Text className={`font-black text-[10px] uppercase tracking-widest ${currentConfig.text}`}>Live Status</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* CHARGERS GRID */}
                <View className="px-5 mt-8">
                    <View className="flex-row flex-wrap justify-between gap-y-4">
                        {filteredChargers.map((charger) => (
                            <View key={charger.id} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-50'} w-[48%] rounded-[32px] p-5 shadow-sm border`}>
                                {/* Header: ID and Status */}
                                <View className="flex-row justify-between items-start mb-4">
                                    <View className={`w-10 h-10 rounded-xl items-center justify-center ${currentConfig.bg}`}>
                                        <Text className="text-white font-black">{charger.id}</Text>
                                    </View>
                                    <View className={`px-2 py-1 rounded-lg ${charger.status === 'Available' ? 'bg-emerald-50' :
                                            charger.status === 'Occupied' ? 'bg-rose-50' : 'bg-gray-100'
                                        }`}>
                                        <Text className={`text-[8px] font-black uppercase ${charger.status === 'Available' ? 'text-emerald-600' :
                                                charger.status === 'Occupied' ? 'text-rose-500' : 'text-gray-500'
                                            }`}>
                                            {charger.status === 'Available' ? 'Available' : charger.status}
                                        </Text>
                                    </View>
                                </View>

                                <Text className={`font-black text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{charger.power} • {charger.connector}</Text>
                                <View className="flex-row items-center mb-4">
                                    <Ionicons name="flash" size={12} color={currentConfig.color} />
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest ml-1">System Healthy</Text>
                                </View>

                                {/* TOGGLES */}
                                <View className={`pt-3 border-t ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
                                    {/* Row 1: Maintenance Toggle */}
                                    <View className="flex-row justify-between items-center mb-3">
                                        <Text className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>ACTIVE</Text>
                                        <Switch
                                            value={charger.status !== 'Maintenance'}
                                            onValueChange={() => toggleStatus(charger.id, 'maintenance')}
                                            trackColor={{ false: '#EF4444', true: '#10B981' }}
                                            thumbColor={'white'}
                                            style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                                        />
                                    </View>

                                    {/* Row 2: Occupied Toggle */}
                                    <View className="flex-row justify-between items-center opacity-90">
                                        <Text className={`text-[10px] font-bold ${charger.status === 'Maintenance' ? 'text-gray-300' : (isDark ? 'text-slate-400' : 'text-gray-400')}`}>IN USE</Text>
                                        <Switch
                                            value={charger.status === 'Occupied'}
                                            onValueChange={() => toggleStatus(charger.id, 'occupancy')}
                                            disabled={charger.status === 'Maintenance'}
                                            trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
                                            thumbColor={'white'}
                                            style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
