import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Modal,
    Text,
    TouchableOpacity,
    View,
    Pressable,
    ScrollView,
} from 'react-native';

interface AdminSidebarProps {
    visible: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ visible, onClose }: AdminSidebarProps) {
    const router = useRouter();

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', path: '/(admin)/dashboard' },
        { icon: 'people', label: 'Manage Drivers', path: '/(admin)/drivers' },
        { icon: 'business', label: 'Manage Providers', path: '/(admin)/providers' },
        { icon: 'bar-chart', label: 'Detailed Analytics', path: '/(admin)/analytics' },
        { icon: 'alert-circle', label: 'Disputes', path: '/(admin)/disputes' },
        { icon: 'settings', label: 'System Settings', path: '/(admin)/settings' },
    ];

    const handleNavigate = (path: string) => {
        if (path === '#') return;
        onClose();
        router.push(path as any);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View className="flex-1 flex-row">
                {/* Sidebar Menu - Now on the Left */}
                <View
                    style={{ width: '75%' }}
                    className="h-full bg-white shadow-2xl"
                >
                    <View className="bg-slate-800 pt-16 pb-8 px-6">
                        <View className="w-16 h-16 bg-white/20 rounded-2xl justify-center items-center mb-4">
                            <Ionicons name="person" size={32} color="white" />
                        </View>
                        <Text className="text-white text-xl font-black">ADMINISTRATOR</Text>
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Super Admin Panel</Text>
                    </View>

                    <ScrollView className="flex-1 p-4">
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleNavigate(item.path)}
                                className="flex-row items-center p-4 mb-2 rounded-2xl active:bg-gray-100"
                            >
                                <View className={`w-10 h-10 rounded-xl justify-center items-center mr-4 ${index === 0 ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                                    <Ionicons
                                        name={item.icon as any}
                                        size={20}
                                        color={index === 0 ? '#6366F1' : '#636E72'}
                                    />
                                </View>
                                <Text className={`font-bold ${index === 0 ? 'text-indigo-600' : 'text-gray-600'}`}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <View className="h-[1px] bg-gray-100 my-4 mx-4" />

                        <TouchableOpacity
                            onPress={() => {
                                onClose();
                                router.replace('/(admin)');
                            }}
                            className="flex-row items-center p-4 rounded-2xl bg-rose-50"
                        >
                            <View className="w-10 h-10 rounded-xl bg-white justify-center items-center mr-4">
                                <Ionicons name="log-out" size={20} color="#EF4444" />
                            </View>
                            <Text className="font-bold text-rose-500">Logout Session</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    <View className="p-6 border-t border-gray-100">
                        <Text className="text-gray-400 text-[10px] font-bold text-center uppercase tracking-widest">
                            v1.0.4 • Smart Parking Pro
                        </Text>
                    </View>
                </View>

                {/* Overlay background - Now on the Right */}
                <Pressable
                    className="flex-1 bg-black/50"
                    onPress={onClose}
                />
            </View>
        </Modal>
    );
}
