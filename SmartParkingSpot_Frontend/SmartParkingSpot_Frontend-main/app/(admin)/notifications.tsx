import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import Animated, { FadeInUp } from 'react-native-reanimated';
import BASE_URL from '../../constants/api';

interface Notification {
    id: number;
    message: string;
    type: string;
    refId: number;
    read: boolean;
    createdAt: string;
}

export default function AdminNotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [isDark, setIsDark] = useState(false);

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

    const loadTheme = async () => {
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

    const fetchNotifications = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                router.replace('/' as any);
                return;
            }

            const res = await fetch(`${BASE_URL}/api/admin/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setNotifications(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [router]);

    useEffect(() => {
        loadTheme();
        fetchNotifications();
    }, [fetchNotifications]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const markAsRead = async (id: number) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/api/admin/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            }
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const handleNotificationPress = async (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }

        // Deep linking logic
        if (notification.type === 'PROVIDER_REGISTRATION') {
            router.push('/(admin)/providers');
        } else if (notification.type === 'DRIVER_REGISTRATION') {
            router.push('/(admin)/drivers');
        } else if (notification.type === 'DISPUTE_RAISED') {
            router.push('/(admin)/disputes');
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    const renderItem = ({ item, index }: { item: Notification, index: number }) => (
        <Animated.View entering={FadeInUp.delay(index * 50)}>
            <TouchableOpacity
                onPress={() => handleNotificationPress(item)}
                className={`${isDark ? (item.read ? 'bg-slate-900/50' : 'bg-slate-800') : (item.read ? 'bg-gray-50' : 'bg-white')} rounded-3xl p-6 mb-4 flex-row items-center border ${isDark ? 'border-slate-800' : 'border-gray-100'} shadow-sm`}
            >
                <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                    <Ionicons
                        name={
                            item.type?.includes('PROVIDER') ? 'business' :
                                item.type?.includes('DRIVER') ? 'car' :
                                    item.type?.includes('DISPUTE') ? 'alert-circle' : 'notifications'
                        }
                        size={22}
                        color="#6366F1"
                    />
                </View>

                <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                        <Text className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            {item.type || 'SYSTEM'}
                        </Text>
                        <Text className="text-gray-400 text-[8px] font-bold">
                            {new Date(item.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </Text>
                    </View>
                    <Text className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'} ${item.read ? 'font-medium' : 'font-black'} leading-tight`}>
                        {item.message}
                    </Text>
                </View>

                {!item.read && (
                    <View className="ml-3 w-2 h-2 rounded-full bg-indigo-600" />
                )}
            </TouchableOpacity>
        </Animated.View>
    );

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-4 text-indigo-500 font-bold uppercase tracking-widest text-[8px]">Fetching Logs...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="System Activity"
                subtitle="Live Event Stream"
                role="admin"
                gradientColors={adminGradient}
                onMenuPress={() => setSidebarVisible(true)}
                userName="Admin"
                notificationCount={notifications.filter(n => !n.read).length}
            />

            <UnifiedSidebar
                isOpen={sidebarVisible}
                onClose={() => setSidebarVisible(false)}
                userName="Administrator"
                userRole="Root Authority"
                userStatus="Mainframe Online"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={adminGradient}
                dark={isDark}
            />

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
                }
                ListHeaderComponent={() => (
                    <View className="mb-6 flex-row items-center justify-between">
                        <Text className={`font-black text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</Text>
                        <View className="bg-indigo-600 px-3 py-1 rounded-full">
                            <Text className="text-white text-[10px] font-black">{notifications.length} TOTAL</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View className="flex-1 items-center justify-center mt-20">
                        <Ionicons name="notifications-off-outline" size={64} color={isDark ? '#1E293B' : '#E2E8F0'} />
                        <Text className="text-gray-400 mt-4 font-bold uppercase tracking-widest text-xs text-center">No system events recorded</Text>
                    </View>
                )}
            />
        </View>
    );
}
