import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import Animated, { FadeInUp } from 'react-native-reanimated';
import BASE_URL from '../../constants/api';

export default function AdminDisputesScreen() {
    const router = useRouter();
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const adminGradient: readonly [string, string, ...string[]] = ['#E67E22', '#D35400'];

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', route: '/(admin)/dashboard' },
        { icon: 'people', label: 'Manage Drivers', route: '/(admin)/drivers' },
        { icon: 'business', label: 'Manage Providers', route: '/(admin)/providers' },
        { icon: 'alert-circle', label: 'Disputes', route: '/(admin)/disputes' },
        { icon: 'notifications', label: 'Notifications', route: '/(admin)/notifications' },
        { icon: 'bar-chart', label: 'Analytics', route: '/(admin)/analytics' },
        { icon: 'person-circle', label: 'Account Profile', route: '/(admin)/profile' },
        { icon: 'settings', label: 'Settings', route: '/(admin)/settings' },
    ];

    const loadSettings = async () => {
        try {
            const settingsStr = await AsyncStorage.getItem('admin_settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                setIsDark(settings.darkMode ?? false);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchDisputes = async () => {
        try {
            await loadSettings();
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/api/admin/disputes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDisputes(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

    const handleResolve = async (id: number) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/api/admin/disputes/${id}/resolve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                Alert.alert('Success', 'Dispute marked as resolved');
                fetchDisputes();
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to resolve dispute');
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
                <ActivityIndicator size="large" color="#D35400" />
                <Text className="mt-4 text-orange-600 font-bold uppercase tracking-widest text-xs">Loading Issues...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Dispute Center"
                subtitle="Conflict Resolution"
                role="admin"
                gradientColors={adminGradient}
                onMenuPress={() => setSidebarOpen(true)}
                userName="Admin"
                showBackButton={true}
            />

            <UnifiedSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userName="Admin User"
                userRole="System Administrator"
                userStatus="Root Access Online"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={adminGradient}
                dark={isDark}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="px-5 mt-6">
                    <Text className={`font-black text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Active Reports</Text>

                    {disputes.length === 0 ? (
                        <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-3xl p-10 items-center border border-dashed`}>
                            <Ionicons name="checkmark-circle-outline" size={48} color={isDark ? '#334155' : '#D1D5DB'} />
                            <Text className="text-gray-500 mt-4 font-bold text-center uppercase tracking-widest text-xs">All Systems Nominal</Text>
                            <Text className="text-gray-400 text-[10px] mt-1">No active disputes reported</Text>
                        </View>
                    ) : (
                        disputes.map((dispute, index) => (
                            <Animated.View
                                key={dispute.id}
                                entering={FadeInUp.delay(index * 100)}
                                className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} p-6 rounded-[32px] mb-4 shadow-sm border`}
                            >
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className={`font-black tracking-widest text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>REF #{dispute.id}</Text>
                                    <View className={`px-3 py-1 rounded-full ${dispute.status === 'RESOLVED' ? (isDark ? 'bg-emerald-500/10' : 'bg-emerald-100') :
                                        dispute.status === 'ESCALATED' ? (isDark ? 'bg-rose-500/10' : 'bg-rose-100') :
                                            (isDark ? 'bg-orange-500/10' : 'bg-orange-100')
                                        }`}>
                                        <Text className={`text-[8px] font-black uppercase ${dispute.status === 'RESOLVED' ? 'text-emerald-500' :
                                            dispute.status === 'ESCALATED' ? 'text-rose-500' : 'text-orange-500'
                                            }`}>{dispute.status}</Text>
                                    </View>
                                </View>

                                <Text className={`text-lg font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{dispute.driverName || 'Anonymous User'}</Text>
                                <Text className="text-gray-500 text-xs mb-4 font-medium leading-relaxed">{dispute.reason}</Text>

                                <View className={`flex-row justify-between items-center pt-4 border-t ${isDark ? 'border-slate-800' : 'border-gray-50'}`}>
                                    <View className="flex-row items-center">
                                        <Ionicons name="time" size={12} color="#94A3B8" />
                                        <Text className="text-gray-400 text-[10px] font-bold ml-1">
                                            {new Date(dispute.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>

                                    {dispute.status !== 'RESOLVED' && (
                                        <TouchableOpacity
                                            onPress={() => handleResolve(dispute.id)}
                                            className="bg-emerald-500 px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20"
                                        >
                                            <Text className="text-white font-black text-[10px] uppercase tracking-widest">Resolve</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </Animated.View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
