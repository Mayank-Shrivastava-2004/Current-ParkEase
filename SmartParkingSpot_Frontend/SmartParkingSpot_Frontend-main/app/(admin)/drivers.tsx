import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../constants/api';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

interface Driver {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string; // active | suspended
    vehicleNumber?: string;
    vehicleType?: string;
}

const API = BASE_URL;

export default function AdminDriversScreen() {
    const router = useRouter();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const adminGradient: readonly [string, string, ...string[]] = ['#4F46E5', '#312E81'];

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', route: '/(admin)/dashboard' },
        { icon: 'people', label: 'Manage Drivers', route: '/(admin)/drivers' },
        { icon: 'checkmark-circle', label: 'Driver Approvals', route: '/(admin)/driver-approval' },
        { icon: 'business', label: 'Manage Providers', route: '/(admin)/providers' },
        { icon: 'alert-circle', label: 'Disputes', route: '/(admin)/disputes' },
        { icon: 'bar-chart', label: 'Analytics', route: '/(admin)/analytics' },
        { icon: 'person-circle', label: 'Account Profile', route: '/(admin)/profile' },
        { icon: 'settings', label: 'Settings', route: '/(admin)/settings' },
    ];

    const loadDrivers = async () => {
        try {
            // Load Theme
            const settingsStr = await AsyncStorage.getItem('admin_settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                setIsDark(settings.darkMode ?? false);
            }

            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/admin/drivers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to load drivers');
            const data = await res.json();
            setDrivers(data);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Unable to load drivers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDrivers();
    }, []);

    const handleToggleStatus = async (id: number, currentStatus: string) => {
        const isCurrentlyActive = currentStatus === 'active';
        const action = isCurrentlyActive ? 'suspend' : 'reactivate';
        const actionLabel = isCurrentlyActive ? 'Suspend' : 'Reactivate';

        Alert.alert(
            `${actionLabel} Driver`,
            `Modify system access for this operator?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: actionLabel,
                    style: isCurrentlyActive ? 'destructive' : 'default',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token');
                            const res = await fetch(`${API}/api/admin/drivers/${id}/${action}`, {
                                method: 'PUT',
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            if (!res.ok) throw new Error('Action failed');
                            Alert.alert('Success', `Driver protocol updated.`);
                            loadDrivers();
                        } catch (err) {
                            Alert.alert('Error', 'Protocol update failed');
                        }
                    },
                },
            ]
        );
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    // FIX: Added safer filtering logic with fallback for name and email
    const filteredDrivers = (drivers || []).filter(d => {
        const nameMatch = (d.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const emailMatch = (d.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || emailMatch;
    });

    const activeCount = drivers.filter(d => d.status === 'active').length;
    const suspendedCount = drivers.length - activeCount;

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="mt-4 text-indigo-500 font-bold uppercase tracking-widest text-xs">Syncing Fleet...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Manage Drivers"
                subtitle="Fleet Command"
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
                {/* QUICK STATS */}
                <View className="px-5 mt-6">
                    <Text className={`font-black text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Fleet Overview</Text>
                    <Animated.View entering={FadeInUp.delay(100)} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-indigo-50'} rounded-[32px] p-6 shadow-2xl shadow-indigo-900/10 flex-row gap-4 border`}>
                        <View className={`${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'} flex-1 rounded-2xl p-4 items-center border`}>
                            <Text className="text-emerald-500 text-3xl font-black">{activeCount}</Text>
                            <Text className="text-emerald-400 text-[10px] font-bold uppercase">Active</Text>
                        </View>
                        <View className={`${isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-100'} flex-1 rounded-2xl p-4 items-center border`}>
                            <Text className="text-rose-500 text-3xl font-black">{suspendedCount}</Text>
                            <Text className="text-rose-400 text-[10px] font-bold uppercase">Suspended</Text>
                        </View>
                    </Animated.View>
                </View>

                {/* SEARCH BAR */}
                <View className="px-5 mt-8">
                    <Text className={`font-black text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Operator Verification</Text>
                    <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-[24px] px-5 py-4 flex-row items-center border shadow-sm`}>
                        <Ionicons name="search" size={20} color="#6366F1" />
                        <TextInput
                            placeholder="Search by name or email..."
                            placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            className={`flex-1 ml-3 font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}
                        />
                    </View>
                </View>

                {/* DRIVER LIST */}
                <View className="px-5 mt-10">
                    <Text className={`font-black text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Operator Directory</Text>

                    {filteredDrivers.length === 0 ? (
                        <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-3xl p-10 items-center border border-dashed`}>
                            <Ionicons name="people-outline" size={48} color={isDark ? '#334155' : '#D1D5DB'} />
                            <Text className="text-gray-500 mt-4 font-bold text-center">No operators matching that identification</Text>
                        </View>
                    ) : (
                        filteredDrivers.map((driver, index) => (
                            <Animated.View
                                key={driver.id}
                                entering={FadeInRight.delay(index * 100)}
                                className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-50'} rounded-[32px] p-6 mb-4 shadow-sm border`}
                            >
                                <View className="flex-row justify-between items-start mb-4">
                                    <View className="flex-1">
                                        <Text className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{driver.name}</Text>
                                        <Text className="text-indigo-400 text-xs font-bold uppercase tracking-widest">{driver.email}</Text>
                                    </View>
                                    <View className={`px-4 py-1.5 rounded-full ${driver.status === 'active' ? (isDark ? 'bg-emerald-500/10' : 'bg-emerald-100') : (isDark ? 'bg-rose-500/10' : 'bg-rose-100')}`}>
                                        <Text className={`text-[9px] font-black uppercase ${driver.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {driver.status === 'active' ? 'Live' : 'offline'}
                                        </Text>
                                    </View>
                                </View>

                                <View className={`flex-row items-center mb-6 p-4 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-gray-50/50'}`}>
                                    <View className="flex-1 flex-row items-center">
                                        <View className={`w-10 h-10 rounded-xl items-center justify-center shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                                            <Ionicons name="call" size={18} color="#6366F1" />
                                        </View>
                                        <View className="ml-3">
                                            <Text className="text-gray-500 text-[8px] font-black uppercase">Direct Line</Text>
                                            <Text className={`font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{driver.phone}</Text>
                                        </View>
                                    </View>

                                    <View className={`w-[1px] h-8 ${isDark ? 'bg-slate-700' : 'bg-gray-200'} mx-2`} />

                                    <View className="flex-1 flex-row items-center justify-end">
                                        <View className="mr-3 items-end">
                                            <Text className="text-gray-500 text-[8px] font-black uppercase">Vehicle</Text>
                                            <Text className={`font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'} text-xs`}>{driver.vehicleNumber || 'N/A'}</Text>
                                            <Text className="text-indigo-400 text-[9px] font-bold">{driver.vehicleType || 'Unknown'}</Text>
                                        </View>
                                        <View className={`w-10 h-10 rounded-xl items-center justify-center shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                                            <Ionicons name="car" size={18} color="#6366F1" />
                                        </View>
                                    </View>
                                </View>

                                <View className="flex-row gap-3">
                                    <TouchableOpacity
                                        onPress={() => handleToggleStatus(driver.id, driver.status)}
                                        className={`flex-1 py-4 rounded-2xl items-center shadow-sm ${driver.status === 'active' ? 'bg-rose-500' : 'bg-indigo-600'}`}
                                    >
                                        <Text className="text-white font-black text-xs uppercase tracking-widest">
                                            {driver.status === 'active' ? 'Suspend Access' : 'Restore Access'}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => Alert.alert('Operator Log', 'Total Bookings: 156\nCustomer Rating: 4.8?\nRevenue Share: ?12,450')}
                                        className={`w-14 rounded-2xl items-center justify-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200'}`}
                                    >
                                        <Ionicons name="bar-chart" size={20} color={isDark ? '#94A3B8' : '#4B5563'} />
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
