import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import BASE_URL from '../../constants/api';

const API = BASE_URL;

export default function ProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [profile, setProfile] = useState<any>({
        name: 'Alex Rivera',
        email: 'alex.rivera@spatial.io',
        phone: '+91 98765 43210',
        address: 'Spatial HQ, Silicon Valley, CA',
        role: 'Premium Asset Provider',
        joinedDate: 'Jan 12, 2024',
        totalEarnings: 125400,
        totalBookings: 842,
        rating: 4.9,
    });
    const [editedProfile, setEditedProfile] = useState<any>({});

    const providerGradient: readonly [string, string, ...string[]] = ['#8B5CF6', '#6D28D9'];

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', route: '/(provider)/dashboard' },
        { icon: 'business', label: 'My Spaces', route: '/(provider)/spaces' },
        { icon: 'bar-chart', label: 'Earnings', route: '/(provider)/earnings' },
        { icon: 'car', label: 'Live Traffic', route: '/(provider)/traffic' },
        { icon: 'time', label: 'History', route: '/(provider)/history' },
        { icon: 'flash', label: 'EV Station', route: '/(provider)/ev-station' },
        { icon: 'headset', label: 'Support', route: '/(provider)/support' },
    ];

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            // Load Theme
            const settingsStr = await AsyncStorage.getItem('admin_settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                setIsDark(settings.darkMode ?? false);
            }

            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setEditedProfile(data);
            } else {
                setEditedProfile(profile);
            }
        } catch (err) {
            console.error('Profile load failed:', err);
            setEditedProfile(profile);
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/profile`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedProfile),
            });
            if (res.ok) {
                setProfile(editedProfile);
                setEditMode(false);
                Alert.alert('Success', 'Profile identity updated.');
                // Update local storage for dynamic header name
                await AsyncStorage.setItem('userName', editedProfile.name);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to update identity record');
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="mt-4 text-purple-600 font-bold uppercase tracking-widest text-xs">Accessing Identity...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Personnel File"
                subtitle="Identity Management"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => setSidebarOpen(true)}
                userName={profile.name}
                showBackButton={true}
            />

            <UnifiedSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userName={profile.name}
                userRole={profile.role}
                userStatus="Profile Encrypted"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={providerGradient}
                dark={isDark}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* PROFILE HERO */}
                <View className="px-5 mt-6">
                    <View className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-purple-50 shadow-purple-900/10'} rounded-[40px] p-8 shadow-2xl border items-center`}>
                        <View className={`w-28 h-28 ${isDark ? 'bg-slate-800' : 'bg-purple-50'} rounded-[40px] items-center justify-center mb-6 relative`}>
                            <Text className={`text-5xl font-black ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                {profile.name.charAt(0).toUpperCase()}
                            </Text>
                            <TouchableOpacity
                                className="absolute -bottom-2 -right-2 w-10 h-10 bg-purple-600 rounded-2xl items-center justify-center border-4 border-white shadow-lg"
                            >
                                <Ionicons name="camera" size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                        <Text className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile.name}</Text>
                        <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">{profile.role}</Text>

                        <View className="flex-row w-full justify-between mt-10 px-2">
                            <View className="items-center">
                                <Text className="text-emerald-500 text-xl font-black">?{(profile.totalEarnings / 1000).toFixed(1)}k</Text>
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Earnings</Text>
                            </View>
                            <View className={`w-[1px] ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`} />
                            <View className="items-center">
                                <Text className="text-blue-500 text-xl font-black">{profile.totalBookings}</Text>
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Bookings</Text>
                            </View>
                            <View className={`w-[1px] ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`} />
                            <View className="items-center">
                                <Text className="text-amber-500 text-xl font-black">{profile.rating}</Text>
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Rating</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* FORM FIELDS */}
                <View className="px-5 mt-10">
                    <View className="flex-row items-center justify-between mb-6 px-2">
                        <Text className={`font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Information</Text>
                        {!editMode ? (
                            <TouchableOpacity onPress={() => setEditMode(true)}>
                                <Text className="text-purple-600 font-black text-[10px] uppercase tracking-widest">Edit Records</Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="flex-row gap-3">
                                <TouchableOpacity onPress={() => setEditMode(false)}>
                                    <Text className="text-gray-500 font-black text-[10px] uppercase tracking-widest">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={saveProfile}>
                                    <Text className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">Save</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {[
                        { label: 'Full Name', value: editedProfile.name, key: 'name', icon: 'person' },
                        { label: 'Email Address', value: editedProfile.email, key: 'email', icon: 'mail' },
                        { label: 'Phone Number', value: editedProfile.phone, key: 'phone', icon: 'call' },
                        { label: 'Physical Address', value: editedProfile.address, key: 'address', icon: 'location' },
                        { label: 'Parking Area Name', value: editedProfile.parkingAreaName, key: 'parkingAreaName', icon: 'business' },
                    ].map((field, i) => (
                        <View key={i} className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100 shadow-sm'} rounded-[32px] p-6 mb-4 border flex-row items-center`}>
                            <View className={`w-12 h-12 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'} rounded-2xl items-center justify-center mr-5 border`}>
                                <Ionicons name={field.icon as any} size={20} color="#8B5CF6" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">{field.label}</Text>
                                {editMode && (field.key !== 'email') ? (
                                    <TextInput
                                        className={`font-black text-base p-0 ${isDark ? 'text-white' : 'text-gray-900'}`}
                                        value={field.value || ''}
                                        onChangeText={(t) => setEditedProfile({ ...editedProfile, [field.key]: t })}
                                    />
                                ) : (
                                    <Text className={`font-black text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{field.value || 'Not Set'}</Text>
                                )}
                            </View>
                        </View>
                    ))}

                    <View className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100 shadow-sm'} rounded-[32px] p-6 mb-4 border flex-row items-center opacity-60`}>
                        <View className={`w-12 h-12 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'} rounded-2xl items-center justify-center mr-5 border`}>
                            <Ionicons name="calendar-outline" size={20} color="#8B5CF6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">Member Since</Text>
                            <Text className={`font-black text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile.joinedDate}</Text>
                        </View>
                        <Ionicons name="lock-closed" size={16} color={isDark ? '#475569' : '#CBD5E1'} />
                    </View>
                </View>

                {/* SECURITY ACTIONS */}
                <View className="px-5 mt-6">
                    <TouchableOpacity className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-gray-900 shadow-gray-900/40'} rounded-[35px] p-8 flex-row items-center justify-between border shadow-2xl`}>
                        <View>
                            <Text className="text-white text-xl font-black">Security Suite</Text>
                            <Text className={`${isDark ? 'text-slate-400' : 'text-white/60'} text-xs mt-1 font-medium`}>Password, 2FA & Devices</Text>
                        </View>
                        <Ionicons name="shield-checkmark" size={32} color={isDark ? '#8B5CF6' : 'white'} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className={`mt-6 py-6 rounded-[35px] border items-center justify-center ${isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}
                    >
                        <Text className="text-rose-600 font-black uppercase tracking-widest text-xs">Terminate Session</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
