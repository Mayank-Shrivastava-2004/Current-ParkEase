import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
    Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../constants/api';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

interface Provider {
    id: number;
    ownerName: string;
    email: string;
    phone: string;
    status: 'pending' | 'approved' | 'suspended';
    parkingAreaName?: string;
    location?: string;
    totalSlots?: number;
}

const API = BASE_URL;

export default function ProvidersScreen() {
    const router = useRouter();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isDark, setIsDark] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { filter: initialFilter } = useLocalSearchParams();
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
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

    const loadProviders = async () => {
        setLoading(true);
        try {
            const settingsStr = await AsyncStorage.getItem('admin_settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                setIsDark(settings.darkMode ?? false);
            }

            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/admin/providers`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Failed to load providers');
            const data = await res.json();
            setProviders(data);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Unable to fetch data from server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProviders();
        if (initialFilter) {
            setFilter(initialFilter.toString().toUpperCase() as any);
        }
    }, [initialFilter]);

    const filteredProviders = (providers || []).filter(p => {
        const searchMatch = (p.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.phone || '').includes(searchQuery);

        if (filter === 'PENDING') return searchMatch && p.status === 'pending';
        if (filter === 'ACTIVE') return searchMatch && p.status === 'approved';
        return searchMatch;
    });

    const handleAction = async (id: number, type: string) => {
        const method = type === 'reject' ? 'DELETE' : 'PUT';
        const label = type.charAt(0).toUpperCase() + type.slice(1);

        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/admin/providers/${id}/${type}`, {
                method,
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                Alert.alert('Success', `Provider ${type}d successfully`);
                setModalVisible(false);
                loadProviders();
            } else {
                throw new Error('Action failed');
            }
        } catch (err: any) {
            Alert.alert('Action Error', err.message);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    const openDetails = (provider: Provider) => {
        setSelectedProvider(provider);
        setModalVisible(true);
    };

    const activeCount = providers.filter(p => p.status === 'approved').length;
    const pendingCount = providers.filter(p => p.status === 'pending').length;

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="mt-4 text-indigo-500 font-bold uppercase tracking-widest text-[10px]">Syncing Matrix...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Provider Management"
                subtitle="Operations Center"
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
                        { id: 'ALL', label: 'All Units', count: providers.length },
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
                            placeholder="Scan identities..."
                            placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            className={`flex-1 ml-3 font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}
                        />
                    </View>
                </View>

                {/* PROVIDER LIST */}
                <View className="px-5 mt-10">
                    <Text className={`font-black text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Provider Directory</Text>

                    {filteredProviders.length === 0 ? (
                        <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-3xl p-10 items-center border border-dashed`}>
                            <Ionicons name="business-outline" size={48} color={isDark ? '#334155' : '#D1D5DB'} />
                            <Text className="text-gray-500 mt-4 font-bold text-center">No entities matching current filters</Text>
                        </View>
                    ) : (
                        filteredProviders.map((p, index) => (
                            <Animated.View
                                key={p.id}
                                entering={FadeInRight.delay(index * 100)}
                                className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-50'} rounded-[32px] p-6 mb-4 shadow-sm border`}
                            >
                                <TouchableOpacity onPress={() => openDetails(p)}>
                                    <View className="flex-row justify-between items-start mb-4">
                                        <View className="flex-1">
                                            <Text className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.ownerName}</Text>
                                            <Text className="text-indigo-400 text-xs font-bold uppercase tracking-widest">{p.email}</Text>
                                        </View>
                                        <View className={`px-4 py-1.5 rounded-full ${p.status === 'approved' ? (isDark ? 'bg-emerald-500/10' : 'bg-emerald-100') : (p.status === 'pending' ? (isDark ? 'bg-orange-500/10' : 'bg-orange-100') : (isDark ? 'bg-rose-500/10' : 'bg-rose-100'))}`}>
                                            <Text className={`text-[9px] font-black uppercase ${p.status === 'approved' ? 'text-emerald-500' : (p.status === 'pending' ? 'text-orange-500' : 'text-rose-500')}`}>
                                                {p.status}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className={`flex-row items-center p-4 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-gray-50/50'}`}>
                                        <View className="flex-1 flex-row items-center">
                                            <Ionicons name="call" size={16} color="#6366F1" />
                                            <Text className={`ml-2 font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{p.phone}</Text>
                                        </View>
                                        <View className="flex-1 flex-row items-center justify-end">
                                            <Ionicons name="location" size={16} color="#6366F1" />
                                            <Text className={`ml-2 font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'} text-xs`} numberOfLines={1}>{p.location || 'N/A'}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                <View className="flex-row gap-3 mt-4">
                                    <TouchableOpacity
                                        onPress={() => openDetails(p)}
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
                            <Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Provider Profile</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}>
                                <Ionicons name="close" size={24} color={isDark ? 'white' : 'black'} />
                            </TouchableOpacity>
                        </View>

                        {selectedProvider && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="items-center mb-8">
                                    <View className={`w-24 h-24 rounded-[32px] items-center justify-center mb-4 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                                        <Ionicons name="business" size={48} color="#6366F1" />
                                    </View>
                                    <Text className={`text-xl font-black ${isDark ? 'text-white' : 'text-black'}`}>{selectedProvider.ownerName}</Text>
                                    <Text className="text-indigo-500 font-bold">{selectedProvider.email}</Text>
                                </View>

                                <View className="gap-4">
                                    <View className={`p-5 rounded-3xl ${isDark ? 'bg-slate-800' : 'bg-gray-50'}`}>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Hub Specifications</Text>
                                        <View className="flex-row justify-between mb-2">
                                            <Text className="text-gray-500 font-bold">Area Name</Text>
                                            <Text className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedProvider.parkingAreaName || 'N/A'}</Text>
                                        </View>
                                        <View className="flex-row justify-between mb-2">
                                            <Text className="text-gray-500 font-bold">Location</Text>
                                            <Text className={`font-black ${isDark ? 'text-white' : 'text-gray-900'} text-xs`} numberOfLines={1}>{selectedProvider.location || 'N/A'}</Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-500 font-bold">Capacity</Text>
                                            <Text className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedProvider.totalSlots || 0} Slots</Text>
                                        </View>
                                    </View>

                                    <View className={`p-5 rounded-3xl ${isDark ? 'bg-slate-800' : 'bg-gray-50'}`}>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Connect Details</Text>
                                        <View className="flex-row justify-between mb-2">
                                            <Text className="text-gray-500 font-bold">Direct Line</Text>
                                            <Text className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedProvider.phone}</Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-500 font-bold">Status</Text>
                                            <Text className={`font-black uppercase text-[10px] ${selectedProvider.status === 'approved' ? 'text-emerald-500' : 'text-orange-500'}`}>{selectedProvider.status}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="flex-row gap-4 mt-10 mb-8">
                                    {selectedProvider.status === 'pending' ? (
                                        <>
                                            <TouchableOpacity
                                                onPress={() => handleAction(selectedProvider.id, 'approve')}
                                                className="flex-1 py-5 bg-emerald-500 rounded-3xl items-center shadow-lg shadow-emerald-500/30"
                                            >
                                                <Text className="text-white font-black uppercase tracking-widest text-xs">Authorize</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleAction(selectedProvider.id, 'reject')}
                                                className="flex-1 py-5 bg-rose-500 rounded-3xl items-center shadow-lg shadow-rose-500/30"
                                            >
                                                <Text className="text-white font-black uppercase tracking-widest text-xs">Reject</Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => handleAction(selectedProvider.id, selectedProvider.status === 'approved' ? 'suspend' : 'reactivate')}
                                            className={`flex-1 py-5 rounded-3xl items-center shadow-lg ${selectedProvider.status === 'approved' ? 'bg-rose-500 shadow-rose-500/30' : 'bg-indigo-600 shadow-indigo-600/30'}`}
                                        >
                                            <Text className="text-white font-black uppercase tracking-widest text-xs">
                                                {selectedProvider.status === 'approved' ? 'Suspend Link' : 'Re-Enable'}
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
