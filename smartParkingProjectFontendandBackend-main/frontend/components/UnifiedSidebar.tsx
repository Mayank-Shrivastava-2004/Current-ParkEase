import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, usePathname } from 'expo-router';

interface MenuItem {
    icon: string;
    label: string;
    route: string;
    badge?: boolean;
}

interface UnifiedSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    userRole: string;
    userStatus: string;
    menuItems: MenuItem[];
    onLogout: () => void;
    gradientColors: readonly [string, string, ...string[]];
    dark?: boolean;
}

export default function UnifiedSidebar({
    isOpen,
    onClose,
    userName,
    userRole,
    userStatus,
    menuItems,
    onLogout,
    gradientColors,
    dark = false,
}: UnifiedSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View className="flex-1 flex-row">
                {/* Sidebar Menu */}
                <View
                    style={{ width: '80%' }}
                    className={`h-full ${dark ? 'bg-slate-900 shadow-black' : 'bg-white shadow-2xl'}`}
                >
                    <LinearGradient colors={gradientColors} className="pt-16 pb-8 px-6">
                        <View className="flex-row items-center mb-5">
                            <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mr-4 border border-white/30">
                                <Text className="text-white text-3xl font-black">
                                    {userName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-white text-2xl font-black tracking-tight">{userName}</Text>
                                <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{userRole}</Text>
                            </View>
                        </View>
                        <View className="bg-white/10 self-start rounded-full px-4 py-1.5 flex-row items-center border border-white/10">
                            <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-sm shadow-emerald-400" />
                            <Text className="text-white text-[10px] font-bold tracking-wider uppercase">{userStatus}</Text>
                        </View>
                    </LinearGradient>

                    <ScrollView className="flex-1 px-4 py-6">
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4 ml-4">Main Menu</Text>

                        {menuItems.map((item, index) => {
                            const isActive = pathname === item.route;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        onClose();
                                        // Small delay ensures the modal unmounts cleanly before the new screen mounts
                                        setTimeout(() => {
                                            router.push(item.route as any);
                                        }, 10);
                                    }}
                                    className={`flex-row items-center p-4 mb-2 rounded-2xl ${isActive ? (dark ? 'bg-slate-800' : 'bg-gray-50') : ''}`}
                                >
                                    <View className={`w-10 h-10 rounded-xl justify-center items-center mr-4 ${isActive ? (dark ? 'bg-slate-700' : 'bg-white shadow-sm') : (dark ? 'bg-slate-800' : 'bg-gray-50')}`}>
                                        <Ionicons
                                            name={item.icon as any}
                                            size={20}
                                            color={isActive ? (dark ? '#A5B4FC' : gradientColors[0]) : "#64748B"}
                                        />
                                    </View>
                                    <Text className={`font-bold flex-1 ${isActive ? (dark ? 'text-white' : 'text-gray-900') : 'text-slate-500'}`}>
                                        {item.label}
                                    </Text>
                                    {item.badge && (
                                        <View className="w-5 h-5 rounded-full bg-rose-500 items-center justify-center">
                                            <Text className="text-white text-[10px] font-black">!</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}

                        <View className={`h-[1px] ${dark ? 'bg-slate-800' : 'bg-gray-100'} my-4 mx-4`} />

                        <TouchableOpacity
                            onPress={() => {
                                onClose();
                                // Small delay to allow modal cleanup before high-level navigation
                                setTimeout(() => {
                                    onLogout();
                                }, 100);
                            }}
                            className="flex-row items-center p-4 rounded-2xl active:bg-rose-50"
                        >
                            <View className={`w-10 h-10 rounded-xl ${dark ? 'bg-rose-500/10' : 'bg-rose-50'} justify-center items-center mr-4`}>
                                <Ionicons name="log-out" size={20} color="#EF4444" />
                            </View>
                            <Text className="font-bold text-rose-500">Logout Session</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    <View className={`p-6 border-t ${dark ? 'border-slate-800' : 'border-gray-100'}`}>
                        <Text className="text-gray-500 text-[10px] font-bold text-center uppercase tracking-widest">
                            ParkEase v5.0.0 • Root Access Active
                        </Text>
                    </View>
                </View>

                {/* Overlay backdrop */}
                <Pressable
                    onPress={onClose}
                    className="flex-1 bg-black/40"
                />
            </View>
        </Modal>
    );
}
