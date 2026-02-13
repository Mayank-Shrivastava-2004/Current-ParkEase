import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BASE_URL from '../../constants/api';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    Text,
    TouchableOpacity,
    View,
    Pressable,
    ScrollView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

interface Notification {
    id: number;
    message: string;
    read: boolean;
    createdAt: string;
    type?: 'PROVIDER_REGISTRATION' | 'DRIVER_REGISTRATION' | 'INFO';
    refId?: number;
}

const API = BASE_URL;

export default function NotificationBell() {
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [token, setToken] = useState<string | null>(null);

    /* ================= ACTION HANDLER ================= */
    const handleAction = async (notif: Notification, action: 'approve' | 'reject' | 'suspend') => {
        if (!notif.refId) {
            alert('Action Error: Notification missing reference ID');
            return;
        }

        try {
            // Determine role by message if type is missing (legacy support)
            let rolePath = 'providers';
            if (notif.type === 'DRIVER_REGISTRATION' || notif.message.toLowerCase().includes('driver')) {
                rolePath = 'drivers';
            }

            console.log(`Processing ${action} for ${rolePath} ID: ${notif.refId}`);

            const res = await fetch(`${API}/api/admin/${rolePath}/${notif.refId}/${action}`, {
                method: action === 'reject' ? 'DELETE' : 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                // mark notification as read
                await fetch(`${API}/api/admin/notifications/${notif.id}/read`, {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${token}` }
                });
                setVisible(false);
                loadNotifications();
                alert(`Successfully ${action}d!`);
            } else {
                throw new Error('Action failed');
            }
        } catch (err) {
            console.error(err);
            alert('Operation failed. Check permissions.');
        }
    };

    /* ================= LOAD TOKEN ================= */
    useEffect(() => {
        const fetchToken = async () => {
            const storedToken = await AsyncStorage.getItem('token');
            setToken(storedToken);
        };
        fetchToken();
    }, []);

    /* ================= FETCH NOTIFICATIONS ================= */
    const loadNotifications = async () => {
        if (!token) return;

        try {
            const res = await fetch(`${API}/api/admin/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to load notifications');
            const data = await res.json();
            setNotifications(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (token) {
            loadNotifications();
        }
    }, [token]);

    /* ================= HANDLE CLICK ================= */
    const handleNotificationClick = async (n: Notification) => {
        try {
            // mark as read
            await fetch(`${API}/api/admin/notifications/${n.id}/read`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setVisible(false);
            loadNotifications();

            // navigate if info related
            if (n.type === 'PROVIDER_REGISTRATION') {
                router.push('/(admin)/providers');
            } else if (n.type === 'DRIVER_REGISTRATION') {
                router.push('/(admin)/drivers');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            {/* ?? BELL ICON */}
            <View
                style={{
                    zIndex: 999,
                    position: 'relative',
                    pointerEvents: 'box-none',
                }}
            >
                <Pressable
                    onPress={() => setVisible(true)}
                    style={{ padding: 6 }}
                >
                    <Ionicons
                        name="notifications-outline"
                        size={22}
                        color="white"
                    />

                    {unreadCount > 0 && (
                        <View
                            style={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#EF4444',
                            }}
                        />
                    )}
                </Pressable>
            </View>

            {/* ?? MODAL */}
            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={() => setVisible(false)}
            >
                <Pressable
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        justifyContent: 'flex-end',
                    }}
                    onPress={() => setVisible(false)}
                >
                    <Pressable
                        onPress={() => { }}
                        style={{
                            backgroundColor: 'white',
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            padding: 24,
                            maxHeight: '70%',
                        }}
                    >
                        <Text className="text-xl font-black mb-4">
                            Notifications
                        </Text>

                        {notifications.length === 0 && (
                            <Text className="text-gray-400">
                                No notifications
                            </Text>
                        )}

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {notifications.map((n) => (
                                <View
                                    key={n.id}
                                    className={`border-b border-gray-100 py-6 ${!n.read ? 'bg-indigo-50/40' : ''}`}
                                >
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1 mr-4">
                                            <TouchableOpacity onPress={() => handleNotificationClick(n)}>
                                                <Text className="font-bold text-dark-900">{n.message}</Text>
                                                <Text className="text-[10px] text-gray-400 mt-1 uppercase font-black">
                                                    {new Date(n.createdAt).toLocaleString()}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        {(n.type === 'PROVIDER_REGISTRATION' || n.type === 'DRIVER_REGISTRATION') && (
                                            <View className="flex-row gap-2">
                                                <TouchableOpacity
                                                    onPress={() => handleAction(n, 'approve')}
                                                    className="bg-emerald-500 w-8 h-8 rounded-full justify-center items-center"
                                                >
                                                    <Ionicons name="checkmark" size={18} color="white" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => handleAction(n, 'reject')}
                                                    className="bg-rose-500 w-8 h-8 rounded-full justify-center items-center"
                                                >
                                                    <Ionicons name="close" size={18} color="white" />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            onPress={() => setVisible(false)}
                            className="mt-6 bg-gray-100 py-3 rounded-xl items-center"
                        >
                            <Text className="font-bold">Close</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}
