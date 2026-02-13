import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../constants/api';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface Driver {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'suspended';
    approved: boolean;
    vehicleNumber: string;
    vehicleType: string;
}

const API = BASE_URL;

export default function DriverApprovalScreen() {
    const router = useRouter();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING');
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
        setLoading(true);
        try {
            // Load Theme
            const settingsStr = await AsyncStorage.getItem('admin_settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                setIsDark(settings.darkMode ?? false);
            }

            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/admin/drivers`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Failed to load drivers');
            const data = await res.json();
            setDrivers(data);
            setFilteredDrivers(data.filter((d: Driver) => !d.approved)); // Default show pending
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Unable to fetch data from server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDrivers();
    }, []);

    useEffect(() => {
        let filtered = drivers;

        // Apply status filter
        if (filter === 'PENDING') {
            filtered = filtered.filter(d => !d.approved);
        } else if (filter === 'APPROVED') {
            filtered = filtered.filter(d => d.approved);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(d =>
                (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (d.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (d.phone || '').includes(searchQuery)
            );
        }

        setFilteredDrivers(filtered);
    }, [filter, searchQuery, drivers]);

    const handleAction = (id: number, type: 'approve' | 'reject') => {
        const method = type === 'reject' ? 'DELETE' : 'PUT';
        const label = type.charAt(0).toUpperCase() + type.slice(1);

        Alert.alert(
            `${label} Driver`,
            `Do you want to ${type} this driver application?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: label,
                    style: type === 'reject' ? 'destructive' : 'default',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token');
                            if (!token) {
                                Alert.alert('Error', 'Session expired. Please login again.');
                                return;
                            }

                            const res = await fetch(`${API}/api/admin/drivers/${id}/${type}`, {
                                method,
                                headers: { Authorization: `Bearer ${token}` },
                            });

                            if (res.ok) {
                                Alert.alert('Success', `Driver ${type}d successfully`);
                                loadDrivers();
                            } else {
                                throw new Error('Action failed');
                            }
                        } catch (err: any) {
                            Alert.alert('Action Error', err.message);
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

    const pendingCount = drivers.filter(d => !d.approved).length;
    const approvedCount = drivers.filter(d => d.approved).length;

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Driver Approvals"
                subtitle="Verification Center"
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
                userStatus="Verification Online"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={adminGradient}
                dark={isDark}
            />

            <LinearGradient
                colors={['#4F46E5', '#312E81']}
                className="pt-6 pb-8 px-5 rounded-b-[40px] shadow-2xl"
            >
                <View className="flex-row gap-3">
                    <View className="flex-1 bg-white/10 rounded-3xl p-4 border border-white/10 backdrop-blur-md">
                        <Text className="text-3xl font-black text-white">{pendingCount}</Text>
                        <Text className="text-orange-400 text-[8px] font-black uppercase tracking-widest">Pending Approval</Text>
                    </View>
                    <View className="flex-1 bg-white/10 rounded-3xl p-4 border border-white/10 backdrop-blur-md">
                        <Text className="text-3xl font-black text-white">{approvedCount}</Text>
                        <Text className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">Total Approved</Text>
                    </View>
                </View>

                <View className="mt-8 bg-white/10 rounded-[28px] flex-row items-center px-6 py-4 border border-white/20">
                    <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
                    <TextInput
                        placeholder="Search drivers..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 ml-4 text-white font-black text-xs uppercase tracking-widest"
                    />
                </View>
            </LinearGradient>

            <View className={`px-5 py-6 flex-row gap-2 border-b ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                {['PENDING', 'APPROVED', 'ALL'].map((f) => (
                    <TouchableOpacity
                        key={f}
                        onPress={() => setFilter(f as any)}
                        className={`px-5 py-2.5 rounded-2xl ${filter === f ? (isDark ? 'bg-indigo-600 shadow-md shadow-indigo-600/20' : 'bg-gray-800') : (isDark ? 'bg-slate-800' : 'bg-gray-100')}`}
                    >
                        <Text className={`text-[10px] font-black uppercase tracking-widest ${filter === f ? 'text-white' : 'text-slate-400'}`}>
                            {f}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text className="text-indigo-500 mt-6 font-black uppercase tracking-widest text-[10px]">Fetching Applications...</Text>
                </View>
            ) : (
                <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {filteredDrivers.length === 0 ? (
                        <View className="items-center mt-20">
                            <Ionicons name="mail-open-outline" size={64} color={isDark ? '#334155' : '#D1D5DB'} />
                            <Text className="text-gray-500 font-bold mt-6 uppercase tracking-widest text-[10px]">No pending applications</Text>
                        </View>
                    ) : (
                        filteredDrivers.map((d, index) => (
                            <Animated.View
                                key={d.id}
                                entering={FadeInUp.delay(index * 100)}
                                className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-[32px] p-6 mb-4 border shadow-sm`}
                            >
                                <View className="flex-row items-start justify-between mb-4">
                                    <View className="flex-1">
                                        <Text className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{d.name}</Text>
                                        <Text className="text-indigo-400 text-[10px] font-black uppercase mt-0.5">{d.email}</Text>
                                    </View>
                                    <View className={`px-4 py-1.5 rounded-full ${d.approved ? (isDark ? 'bg-emerald-500/10' : 'bg-emerald-100') : (isDark ? 'bg-orange-500/10' : 'bg-orange-100')}`}>
                                        <Text className={`text-[8px] font-black uppercase tracking-widest ${d.approved ? 'text-emerald-500' : 'text-orange-500'}`}>
                                            {d.approved ? 'Approved' : 'Pending'}
                                        </Text>
                                    </View>
                                </View>

                                <View className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-2xl p-4 mb-5`}>
                                    <View className="flex-row items-center mb-2">
                                        <Ionicons name="call" size={14} color="#6366F1" />
                                        <Text className="text-slate-500 text-[10px] font-black ml-2 uppercase tracking-widest">{d.phone}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Ionicons name="car" size={14} color="#6366F1" />
                                        <Text className="text-slate-500 text-[10px] font-black ml-2 uppercase tracking-widest">
                                            {d.vehicleNumber} | {d.vehicleType}
                                        </Text>
                                    </View>
                                </View>

                                {!d.approved && (
                                    <View className="flex-row gap-3">
                                        <TouchableOpacity
                                            onPress={() => handleAction(d.id, 'approve')}
                                            className="flex-1 bg-emerald-500 py-4 rounded-[20px] items-center shadow-lg shadow-emerald-500/20"
                                        >
                                            <Text className="text-white font-black text-[10px] uppercase tracking-[2px]">Approve</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleAction(d.id, 'reject')}
                                            className="flex-1 bg-rose-500 py-4 rounded-[20px] items-center shadow-lg shadow-rose-500/20"
                                        >
                                            <Text className="text-white font-black text-[10px] uppercase tracking-[2px]">Reject</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </Animated.View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}
