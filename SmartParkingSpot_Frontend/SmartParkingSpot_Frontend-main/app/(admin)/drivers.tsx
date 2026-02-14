import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
    Modal,
    Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../constants/api';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import Animated, { FadeInUp, FadeInRight, FadeIn } from 'react-native-reanimated';

interface Driver {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'suspended' | 'pending';
    vehicleNumber?: string;
    vehicleType?: string;
    approved: boolean;
    licenseNumber?: string;
    address?: string;
}

const API = BASE_URL;

export default function AdminDriversScreen() {
    const router = useRouter();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE'>('ALL');
    const { filter: initialFilter } = useLocalSearchParams();
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const adminGradient: readonly [string, string, ...string[]] = ['#4F46E5', '#312E81'];

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

    const loadDrivers = async () => {
        try {
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
        if (initialFilter) {
            setFilter(initialFilter.toString().toUpperCase() as any);
        }
    }, [initialFilter]);

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
                            if (selectedDriver?.id === id) {
                                setModalVisible(false);
                            }
                            loadDrivers();
                        } catch (err) {
                            Alert.alert('Error', 'Protocol update failed');
                        }
                    },
                },
            ]
        );
    };

    const handleApproveDriver = async (id: number) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/admin/drivers/${id}/approve`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Approval failed');
            Alert.alert('Success', 'Driver verified and activated.');
            if (selectedDriver?.id === id) {
                setModalVisible(false);
            }
            loadDrivers();
        } catch (err) {
            Alert.alert('Error', 'Verification failed');
        }
    };

    const handleRejectDriver = async (id: number) => {
        Alert.alert(
            'Reject Application',
            'Are you sure you want to reject this driver? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token');
                            const res = await fetch(`${API}/api/admin/drivers/${id}/reject`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            if (!res.ok) throw new Error('Rejection failed');
                            Alert.alert('Success', 'Application rejected.');
                            setModalVisible(false);
                            loadDrivers();
                        } catch (err) {
                            Alert.alert('Error', 'Action failed');
                        }
                    }
                }
            ]
        );
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    const filteredDrivers = (drivers || []).filter(d => {
        const nameMatch = (d.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const emailMatch = (d.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const searchMatch = nameMatch || emailMatch;

        if (filter === 'PENDING') return searchMatch && d.status === 'pending';
        if (filter === 'ACTIVE') return searchMatch && d.status === 'active';
        return searchMatch;
    });

    const activeCount = drivers.filter(d => d.status === 'active').length;
    const pendingCount = drivers.filter(d => d.status === 'pending').length;

    const openDetails = (driver: Driver) => {
        setSelectedDriver(driver);
        setModalVisible(true);
    };

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
                title="Driver Management"
                subtitle="Fleet Control Center"
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
                {/* FILTER TABS */}
                <View className="px-5 mt-6 flex-row gap-2">
                    {[
                        { id: 'ALL', label: 'All Units', count: drivers.length },
                        { id: 'PENDING', label: 'Pending', count: pendingCount, color: 'text-orange-500' },
                        { id: 'ACTIVE', label: 'Active', count: activeCount, color: 'text-emerald-500' }
                    ].map((t) => (
                        <TouchableOpacity
                            key={t.id}
                            onPress={() => setFilter(t.id as any)}
                            className={`flex-1 py-3 rounded-2xl items-center border ${filter === t.id ? (isDark ? 'bg-indigo-600 border-indigo-500' : 'bg-gray-900 border-gray-900') : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100')}`}
                        >
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${filter === t.id ? 'text-white' : 'text-gray-400'}`}>{t.label}</Text>
                            <Text className={`text-base font-black ${filter === t.id ? 'text-white/80' : (t.color || 'text-gray-500')}`}>{t.count}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* SEARCH BAR */}
                <View className="px-5 mt-8">
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
                    <Text className={`font-black text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Fleet Directory</Text>

                    {filteredDrivers.length === 0 ? (
                        <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-3xl p-10 items-center border border-dashed`}>
                            <Ionicons name="people-outline" size={48} color={isDark ? '#334155' : '#D1D5DB'} />
                            <Text className="text-gray-500 mt-4 font-bold text-center">No operators matching current filters</Text>
                        </View>
                    ) : (
                        filteredDrivers.map((driver, index) => (
                            <Animated.View
                                key={driver.id}
                                entering={FadeInRight.delay(index * 100)}
                                className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-50'} rounded-[32px] p-6 mb-4 shadow-sm border`}
                            >
                                <TouchableOpacity onPress={() => openDetails(driver)}>
                                    <View className="flex-row justify-between items-start mb-4">
                                        <View className="flex-1">
                                            <Text className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{driver.name}</Text>
                                            <Text className="text-indigo-400 text-xs font-bold uppercase tracking-widest">{driver.email}</Text>
                                        </View>
                                        <View className={`px-4 py-1.5 rounded-full ${driver.status === 'active' ? (isDark ? 'bg-emerald-500/10' : 'bg-emerald-100') : (driver.status === 'pending' ? (isDark ? 'bg-orange-500/10' : 'bg-orange-100') : (isDark ? 'bg-rose-500/10' : 'bg-rose-100'))}`}>
                                            <Text className={`text-[9px] font-black uppercase ${driver.status === 'active' ? 'text-emerald-500' : (driver.status === 'pending' ? 'text-orange-500' : 'text-rose-500')}`}>
                                                {driver.status}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className={`flex-row items-center p-4 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-gray-50/50'}`}>
                                        <View className="flex-1 flex-row items-center">
                                            <Ionicons name="call" size={16} color="#6366F1" />
                                            <Text className={`ml-2 font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{driver.phone}</Text>
                                        </View>
                                        <View className="flex-1 flex-row items-center justify-end">
                                            <Ionicons name="car" size={16} color="#6366F1" />
                                            <Text className={`ml-2 font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{driver.vehicleNumber || 'N/A'}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                <View className="flex-row gap-3 mt-4">
                                    <TouchableOpacity
                                        onPress={() => openDetails(driver)}
                                        className={`flex-1 py-4 rounded-2xl items-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200'}`}
                                    >
                                        <Text className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Review Credentials</Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* DETAILED VIEW MODAL */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/60">
                    <Animated.View entering={FadeInUp} className={`${isDark ? 'bg-slate-900' : 'bg-white'} rounded-t-[40px] p-8 max-h-[90%]`}>
                        <View className="flex-row justify-between items-center mb-8">
                            <Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Operator Identity</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}>
                                <Ionicons name="close" size={24} color={isDark ? 'white' : 'black'} />
                            </TouchableOpacity>
                        </View>

                        {selectedDriver && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="items-center mb-8">
                                    <View className={`w-24 h-24 rounded-[32px] items-center justify-center mb-4 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                                        <Ionicons name="person" size={48} color="#6366F1" />
                                    </View>
                                    <Text className={`text-xl font-black ${isDark ? 'text-white' : 'text-black'}`}>{selectedDriver.name}</Text>
                                    <Text className="text-indigo-500 font-bold">{selectedDriver.email}</Text>
                                </View>

                                <View className="gap-4">
                                    <View className={`p-5 rounded-3xl ${isDark ? 'bg-slate-800' : 'bg-gray-50'}`}>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Vehicle Specifications</Text>
                                        <View className="flex-row justify-between mb-2">
                                            <Text className="text-gray-500 font-bold">Plate Number</Text>
                                            <Text className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedDriver.vehicleNumber || 'Pending verification'}</Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-500 font-bold">Model Type</Text>
                                            <Text className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedDriver.vehicleType || 'Not specified'}</Text>
                                        </View>
                                    </View>

                                    <View className={`p-5 rounded-3xl ${isDark ? 'bg-slate-800' : 'bg-gray-50'}`}>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Contact Information</Text>
                                        <View className="flex-row justify-between mb-2">
                                            <Text className="text-gray-500 font-bold">Phone</Text>
                                            <Text className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedDriver.phone}</Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-500 font-bold">System Status</Text>
                                            <Text className={`font-black uppercase text-[10px] ${selectedDriver.status === 'active' ? 'text-emerald-500' : 'text-orange-500'}`}>{selectedDriver.status}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="flex-row gap-4 mt-10 mb-8">
                                    {selectedDriver.status === 'pending' ? (
                                        <>
                                            <TouchableOpacity
                                                onPress={() => handleApproveDriver(selectedDriver.id)}
                                                className="flex-1 py-5 bg-emerald-500 rounded-3xl items-center shadow-lg shadow-emerald-500/30"
                                            >
                                                <Text className="text-white font-black uppercase tracking-widest text-xs">Verify & Approve</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleRejectDriver(selectedDriver.id)}
                                                className="flex-1 py-5 bg-rose-500 rounded-3xl items-center shadow-lg shadow-rose-500/30"
                                            >
                                                <Text className="text-white font-black uppercase tracking-widest text-xs">Reject</Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => handleToggleStatus(selectedDriver.id, selectedDriver.status)}
                                            className={`flex-1 py-5 rounded-3xl items-center shadow-lg ${selectedDriver.status === 'active' ? 'bg-rose-500 shadow-rose-500/30' : 'bg-indigo-600 shadow-indigo-600/30'}`}
                                        >
                                            <Text className="text-white font-black uppercase tracking-widest text-xs">
                                                {selectedDriver.status === 'active' ? 'Suspend Access' : 'Restore Access'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </ScrollView>
                        )}
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
