import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import BASE_URL from '../../constants/api';

const API = BASE_URL;

export default function ProviderHistoryScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [userName, setUserName] = useState('Provider');
    const [history, setHistory] = useState<any[]>([]);

    const providerGradient: readonly [string, string, ...string[]] = ['#6366F1', '#4338CA'];

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', route: '/(provider)/dashboard' },
        { icon: 'business', label: 'My Spaces', route: '/(provider)/spaces' },
        { icon: 'bar-chart', label: 'Earnings', route: '/(provider)/earnings' },
        { icon: 'car', label: 'Live Traffic', route: '/(provider)/traffic' },
        { icon: 'time', label: 'History', route: '/(provider)/history' },
        { icon: 'flash', label: 'EV Station', route: '/(provider)/ev-station' },
        { icon: 'headset', label: 'Support', route: '/(provider)/support' },
    ];

    const loadHistory = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/provider/history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (err) {
            console.error('History load failed:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const settingsStr = await AsyncStorage.getItem('admin_settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                setIsDark(settings.darkMode ?? false);
            }
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);
            loadHistory();
        };
        init();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadHistory();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/');
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} p-5 mb-4 rounded-3xl border shadow-sm`}>
            <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center">
                    <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                        <Ionicons
                            name="car"
                            size={24}
                            color={isDark ? '#818CF8' : '#6366F1'}
                        />
                    </View>
                    <View>
                        <Text className={`font-black text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.customer || 'Guest User'}</Text>
                        <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{item.vehicleNumber || 'N/A'}</Text>
                    </View>
                </View>
                <View className={`px-3 py-1 rounded-full ${item.status === 'completed' ? (isDark ? 'bg-emerald-500/20' : 'bg-emerald-100') : (isDark ? 'bg-amber-500/20' : 'bg-amber-100')}`}>
                    <Text className={`text-[8px] font-black uppercase ${item.status === 'completed' ? 'text-emerald-500' : 'text-amber-600'}`}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View className={`h-[1px] w-full mb-4 ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`} />

            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">Date Time</Text>
                    <Text className={`font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{item.date}</Text>
                </View>
                <View>
                    <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">Slot</Text>
                    <Text className={`font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{item.slot}</Text>
                </View>
                <View>
                    <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">Duration</Text>
                    <Text className={`font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{item.duration}</Text>
                </View>
                <View className="items-end">
                    <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">Total</Text>
                    <Text className={`font-black text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>?{item.amount}</Text>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Booking History"
                subtitle="Past Transactions"
                role="provider"
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
                userStatus="History Archive"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={providerGradient}
                dark={isDark}
            />

            <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
                }
                ListEmptyComponent={
                    <View className="items-center justify-center py-20">
                        <Ionicons name="documents-outline" size={48} color={isDark ? '#334155' : '#CBD5E1'} />
                        <Text className="text-gray-400 font-bold mt-4">No history records found</Text>
                    </View>
                }
            />
        </View>
    );
}
