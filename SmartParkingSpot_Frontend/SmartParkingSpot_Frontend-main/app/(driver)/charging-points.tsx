import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedHeader from '../../components/UnifiedHeader';
import Animated, { FadeInUp, FadeInRight, FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface ChargingPoint {
    id: string;
    status: 'available' | 'occupied' | 'maintenance';
}

interface ChargingCategory {
    id: string;
    title: string;
    level: string;
    description: string;
    icon: any;
    colors: [string, string];
    textColor: string;
    stats: string;
    points: ChargingPoint[];
}

export default function ChargingPointsScreen() {
    const router = useRouter();
    const [isDark, setIsDark] = useState(false);
    const [activeTab, setActiveTab] = useState('l1');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const settingsStr = await AsyncStorage.getItem('admin_settings');
        if (settingsStr) {
            const settings = JSON.parse(settingsStr);
            setIsDark(settings.darkMode ?? false);
        }
    };

    const chargingCategories: ChargingCategory[] = [
        {
            id: 'l1',
            title: 'Slow Grid',
            level: 'L1',
            description: 'Standard AC Charging • 7kW',
            icon: 'battery-charging',
            colors: ['#3B82F6', '#2563EB'],
            textColor: '#DBEAFE',
            stats: '3/5 Available',
            points: [
                { id: 'A1', status: 'available' },
                { id: 'A2', status: 'occupied' },
                { id: 'A3', status: 'available' },
                { id: 'A4', status: 'maintenance' },
                { id: 'A5', status: 'available' }
            ]
        },
        {
            id: 'l2',
            title: 'Medium Hub',
            level: 'L2',
            description: 'Fast AC Charging • 22kW',
            icon: 'flash',
            colors: ['#F59E0B', '#D97706'],
            textColor: '#FEF3C7',
            stats: '4/5 Available',
            points: [
                { id: 'B1', status: 'available' },
                { id: 'B2', status: 'available' },
                { id: 'B3', status: 'occupied' },
                { id: 'B4', status: 'available' },
                { id: 'B5', status: 'available' }
            ]
        },
        {
            id: 'l3',
            title: 'Rapid Port',
            level: 'L3',
            description: 'DC Fast Charging • 150kW',
            icon: 'speedometer',
            colors: ['#10B981', '#059669'],
            textColor: '#D1FAE5',
            stats: '2/5 Available',
            points: [
                { id: 'C1', status: 'occupied' },
                { id: 'C2', status: 'occupied' },
                { id: 'C3', status: 'available' },
                { id: 'C4', status: 'available' },
                { id: 'C5', status: 'maintenance' }
            ]
        },
        {
            id: 's',
            title: 'Super Sonic',
            level: 'S',
            description: 'Ultra DC Charging • 350kW',
            icon: 'thunderstorm',
            colors: ['#8B5CF6', '#7C3AED'],
            textColor: '#EDE9FE',
            stats: '1/5 Available',
            points: [
                { id: 'S1', status: 'occupied' },
                { id: 'S2', status: 'occupied' },
                { id: 'S3', status: 'occupied' },
                { id: 'S4', status: 'occupied' },
                { id: 'S5', status: 'available' }
            ]
        }
    ];

    const currentCat = chargingCategories.find(c => c.id === activeTab) || chargingCategories[0];

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Charging Network"
                subtitle="HIGH-VOLTAGE INFRASTRUCTURE"
                role="driver"
                gradientColors={['#0F172A', '#0F172A']} // Match the dark solid-ish look
                onMenuPress={() => router.back()}
                userName="Driver"
                showBackButton={true}
                compact={true}
            />

            <View className="flex-1">
                {/* CATEGORY SELECTOR TABS */}
                <View className="mt-6 px-5">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {chargingCategories.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                onPress={() => setActiveTab(cat.id)}
                                activeOpacity={0.8}
                                className={`mr-3 px-6 py-4 rounded-[28px] flex-row items-center border ${activeTab === cat.id
                                        ? 'bg-emerald-600 border-emerald-500 shadow-lg shadow-emerald-500/20'
                                        : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm')
                                    }`}
                            >
                                <Ionicons
                                    name={cat.icon}
                                    size={18}
                                    color={activeTab === cat.id ? 'white' : (isDark ? '#475569' : '#94A3B8')}
                                />
                                <Text className={`ml-2.5 font-black text-[10px] uppercase tracking-widest ${activeTab === cat.id ? 'text-white' : (isDark ? 'text-slate-400' : 'text-gray-400')}`}>
                                    {cat.level}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* ACTIVE CATEGORY CARD */}
                <Animated.View
                    key={activeTab}
                    entering={FadeInRight.duration(400)}
                    className="px-5 mt-6"
                >
                    <LinearGradient
                        colors={currentCat.colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="rounded-[40px] p-7 shadow-xl shadow-blue-500/10"
                    >
                        <View className="flex-row justify-between items-start mb-6">
                            <View className="flex-1">
                                <View className="bg-white/20 self-start px-4 py-1.5 rounded-full mb-4">
                                    <Text className="text-white font-black text-[9px] uppercase tracking-widest">
                                        INFRASTRUCTURE {currentCat.level}
                                    </Text>
                                </View>
                                <Text className="text-white font-black text-3xl tracking-tighter leading-none mb-2">
                                    {currentCat.title}
                                </Text>
                                <Text style={{ color: currentCat.textColor }} className="font-bold text-sm opacity-90">
                                    {currentCat.description}
                                </Text>
                            </View>
                            <View className="bg-white/10 w-16 h-16 rounded-[24px] items-center justify-center">
                                <Ionicons name={currentCat.icon} size={32} color="white" />
                            </View>
                        </View>

                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="w-2 h-2 rounded-full bg-white mr-2.5 animate-pulse" />
                                <Text className="text-white font-black text-[10px] uppercase tracking-widest">
                                    {currentCat.stats}
                                </Text>
                            </View>
                            <TouchableOpacity className="bg-white px-6 py-2.5 rounded-[16px] shadow-sm">
                                <Text style={{ color: currentCat.colors[0] }} className="font-black text-[10px] uppercase tracking-widest">
                                    LIVE STATUS
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* GRID OF POINTS */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 32, paddingBottom: 100 }}
                >
                    <View className="flex-row flex-wrap justify-between gap-y-6">
                        {currentCat.points.map((point, index) => (
                            <Animated.View
                                key={`${activeTab}-${point.id}`}
                                entering={FadeInUp.delay(index * 100).duration(400)}
                                className="w-[47%]"
                            >
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm shadow-black/5'} rounded-[32px] p-6 border relative overflow-hidden`}
                                >
                                    {/* STATUS INDICATOR GLOW */}
                                    <View
                                        style={{
                                            backgroundColor: point.status === 'available' ? '#10B981' : (point.status === 'occupied' ? '#F43F5E' : '#94A3B8'),
                                            opacity: 0.1
                                        }}
                                        className="absolute -top-10 -right-10 w-24 h-24 rounded-full"
                                    />

                                    <View className="flex-row justify-between items-center mb-6">
                                        <View className={`w-12 h-12 rounded-2xl items-center justify-center ${point.status === 'available' ? 'bg-emerald-500' : (point.status === 'occupied' ? 'bg-rose-500' : 'bg-slate-400')
                                            }`}>
                                            <Text className="text-white font-black text-lg">{point.id}</Text>
                                        </View>
                                        <View className={`px-3 py-1.5 rounded-full ${point.status === 'available' ? 'bg-emerald-50' : (point.status === 'occupied' ? 'bg-rose-50' : 'bg-slate-50')
                                            }`}>
                                            <Text className={`font-black text-[8px] uppercase tracking-widest ${point.status === 'available' ? 'text-emerald-500' : (point.status === 'occupied' ? 'text-rose-500' : 'text-slate-400')
                                                }`}>
                                                {point.status}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text className={`font-black text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Connector Type-2</Text>
                                    <View className="flex-row items-center">
                                        <Ionicons name="flash" size={10} color="#10B981" />
                                        <Text className="text-gray-400 text-[10px] font-bold ml-1 uppercase tracking-tighter">Healthy System</Text>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>

                    {/* INFRASTRUCTURE NOTES */}
                    <Animated.View entering={FadeInDown.delay(800)} className={`mt-10 p-8 rounded-[40px] border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-blue-50 border-blue-100'}`}>
                        <View className="flex-row items-center mb-4">
                            <Ionicons name="information-circle" size={20} color="#3B82F6" />
                            <Text className="ml-2 font-black text-blue-600 text-[10px] uppercase tracking-widest">Network Update</Text>
                        </View>
                        <Text className={`font-bold text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-blue-900/70'}`}>
                            All charging points are monitored 24/7. In case of emergency, use the SOS button in the support toolkit.
                        </Text>
                    </Animated.View>
                </ScrollView>
            </View>
        </View>
    );
}
