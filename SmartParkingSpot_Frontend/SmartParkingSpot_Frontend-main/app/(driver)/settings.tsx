import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    Switch,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Animated, { FadeInUp, FadeInDown, FadeInRight } from 'react-native-reanimated';
import UnifiedHeader from '../../components/UnifiedHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function DriverSettingsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState(true);
    const [locationTracking, setLocationTracking] = useState(true);
    const [autoBooking, setAutoBooking] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Driver');

    const driverGradient: readonly [string, string, ...string[]] = ['#2563EB', '#1D4ED8'];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await AsyncStorage.getItem('admin_settings');
            const storedName = await AsyncStorage.getItem('userName');
            if (storedName) setUserName(storedName);

            if (settings) {
                const parsed = JSON.parse(settings);
                setNotifications(parsed.notifications ?? true);
                setIsDark(parsed.darkMode ?? false);
                setLocationTracking(parsed.locationTracking ?? true);
                setAutoBooking(parsed.autoBooking ?? false);
            }
        } catch (err) {
            console.error('Failed to load settings', err);
        } finally {
            setLoading(false);
        }
    };

    const saveSetting = async (key: string, value: any) => {
        try {
            const settings = await AsyncStorage.getItem('admin_settings');
            const current = settings ? JSON.parse(settings) : {};
            const updated = { ...current, [key]: value };
            await AsyncStorage.setItem('admin_settings', JSON.stringify(updated));
        } catch (err) {
            console.error('Failed to save setting', err);
        }
    };

    const toggleDark = (val: boolean) => {
        setIsDark(val);
        saveSetting('darkMode', val);
        Alert.alert('System Update', `Dark mode ${val ? 'enabled' : 'disabled'}. Interstellar theme synced.`);
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout Session",
            "Are you sure you want to terminate your current session?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.clear();
                        router.replace('/' as any);
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-blue-500 font-bold uppercase tracking-widest text-[10px]">Configuring Hub...</Text>
            </View>
        );
    }

    const SettingItem = ({ icon, label, description, value, onToggle, color = "#3B82F6" }: any) => (
        <View className={`flex-row items-center justify-between py-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
            <View className="flex-row items-center flex-1">
                <View className={`w-12 h-12 ${isDark ? 'bg-slate-800' : 'bg-blue-50'} rounded-2xl items-center justify-center mr-4`}>
                    <Ionicons name={icon} size={22} color={color} />
                </View>
                <View className="flex-1 pr-4">
                    <Text className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{label}</Text>
                    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{description}</Text>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: isDark ? '#1E293B' : '#E2E8F0', true: isDark ? '#2563EB' : '#93C5FD' }}
                thumbColor={value ? '#2563EB' : '#94A3B8'}
            />
        </View>
    );

    const MenuLink = ({ icon, label, description, onPress }: any) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`flex-row items-center justify-between py-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-50'}`}
        >
            <View className="flex-row items-center flex-1">
                <View className={`w-12 h-12 ${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-2xl items-center justify-center mr-4`}>
                    <Ionicons name={icon} size={22} color="#64748B" />
                </View>
                <View className="flex-1 pr-4">
                    <Text className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{label}</Text>
                    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{description}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#334155' : '#CBD5E1'} />
        </TouchableOpacity>
    );

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            {/* PRECISE HEADER FIX */}
            <UnifiedHeader
                title="System Hub"
                subtitle="PLATFORM CONFIGURATION"
                role="driver"
                gradientColors={driverGradient}
                onMenuPress={() => router.back()}
                userName={userName}
                showBackButton={true}
                compact={false}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* PROFILE MINI CARD */}
                <View className="px-5 -mt-10">
                    <Animated.View
                        entering={FadeInDown.duration(400)}
                        className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-blue-50 shadow-2xl shadow-blue-900/10'} rounded-[40px] p-8 border flex-row items-center`}
                    >
                        <LinearGradient
                            colors={['#3B82F6', '#1D4ED8']}
                            className="w-20 h-20 rounded-[28px] items-center justify-center mr-6 shadow-lg shadow-blue-500/20"
                        >
                            <Text className="text-white text-3xl font-black">{userName.charAt(0).toUpperCase()}</Text>
                        </LinearGradient>
                        <View className="flex-1">
                            <Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>{userName}</Text>
                            <View className="flex-row items-center mt-2 bg-emerald-500/10 self-start px-3 py-1 rounded-full border border-emerald-500/20">
                                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                                <Text className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">Core Profile Verified</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/(driver)/profile')}
                            className={`${isDark ? 'bg-slate-800' : 'bg-blue-50'} w-12 h-12 rounded-2xl items-center justify-center`}
                        >
                            <Ionicons name="pencil" size={20} color="#3B82F6" />
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* SETTINGS CATEGORIES */}
                <View className="px-5 mt-8">

                    {/* CORE ENGINE SETTINGS */}
                    <Text className={`text-gray-400 text-[10px] font-black uppercase tracking-[4px] ml-4 mb-4 ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>Core Interface</Text>
                    <Animated.View entering={FadeInUp.delay(100)} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-50 shadow-sm'} rounded-[40px] p-8 border mb-8`}>
                        <SettingItem
                            icon="notifications"
                            label="Neural Link"
                            description="Push notifications & Updates"
                            value={notifications}
                            onToggle={(v: any) => { setNotifications(v); saveSetting('notifications', v); }}
                        />
                        <SettingItem
                            icon="moon"
                            label="Dark Matter"
                            description="Experimental dark theme mode"
                            value={isDark}
                            onToggle={toggleDark}
                            color="#8B5CF6"
                        />
                        <SettingItem
                            icon="navigate"
                            label="Geo Tracking"
                            description="Live location synchronization"
                            value={locationTracking}
                            onToggle={(v: any) => { setLocationTracking(v); saveSetting('locationTracking', v); }}
                            color="#10B981"
                        />
                        <SettingItem
                            icon="flash"
                            label="Auto-Pilot"
                            description="Smart AI-driven suggestions"
                            value={autoBooking}
                            onToggle={(v: any) => { setAutoBooking(v); saveSetting('autoBooking', v); }}
                            color="#F59E0B"
                        />
                    </Animated.View>

                    {/* SECURITY & LEGAL */}
                    <Text className={`text-gray-400 text-[10px] font-black uppercase tracking-[4px] ml-4 mb-4 ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>Security Protocol</Text>
                    <Animated.View entering={FadeInUp.delay(200)} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-50 shadow-sm'} rounded-[40px] p-8 border mb-8`}>
                        <MenuLink
                            icon="shield-checkmark"
                            label="Privacy Vault"
                            description="Data security & Encryption"
                            onPress={() => Alert.alert("Vault Secure", "All data is end-to-end encrypted.")}
                        />
                        <MenuLink
                            icon="help-buoy"
                            label="Support Matrix"
                            description="Direct link to control center"
                            onPress={() => router.push('/(driver)/support')}
                        />
                        <MenuLink
                            icon="document-text"
                            label="Terminal Log"
                            description="Terms of service & Use"
                            onPress={() => Alert.alert("Version 4.2.0", "Build ID: PE-2026-X1")}
                        />
                    </Animated.View>

                    {/* DANGER ZONE */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleLogout}
                        className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-rose-50 border-rose-100'} rounded-[40px] p-8 border flex-row items-center justify-between mb-10 overflow-hidden`}
                    >
                        <View className="flex-row items-center">
                            <View className={`${isDark ? 'bg-rose-500/10' : 'bg-rose-100'} w-14 h-14 rounded-2xl items-center justify-center mr-5`}>
                                <Ionicons name="power" size={28} color="#F43F5E" />
                            </View>
                            <View>
                                <Text className="text-rose-500 font-black text-xl tracking-tight">Deactivate Session</Text>
                                <Text className="text-rose-400 text-[9px] font-black uppercase tracking-widest mt-1">Disconnect from Smart Grid</Text>
                            </View>
                        </View>
                        <Ionicons name="arrow-forward" size={24} color="#F43F5E" />
                    </TouchableOpacity>

                    <View className="items-center opacity-30 pb-10">
                        <Ionicons name="infinite" size={32} color={isDark ? "white" : "black"} />
                        <Text className={`font-black text-[9px] uppercase tracking-[6px] mt-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>ParkEase Ecosystem</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
