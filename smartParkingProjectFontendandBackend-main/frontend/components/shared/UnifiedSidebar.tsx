import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';

type Role = 'admin' | 'driver' | 'provider';

interface UnifiedSidebarProps {
    visible: boolean;
    onClose: () => void;
    role: Role;
    userData: {
        name: string;
        email: string;
        phone: string;
        roleTitle: string;
    };
    onUpdate?: (name: string, phone: string) => void;
    activeTab: string;
    onTabChange: (tab: any) => void;
    onLogout: () => void;
}

export default function UnifiedSidebar({
    visible,
    onClose,
    role,
    userData,
    activeTab,
    onTabChange,
    onLogout,
    onUpdate,
}: UnifiedSidebarProps) {
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editName, setEditName] = useState(userData.name);
    const [editPhone, setEditPhone] = useState(userData.phone);

    // Sync internal state with external prop changes
    React.useEffect(() => {
        setEditName(userData.name);
        setEditPhone(userData.phone);
    }, [userData.name, userData.phone]);

    const getThemeColors = (): [string, string] => {
        switch (role) {
            case 'admin': return ['#2D3436', '#636E72'];
            case 'driver': return ['#00B894', '#00cec9'];
            case 'provider': return ['#6C5CE7', '#a29bfe'];
            default: return ['#2D3436', '#636E72'];
        }
    };

    const getRoleBg = () => {
        switch (role) {
            case 'admin': return 'bg-slate-500';
            case 'driver': return 'bg-teal-500';
            case 'provider': return 'bg-indigo-500';
            default: return 'bg-slate-500';
        }
    };

    const getMenuItems = () => {
        if (role === 'admin') {
            return [
                { id: 'overview', label: 'Overview', icon: 'grid-outline' },
                { id: 'drivers', label: 'Drivers', icon: 'car-sport-outline' },
                { id: 'providers', label: 'Providers', icon: 'business-outline' },
                { id: 'analytics', label: 'Analytics', icon: 'bar-chart-outline' },
                { id: 'disputes', label: 'Disputes', icon: 'alert-circle-outline' },
                { id: 'settings', label: 'Settings', icon: 'settings-outline' },
            ];
        } else if (role === 'driver') {
            return [
                { id: 'available', label: 'Find Parking', icon: 'search-outline' },
                { id: 'bookings', label: 'My Bookings', icon: 'calendar-outline' },
                { id: 'wallet', label: 'Wallet', icon: 'wallet-outline' },
                { id: 'profile', label: 'Account', icon: 'person-outline' },
            ];
        } else {
            return [
                { id: 'dashboard', label: 'Dashboard', icon: 'home-outline' },
                { id: 'spaces', label: 'My Spaces', icon: 'grid-outline' },
                { id: 'live', label: 'Live Traffic', icon: 'car-sport-outline' },
                { id: 'bookings', label: 'History', icon: 'calendar-outline' },
                { id: 'earnings', label: 'Earnings', icon: 'cash-outline' },
                { id: 'ev', label: 'EV Station', icon: 'flash-outline' },
                { id: 'messages', label: 'Admin Support', icon: 'headset-outline' },
                { id: 'profile', label: 'My Profile', icon: 'person-outline' },
                { id: 'settings', label: 'Lot Settings', icon: 'options-outline' },
            ];
        }
    };

    const handleUpdateProfile = () => {
        onUpdate?.(editName, editPhone);
        Alert.alert("Success", "Profile updated successfully");
        setShowEditProfile(false);
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <View className="flex-1 flex-row">
                <Animated.View
                    entering={FadeInLeft.duration(300)}
                    className="w-[80%] bg-white h-full shadow-2xl"
                >
                    <LinearGradient
                        colors={getThemeColors()}
                        className="pt-16 pb-8 px-6"
                    >
                        <TouchableOpacity
                            onPress={() => setShowEditProfile(true)}
                            className="flex-row items-center mb-6"
                        >
                            <View className="w-16 h-16 bg-white/10 rounded-2xl justify-center items-center border border-white/10 shadow-sm">
                                <Ionicons name="person" size={32} color="white" />
                                <View className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full justify-center items-center shadow-sm">
                                    <Ionicons name="pencil" size={12} color="#2D3436" />
                                </View>
                            </View>
                            <View className="ml-4">
                                <Text className="text-white font-black text-xl">{editName}</Text>
                                <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">{userData.roleTitle}</Text>
                            </View>
                        </TouchableOpacity>

                        <View className="bg-white/10 p-3 rounded-xl flex-row justify-between items-center border border-white/5">
                            <View>
                                <Text className="text-white/60 text-[10px] font-bold uppercase">Account Status</Text>
                                <Text className="text-green-400 font-bold">Verified ✅</Text>
                            </View>
                            <Ionicons name="shield-checkmark" size={20} color="#00B894" />
                        </View>
                    </LinearGradient>

                    <ScrollView className="flex-1 p-6">
                        <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-4">Navigation</Text>

                        {getMenuItems().map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => {
                                    onTabChange(item.id);
                                    onClose();
                                }}
                                className={`flex-row items-center p-4 rounded-2xl mb-2 ${activeTab === item.id ? 'bg-gray-100' : ''}`}
                            >
                                <View className={`w-10 h-10 rounded-xl justify-center items-center ${activeTab === item.id ? getRoleBg() : 'bg-gray-50'
                                    }`}>
                                    <Ionicons
                                        name={item.icon as any}
                                        size={20}
                                        color={activeTab === item.id ? 'white' : '#636E72'}
                                    />
                                </View>
                                <Text className={`ml-4 font-bold ${activeTab === item.id ? 'text-slate-900' : 'text-gray-600'
                                    }`}>{item.label}</Text>
                                {activeTab === item.id && (
                                    <View className="ml-auto w-2 h-2 rounded-full bg-slate-400" />
                                )}
                            </TouchableOpacity>
                        ))}

                        <View className="h-px bg-gray-100 my-6" />

                        <TouchableOpacity
                            onPress={onLogout}
                            className="flex-row items-center p-4 opacity-70"
                        >
                            <Ionicons name="log-out-outline" size={24} color="#FF7675" />
                            <Text className="ml-4 font-bold text-red-500">Sign Out</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>

                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onClose}
                    className="flex-1 bg-black/40"
                />
            </View>

            {/* Edit Profile Modal */}
            <Modal
                visible={showEditProfile}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowEditProfile(false)}
            >
                <View className="flex-1 bg-black/60 justify-center px-6">
                    <View className="bg-white rounded-3xl p-6 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-slate-900 font-bold text-xl">Edit Profile</Text>
                            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                                <Ionicons name="close" size={24} color="#2D3436" />
                            </TouchableOpacity>
                        </View>

                        <View className="gap-4">
                            <View>
                                <Text className="text-gray-500 text-[10px] font-bold uppercase mb-1 ml-1">Full Name</Text>
                                <TextInput
                                    value={editName}
                                    onChangeText={setEditName}
                                    className="bg-gray-50 rounded-xl p-4 text-slate-900 font-medium"
                                />
                            </View>
                            <View>
                                <Text className="text-gray-500 text-[10px] font-bold uppercase mb-1 ml-1">Phone Number</Text>
                                <TextInput
                                    value={editPhone}
                                    onChangeText={setEditPhone}
                                    keyboardType="phone-pad"
                                    className="bg-gray-50 rounded-xl p-4 text-slate-900 font-medium"
                                />
                            </View>
                            <View>
                                <Text className="text-gray-500 text-[10px] font-bold uppercase mb-1 ml-1">Email Address</Text>
                                <TextInput
                                    value={userData.email}
                                    editable={false}
                                    className="bg-gray-100 rounded-xl p-4 text-gray-400 font-medium"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleUpdateProfile}
                            className={`${getRoleBg()} py-4 rounded-xl items-center mt-8 shadow-lg shadow-gray-200`}
                        >
                            <Text className="text-white font-bold uppercase tracking-widest text-sm">Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Modal>
    );
}
