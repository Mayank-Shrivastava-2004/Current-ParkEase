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

interface Provider {
    id: number;
    name: string;
    ownerName: string;
    email: string;
    phone: string;
    status: 'pending' | 'approved' | 'suspended';
}

const API = BASE_URL;

export default function ProvidersScreen() {
    const router = useRouter();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isDark, setIsDark] = useState(false);

    const loadProviders = async () => {
        setLoading(true);
        try {
            // Load Theme
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
            setFilteredProviders(data);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Unable to fetch data from server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProviders();
    }, []);

    useEffect(() => {
        let filtered = providers;

        // Apply status filter
        if (filter === 'ACTIVE') {
            filtered = filtered.filter(p => p.status === 'approved');
        } else if (filter === 'INACTIVE') {
            filtered = filtered.filter(p => p.status === 'pending');
        } else if (filter === 'SUSPENDED') {
            filtered = filtered.filter(p => p.status === 'suspended');
        }

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(p =>
                (p.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.phone || '').includes(searchQuery)
            );
        }

        setFilteredProviders(filtered);
    }, [filter, searchQuery, providers]);

    const handleAction = (id: number, type: string) => {
        const method = type === 'reject' ? 'DELETE' : 'PUT';
        const label = type.charAt(0).toUpperCase() + type.slice(1);

        Alert.alert(
            `${label} Provider`,
            `Do you want to ${type} this provider?`,
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

                            const res = await fetch(`${API}/api/admin/providers/${id}/${type}`, {
                                method,
                                headers: { Authorization: `Bearer ${token}` },
                            });

                            if (res.ok) {
                                Alert.alert('Success', `Provider ${type}d successfully`);
                                loadProviders();
                            } else {
                                const status = res.status;
                                const rawBody = await res.text();

                                let errorMessage = rawBody;
                                try {
                                    const json = JSON.parse(rawBody);
                                    errorMessage = json.message || json.error || rawBody;
                                } catch (e) {
                                    // Not JSON, use raw
                                }

                                let msg = 'Action failed';
                                if (status === 400) msg = 'Bad Request (400)';
                                if (status === 403) msg = 'Denied (403)';
                                if (status === 500) msg = 'Server Error (500)';

                                throw new Error(`${msg}: ${errorMessage}`);
                            }
                        } catch (err: any) {
                            Alert.alert('Action Error', err.message);
                        }
                    },
                },
            ]
        );
    };

    const activeCount = providers.filter(p => p.status === 'approved').length;
    const inactiveCount = providers.filter(p => p.status === 'pending').length;
    const suspendedCount = providers.filter(p => p.status === 'suspended').length;

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            {/* ?? HEADER */}
            <LinearGradient
                colors={['#4F46E5', '#312E81']}
                className="pt-14 pb-8 px-5 rounded-b-[40px] shadow-2xl"
            >
                <View className="flex-row items-center mb-10">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/20 rounded-2xl justify-center items-center mr-4 border border-white/30"
                    >
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest">Administrator</Text>
                        <Text className="text-white text-3xl font-black tracking-tight">Provider Operations</Text>
                    </View>
                </View>

                {/* STATS CARDS */}
                <View className="flex-row gap-3">
                    <View className="flex-1 bg-white/10 rounded-3xl p-4 border border-white/10 backdrop-blur-md">
                        <Text className="text-3xl font-black text-white">{activeCount}</Text>
                        <Text className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">Active Units</Text>
                    </View>
                    <View className="flex-1 bg-white/10 rounded-3xl p-4 border border-white/10 backdrop-blur-md">
                        <Text className="text-3xl font-black text-white">{inactiveCount}</Text>
                        <Text className="text-orange-400 text-[8px] font-black uppercase tracking-widest">Pending Sync</Text>
                    </View>
                    <View className="flex-1 bg-white/10 rounded-3xl p-4 border border-white/10 backdrop-blur-md">
                        <Text className="text-3xl font-black text-white">{suspendedCount}</Text>
                        <Text className="text-rose-400 text-[8px] font-black uppercase tracking-widest">Suspended</Text>
                    </View>
                </View>

                {/* SEARCH BAR */}
                <View className="mt-8 bg-white/10 rounded-[28px] flex-row items-center px-6 py-4 border border-white/20">
                    <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
                    <TextInput
                        placeholder="Scan identities..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 ml-4 text-white font-black text-xs uppercase tracking-widest"
                    />
                </View>
            </LinearGradient>

            {/* FILTER TABS */}
            <View className={`px-5 py-6 flex-row gap-2 border-b ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                {['ALL', 'ACTIVE', 'INACTIVE', 'SUSPENDED'].map((f) => (
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
                    <Text className="text-indigo-500 mt-6 font-black uppercase tracking-widest text-[10px]">Synchronizing Matrix...</Text>
                </View>
            ) : (
                <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {filteredProviders.length === 0 ? (
                        <View className="items-center mt-20">
                            <Ionicons name="search-outline" size={64} color={isDark ? '#334155' : '#D1D5DB'} />
                            <Text className="text-gray-500 font-bold mt-6 uppercase tracking-widest text-[10px]">No entities located</Text>
                        </View>
                    ) : (
                        filteredProviders.map((p) => (
                            <View key={p.id} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-[32px] p-6 mb-4 border shadow-sm`}>
                                <View className="flex-row items-start justify-between mb-4">
                                    <View className="flex-row items-center flex-1">
                                        <View className={`w-3 h-3 rounded-full mr-3 shadow-sm ${p.status === 'approved' ? 'bg-emerald-500 shadow-emerald-500/50' :
                                            p.status === 'suspended' ? 'bg-rose-500 shadow-rose-500/50' : 'bg-orange-500 shadow-orange-500/50'
                                            }`} />
                                        <View className="flex-1">
                                            <Text className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.ownerName}</Text>
                                            <Text className="text-indigo-400 text-[10px] font-black uppercase mt-0.5">{p.email}</Text>
                                        </View>
                                    </View>
                                    <View className={`px-4 py-1.5 rounded-full ${p.status === 'approved' ? (isDark ? 'bg-emerald-500/10' : 'bg-emerald-100') :
                                        p.status === 'suspended' ? (isDark ? 'bg-rose-500/10' : 'bg-rose-100') : (isDark ? 'bg-orange-500/10' : 'bg-orange-100')
                                        }`}>
                                        <Text className={`text-[8px] font-black uppercase tracking-widest ${p.status === 'approved' ? 'text-emerald-500' :
                                            p.status === 'suspended' ? 'text-rose-500' : 'text-orange-500'
                                            }`}>{p.status}</Text>
                                    </View>
                                </View>

                                <View className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-2xl p-4 mb-5 flex-row items-center`}>
                                    <Ionicons name="call" size={16} color="#6366F1" />
                                    <Text className="text-slate-500 text-[11px] font-black ml-3 uppercase tracking-widest">{p.phone}</Text>
                                </View>

                                {/* ACTION BUTTONS */}
                                <View className="flex-row gap-3">
                                    {p.status === 'pending' && (
                                        <>
                                            <TouchableOpacity
                                                onPress={() => handleAction(p.id, 'approve')}
                                                className="flex-1 bg-emerald-500 py-4 rounded-[20px] items-center shadow-lg shadow-emerald-500/20"
                                            >
                                                <Text className="text-white font-black text-[10px] uppercase tracking-[2px]">Authorize</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleAction(p.id, 'reject')}
                                                className="flex-1 bg-rose-500 py-4 rounded-[20px] items-center shadow-lg shadow-rose-500/20"
                                            >
                                                <Text className="text-white font-black text-[10px] uppercase tracking-[2px]">Reject</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    {p.status === 'approved' && (
                                        <TouchableOpacity
                                            onPress={() => handleAction(p.id, 'suspend')}
                                            className="flex-1 bg-rose-500 py-4 rounded-[20px] items-center shadow-lg shadow-rose-500/20"
                                        >
                                            <Text className="text-white font-black text-[10px] uppercase tracking-[2px]">Suspend Link</Text>
                                        </TouchableOpacity>
                                    )}

                                    {p.status === 'suspended' && (
                                        <TouchableOpacity
                                            onPress={() => handleAction(p.id, 'reactivate')}
                                            className="flex-1 bg-indigo-600 py-4 rounded-[20px] items-center shadow-lg shadow-indigo-600/20"
                                        >
                                            <Text className="text-white font-black text-[10px] uppercase tracking-[2px]">Re-Enable</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}
