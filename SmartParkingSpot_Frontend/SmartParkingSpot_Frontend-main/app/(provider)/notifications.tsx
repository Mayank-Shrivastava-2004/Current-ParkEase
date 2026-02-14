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
import UnifiedHeader from '../../components/UnifiedHeader';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import BASE_URL from '../../constants/api';
import axios from 'axios';

const API = BASE_URL;

interface Notification {
    id: number;
    message: string;
    type: string;
    refId: number;
    read: boolean;
    createdAt: string;
}

export default function ProviderNotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [providerName, setProviderName] = useState('Provider');

    const providerGradient: readonly [string, string, ...string[]] = ['#8B5CF6', '#6D28D9'];

    const fetchNotifications = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                router.replace('/' as any);
                return;
            }

            const res = await axios.get(`${API}/api/provider/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 200) {
                setNotifications(res.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            }

            const storedName = await AsyncStorage.getItem('userName');
            if (storedName) setProviderName(storedName);

        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [router]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const markAsRead = async (id: number) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await axios.put(`${API}/api/provider/notifications/${id}/read`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 200) {
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

        if (notification.type === 'NEW_BOOKING' || notification.type === 'BOOKING_HUB') {
            router.push('/(provider)/traffic');
        } else if (notification.type === 'CHAT_MESSAGE') {
            router.push('/(provider)/support');
        } else if (notification.type === 'EARNING_CREDIT') {
            router.push('/(provider)/earnings');
        }
    };

    const renderItem = ({ item, index }: { item: Notification, index: number }) => (
        <Animated.View entering={FadeInUp.delay(index * 50)}>
            <TouchableOpacity
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.9}
                className={`${item.read ? 'bg-white' : 'bg-purple-50/20'} rounded-[45px] p-8 mb-6 flex-row items-center border ${item.read ? 'border-gray-50' : 'border-purple-100'} shadow-2xl shadow-indigo-900/5`}
            >
                <View className={`w-16 h-16 rounded-[24px] items-center justify-center mr-6 ${item.read ? 'bg-gray-100' : 'bg-purple-100/50'}`}>
                    <Ionicons
                        name={
                            item.type === 'NEW_BOOKING' ? 'car-sport' :
                                item.type === 'EARNING_CREDIT' ? 'cash' :
                                    item.type === 'CHAT_MESSAGE' ? 'chatbubbles' : 'notifications'
                        }
                        size={28}
                        color={item.read ? '#94A3B8' : '#8B5CF6'}
                    />
                </View>

                <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className={`text-[9px] font-black uppercase tracking-[3px] ${item.read ? 'text-gray-400' : 'text-purple-600'}`}>
                            {item.type || 'SYSTEM'}
                        </Text>
                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <Text className={`text-lg text-gray-900 ${item.read ? 'font-medium opacity-60' : 'font-black'} leading-tight tracking-tight`}>
                        {item.message}
                    </Text>
                </View>

                {!item.read && (
                    <View className="ml-5 w-3 h-3 rounded-full bg-purple-600 shadow-lg shadow-purple-600/40" />
                )}
            </TouchableOpacity>
        </Animated.View>
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="mt-4 text-purple-600 font-bold uppercase tracking-widest text-xs">Accessing Feed...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <UnifiedHeader
                title="Event Stream"
                subtitle="Live Information Feed"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => { }}
                userName={providerName}
                showBackButton={true}
                notificationCount={notifications.filter(n => !n.read).length}
            />

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ padding: 24, paddingBottom: 120, paddingTop: 40 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
                }
                ListHeaderComponent={() => (
                    <View className="mb-12 mt-[-84px] flex-row items-center justify-between px-2">
                        <Text className="font-black text-4xl text-gray-900 tracking-tighter">Updates</Text>
                        <View className="bg-purple-600 px-6 py-2 rounded-full shadow-lg shadow-purple-600/20">
                            <Text className="text-white text-[10px] font-black uppercase tracking-widest">{notifications.length} EVENTS</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <Animated.View entering={ZoomIn} className="flex-1 items-center justify-center mt-32 px-12">
                        <View className="w-32 h-32 bg-white rounded-[60px] items-center justify-center mb-10 shadow-sm border border-gray-50">
                            <Ionicons name="notifications-off-outline" size={56} color="#E2E8F0" />
                        </View>
                        <Text className="text-gray-400 font-black uppercase tracking-[4px] text-xs text-center leading-relaxed">No system events recorded in the current protocol</Text>
                    </Animated.View>
                )}
            />
        </View>
    );
}
