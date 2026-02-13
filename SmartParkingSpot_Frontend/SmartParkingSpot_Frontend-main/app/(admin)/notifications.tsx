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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UnifiedHeader from '../../components/UnifiedHeader';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function AdminNotifications() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);
    const API = 'http://10.67.158.172:8080';

    const adminGradient: readonly [string, string, ...string[]] = ['#4F46E5', '#312E81'];

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/admin/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Failed to fetch notifications');

            const data = await res.json();
            setNotifications(data);
        } catch (err) {
            console.error('Failed to load notifications', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await fetch(`${API}/api/admin/notifications/${id}/read`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            loadNotifications();
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'provider': return 'business';
            case 'system': return 'settings';
            case 'success': return 'trophy';
            default: return 'notifications';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'provider': return '#F59E0B';
            case 'system': return '#6366F1';
            case 'success': return '#10B981';
            default: return '#94A3B8';
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Notifications"
                subtitle="System Alerts"
                role="admin"
                gradientColors={adminGradient}
                onMenuPress={() => router.back()}
                userName="Admin"
                showBackButton={true}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="px-5 mt-6">
                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">
                        Recent Alerts
                    </Text>

                    {notifications.map((notif, index) => (
                        <Animated.View
                            key={notif.id}
                            entering={FadeInDown.delay(index * 100)}
                        >
                            <TouchableOpacity
                                onPress={() => markAsRead(notif.id)}
                                className={`bg-white rounded-3xl p-5 mb-4 border ${notif.read ? 'border-gray-100' : 'border-indigo-100'} shadow-sm`}
                            >
                                <View className="flex-row items-start">
                                    <View
                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                        style={{ backgroundColor: `${getNotificationColor(notif.type)}15` }}
                                    >
                                        <Ionicons
                                            name={getNotificationIcon(notif.type) as any}
                                            size={24}
                                            color={getNotificationColor(notif.type)}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row items-center justify-between mb-1">
                                            <Text className="font-black text-gray-900 flex-1">
                                                {notif.type?.replace('_', ' ') || 'New Alert'}
                                            </Text>
                                            {!notif.read && (
                                                <View className="w-2 h-2 bg-indigo-600 rounded-full ml-2" />
                                            )}
                                        </View>
                                        <Text className="text-gray-600 text-sm mb-2">{notif.message}</Text>
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}

                    {notifications.length === 0 && (
                        <View className="bg-white rounded-3xl p-10 items-center border border-dashed border-gray-200">
                            <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                                <Ionicons name="notifications-off" size={32} color="#CBD5E1" />
                            </View>
                            <Text className="text-gray-400 font-bold uppercase tracking-widest text-center text-xs">
                                No notifications
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
