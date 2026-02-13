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
    RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../constants/api';
import UnifiedHeader from '../../components/UnifiedHeader';
import Animated, { FadeInUp } from 'react-native-reanimated';

const API = BASE_URL;

export default function DriverNotificationsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Load Theme
            const settingsStr = await AsyncStorage.getItem('admin_settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                setIsDark(settings.darkMode ?? false);
            }

            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error('Notifications load failed:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const markAsRead = async (id: number) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            }
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    if (loading && !refreshing) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-blue-600 font-bold uppercase tracking-widest text-xs">Fetching Alerts...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Notifications"
                subtitle="System Alerts"
                role="driver"
                gradientColors={['#3B82F6', '#1D4ED8']}
                onMenuPress={() => router.back()}
                userName="Driver"
                showBackButton={true}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
                }
            >
                <View className="flex-row items-center justify-between mt-6 mb-4 px-2">
                    <Text className={`font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Inbox</Text>
                    {notifications.some(n => !n.read) && (
                        <View className="bg-blue-600 px-3 py-1 rounded-full">
                            <Text className="text-white text-[10px] font-black uppercase">New</Text>
                        </View>
                    )}
                </View>

                {notifications.length === 0 ? (
                    <View className="items-center py-20">
                        <View className={`w-20 h-20 ${isDark ? 'bg-slate-900' : 'bg-gray-100'} rounded-full items-center justify-center mb-6`}>
                            <Ionicons name="notifications-off-outline" size={40} color={isDark ? '#475569' : '#CBD5E1'} />
                        </View>
                        <Text className="text-gray-400 font-bold uppercase tracking-widest text-xs">All clear! No alerts.</Text>
                    </View>
                ) : (
                    notifications.map((notif, index) => (
                        <Animated.View
                            key={notif.id}
                            entering={FadeInUp.delay(index * 100)}
                            className={`${isDark ? (notif.read ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-900 border-blue-500/30') : (notif.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100')} rounded-[32px] p-6 mb-4 border flex-row items-center shadow-sm`}
                        >
                            <TouchableOpacity
                                onPress={() => markAsRead(notif.id)}
                                className={`w-12 h-12 ${notif.read ? (isDark ? 'bg-slate-800' : 'bg-gray-50') : 'bg-blue-600'} rounded-2xl items-center justify-center mr-5`}
                            >
                                <Ionicons
                                    name={notif.type === 'SUCCESS' ? 'checkmark-circle' : notif.type === 'ERROR' ? 'alert-circle' : 'notifications'}
                                    size={24}
                                    color={notif.read ? (isDark ? '#475569' : '#CBD5E1') : 'white'}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1" onPress={() => markAsRead(notif.id)}>
                                <Text className={`font-black ${isDark ? 'text-white' : 'text-gray-900'} text-lg tracking-tight`}>{notif.title}</Text>
                                <Text className={`${isDark ? 'text-slate-400' : 'text-gray-500'} text-xs mt-1 leading-relaxed`}>{notif.message}</Text>
                                <Text className="text-blue-500 text-[10px] font-bold uppercase tracking-widest mt-3">
                                    {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
