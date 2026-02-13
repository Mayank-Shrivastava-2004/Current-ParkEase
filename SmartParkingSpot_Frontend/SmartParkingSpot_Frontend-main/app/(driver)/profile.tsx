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
import BASE_URL from '../../constants/api';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import StatsCard from '../../components/StatsCard';

const API = BASE_URL;

export default function DriverProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [profile, setProfile] = useState<any>({
        name: 'Jordan Drive',
        email: 'jordan.d@parkease.com',
        phone: '+91 70000 12345',
        address: 'Downtown, Mumbai, MH',
        role: 'Pro Driver',
        joinedDate: 'Feb 01, 2024',
        totalSpent: 4200,
        totalBookings: 142,
        rating: 5.0,
        vehicleName: 'Tesla Model 3',
        vehicleNumber: 'MH 12 AB 1234',
    });
    const [editedProfile, setEditedProfile] = useState<any>({});

    const driverGradient: readonly [string, string, ...string[]] = ['#3B82F6', '#1D4ED8'];

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', route: '/(driver)/dashboard' },
        { icon: 'search', label: 'Find Parking', route: '/(driver)/find' },
        { icon: 'time', label: 'My Bookings', route: '/(driver)/bookings' },
        { icon: 'card', label: 'Payments', route: '/(driver)/payments' },
        { icon: 'flash', label: 'EV Charging', route: '/(driver)/ev' },
        { icon: 'settings', label: 'Settings', route: '/(driver)/settings' },
        { icon: 'headset', label: 'Support', route: '/(driver)/support' },
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
                Alert.alert('Success', 'Driver identity updated.');
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
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-blue-600 font-bold uppercase tracking-widest text-xs">Authenticating Profile...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Driver Identity"
                subtitle="Account Manager"
                role="driver"
                gradientColors={driverGradient}
                onMenuPress={() => router.back()}
                userName={profile.name}
                showBackButton={true}
            />

            <UnifiedSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userName={profile.name}
                userRole={profile.role}
                userStatus="Sync Frequency High"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={driverGradient}
                dark={isDark}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* PROFILE HERO */}
                <View className="px-5 -mt-12">
                    <View className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-blue-50 shadow-blue-900/10'} rounded-[40px] p-8 shadow-2xl border items-center`}>
                        <View className={`w-28 h-28 ${isDark ? 'bg-slate-800' : 'bg-blue-50'} rounded-[40px] items-center justify-center mb-6 relative`}>
                            <Text className={`text-5xl font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                {profile.name.charAt(0).toUpperCase()}
                            </Text>
                            <TouchableOpacity
                                className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-2xl items-center justify-center border-4 border-white shadow-lg"
                            >
                                <Ionicons name="car" size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                        <Text className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile.name}</Text>
                        <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">{profile.role}</Text>

                        <View className="flex-row w-full justify-between mt-10 px-2">
                            <View className="items-center">
                                <Text className="text-emerald-500 text-xl font-black">?{profile.totalSpent || 0}</Text>
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Spent</Text>
                            </View>
                            <View className={`w-[1px] ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`} />
                            <View className="items-center">
                                <Text className="text-blue-500 text-xl font-black">{profile.totalBookings || 0}</Text>
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Trips</Text>
                            </View>
                            <View className={`w-[1px] ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`} />
                            <View className="items-center">
                                <Text className="text-amber-500 text-xl font-black">{profile.rating || 5.0}</Text>
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Score</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* FORM FIELDS */}
                <View className="px-5 mt-10">
                    <View className="flex-row items-center justify-between mb-6 px-2">
                        <Text className={`font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Personal Data</Text>
                        {!editMode ? (
                            <TouchableOpacity onPress={() => setEditMode(true)}>
                                <Text className="text-blue-600 font-black text-[10px] uppercase tracking-widest">Modify</Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="flex-row gap-3">
                                <TouchableOpacity onPress={() => setEditMode(false)}>
                                    <Text className="text-gray-500 font-black text-[10px] uppercase tracking-widest">Back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={saveProfile}>
                                    <Text className="text-blue-600 font-black text-[10px] uppercase tracking-widest">Submit</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {[
                        { label: 'Full Driver Name', value: editedProfile.name, key: 'name', icon: 'person' },
                        { label: 'Registered Email', value: editedProfile.email, key: 'email', icon: 'mail' },
                        { label: 'Emergency Contact', value: editedProfile.phone, key: 'phone', icon: 'call' },
                        { label: 'Home Base', value: editedProfile.address, key: 'address', icon: 'location' },
                    ].map((field, i) => (
                        <View key={i} className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100 shadow-sm'} rounded-[32px] p-6 mb-4 border flex-row items-center`}>
                            <View className={`w-12 h-12 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'} rounded-2xl items-center justify-center mr-5 border`}>
                                <Ionicons name={field.icon as any} size={20} color={isDark ? '#3B82F6' : '#3B82F6'} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">{field.label}</Text>
                                {editMode ? (
                                    <TextInput
                                        className={`${isDark ? 'text-white' : 'text-gray-900'} font-black text-base p-0`}
                                        value={field.value}
                                        onChangeText={(t) => setEditedProfile({ ...editedProfile, [field.key]: t })}
                                    />
                                ) : (
                                    <Text className={`${isDark ? 'text-white' : 'text-gray-900'} font-black text-base`}>{field.value}</Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

                {/* PRIMARY VEHICLE */}
                <View className="px-5 mt-6">
                    <Text className={`font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'} mb-6 px-2`}>Primary Vehicle</Text>
                    {[
                        { label: 'Vehicle Model', value: editedProfile.vehicleName || 'Not Set', key: 'vehicleName', icon: 'car-sport' },
                        { label: 'License Plate', value: editedProfile.vehicleNumber || 'Not Set', key: 'vehicleNumber', icon: 'card' },
                    ].map((field, i) => (
                        <View key={i} className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100 shadow-sm'} rounded-[32px] p-6 mb-4 border flex-row items-center`}>
                            <View className={`w-12 h-12 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'} rounded-2xl items-center justify-center mr-5 border`}>
                                <Ionicons name={field.icon as any} size={20} color={isDark ? '#3B82F6' : '#3B82F6'} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">{field.label}</Text>
                                {editMode ? (
                                    <TextInput
                                        className={`${isDark ? 'text-white' : 'text-gray-900'} font-black text-base p-0`}
                                        value={field.value !== 'Not Set' ? field.value : ''}
                                        onChangeText={(t) => setEditedProfile({ ...editedProfile, [field.key]: t })}
                                        placeholder={field.key === 'vehicleNumber' ? "MH 12 AB 1234" : "Tesla Model 3"}
                                        placeholderTextColor="#94A3B8"
                                    />
                                ) : (
                                    <Text className={`${isDark ? 'text-white' : 'text-gray-900'} font-black text-base`}>{field.value}</Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

                {/* VEHICLE MGMT ACTION */}
                <View className="px-5 mt-6">
                    <TouchableOpacity onPress={() => router.push('/(driver)/vehicles' as any)} className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-gray-900 shadow-gray-900/40'} rounded-[35px] p-8 flex-row items-center justify-between shadow-2xl border`}>
                        <View>
                            <Text className={`text-xl font-black ${isDark ? 'text-white' : 'text-white'}`}>Vehicle Garage</Text>
                            <Text className={`${isDark ? 'text-slate-400' : 'text-white/60'} text-xs mt-1 font-medium`}>Manage cars and bike profiles</Text>
                        </View>
                        <Ionicons name="car-sport" size={32} color={isDark ? '#3B82F6' : 'white'} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className={`mt-6 py-6 rounded-[35px] border items-center justify-center ${isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}
                    >
                        <Text className="text-rose-600 font-black uppercase tracking-widest text-xs">Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
