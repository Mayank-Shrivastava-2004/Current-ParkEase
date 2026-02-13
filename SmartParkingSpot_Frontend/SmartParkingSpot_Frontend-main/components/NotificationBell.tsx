import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    Text,
    TouchableOpacity,
    View,
    Pressable,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';

interface Notification {
    id: number;
    message: string;
    read: boolean;
    createdAt: string;
}

import BASE_URL from '../constants/api';

const API = BASE_URL;

export default function NotificationBell({ color = "white", showBadge = true }: { color?: string, showBadge?: boolean }) {
    const [visible, setVisible] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    const loadNotifications = async () => {
        const storedToken = await AsyncStorage.getItem('token');
        if (!storedToken) return;
        setToken(storedToken);

        try {
            const res = await fetch(`${API}/api/notifications`, {
                headers: { Authorization: `Bearer ${storedToken}` },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Notification fetch error:', error);
        }
    };

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await fetch(`${API}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        // Implementation for mark all as read if exists on backend
        // For now, local optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <View>
            <TouchableOpacity
                onPress={() => {
                    setVisible(true);
                    loadNotifications();
                }}
                className="w-12 h-12 bg-white/10 rounded-2xl justify-center items-center backdrop-blur-md border border-white/10"
            >
                <Ionicons name="notifications-outline" size={24} color={color} />
                {showBadge && unreadCount > 0 && (
                    <View className="absolute top-2 right-2 w-5 h-5 bg-rose-500 rounded-full justify-center items-center border-2 border-white/20">
                        <Text className="text-[9px] text-white font-black">{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade">
                <View className="flex-1 bg-black/60">
                    <Pressable className="flex-1" onPress={() => setVisible(false)} />

                    <Animated.View
                        entering={FadeInUp}
                        className="bg-white rounded-t-[50px] h-[80%] shadow-2xl overflow-hidden"
                    >
                        {/* HEADER */}
                        <View className="p-8 pb-4 flex-row justify-between items-center border-b border-gray-50">
                            <View>
                                <Text className="text-3xl font-black text-gray-900">Activity</Text>
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                                    {unreadCount} Unread Alerts
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={markAllRead}
                                className="bg-gray-100 px-4 py-2 rounded-xl"
                            >
                                <Text className="text-gray-600 font-bold text-[10px] uppercase">Mark All Read</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
                            {notifications.length === 0 ? (
                                <View className="items-center justify-center py-20">
                                    <View className="w-24 h-24 bg-gray-50 rounded-full items-center justify-center mb-6">
                                        <Ionicons name="notifications-off" size={42} color="#CBD5E1" />
                                    </View>
                                    <Text className="text-gray-400 font-bold uppercase tracking-widest text-xs">System Clear</Text>
                                </View>
                            ) : (
                                notifications.map((n, i) => (
                                    <Animated.View
                                        key={n.id}
                                        entering={FadeInUp.delay(i * 50)}
                                        className={`mb-3 rounded-3xl p-5 border ${n.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}
                                    >
                                        <View className="flex-row items-start">
                                            <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${n.read ? 'bg-gray-100' : 'bg-white'}`}>
                                                <Ionicons
                                                    name={n.read ? "mail-open-outline" : "mail-unread"}
                                                    size={22}
                                                    color={n.read ? "#94A3B8" : "#3B82F6"}
                                                />
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row justify-between items-start">
                                                    <Text className={`flex-1 font-bold text-gray-800 ${n.read ? '' : 'font-black'}`}>
                                                        {n.message}
                                                    </Text>
                                                    {!n.read && (
                                                        <View className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
                                                    )}
                                                </View>
                                                <View className="flex-row justify-between items-center mt-3">
                                                    <Text className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Text>
                                                    {!n.read && (
                                                        <TouchableOpacity onPress={() => markAsRead(n.id)}>
                                                            <Text className="text-blue-600 font-black text-[9px] uppercase">Clear</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </Animated.View>
                                ))
                            )}
                        </ScrollView>

                        {/* CLOSE BUTTON */}
                        <TouchableOpacity
                            onPress={() => setVisible(false)}
                            className="m-8 py-5 bg-gray-900 rounded-3xl items-center shadow-lg shadow-gray-900/30"
                        >
                            <Text className="text-white font-black uppercase tracking-widest text-xs">Close Panel</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
