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
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import UnifiedHeader from '../../components/UnifiedHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminSettingsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [biometric, setBiometric] = useState(true);
    const [autoApprove, setAutoApprove] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Admin');

    const adminGradient: readonly [string, string, ...string[]] = ['#4F46E5', '#312E81'];

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
                setDarkMode(parsed.darkMode ?? false);
                setBiometric(parsed.biometric ?? true);
                setAutoApprove(parsed.autoApprove ?? false);
            }
        } catch (err) {
            console.error('Failed to load settings', err);
        } finally {
            setLoading(false);
        }
    };

    const saveSetting = async (key: string, value: boolean) => {
        try {
            const currentSettings = await AsyncStorage.getItem('admin_settings');
            const settings = currentSettings ? JSON.parse(currentSettings) : {};
            settings[key] = value;
            await AsyncStorage.setItem('admin_settings', JSON.stringify(settings));
        } catch (err) {
            console.error('Failed to save setting', err);
        }
    };

    const toggleSetting = (key: string, value: boolean, setter: (v: boolean) => void) => {
        setter(value);
        saveSetting(key, value);
    };

    const handleLogout = async () => {
        Alert.alert("Terminal Exit", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Shutdown", style: "destructive", onPress: async () => {
                    await AsyncStorage.clear();
                    router.replace('/' as any);
                }
            }
        ]);
    };

    const SettingItem = ({ icon, label, description, value, onToggle, color = "#6366F1" }: any) => (
        <View className={`flex-row items-center justify-between py-5 border-b ${darkMode ? 'border-slate-800' : 'border-slate-50'}`}>
            <View className="flex-row items-center flex-1">
                <View className={`w-12 h-12 ${darkMode ? 'bg-slate-800' : 'bg-indigo-50'} rounded-2xl items-center justify-center mr-4`}>
                    <Ionicons name={icon} size={22} color={color} />
                </View>
                <View className="flex-1 pr-4">
                    <Text className={`font-black text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>{label}</Text>
                    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{description}</Text>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: darkMode ? '#1E293B' : '#E2E8F0', true: darkMode ? '#4F46E5' : '#C7D2FE' }}
                thumbColor={value ? '#4F46E5' : '#94A3B8'}
            />
        </View>
    );

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <View className={`flex-1 ${darkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="System Ops"
                subtitle="PLATFORM OVERRIDE"
                role="admin"
                gradientColors={adminGradient}
                onMenuPress={() => router.back()}
                userName={userName}
                showBackButton={true}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                <View className="px-5 -mt-10">
                    <Animated.View
                        entering={FadeInDown.duration(400)}
                        className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-indigo-50 shadow-2xl shadow-indigo-900/10'} rounded-[40px] p-8 border flex-row items-center`}
                    >
                        <LinearGradient colors={['#4338CA', '#312E81']} className="w-20 h-20 rounded-[28px] items-center justify-center mr-6">
                            <Text className="text-white text-3xl font-black">{userName.charAt(0).toUpperCase()}</Text>
                        </LinearGradient>
                        <View className="flex-1">
                            <Text className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'} tracking-tight`}>{userName}</Text>
                            <Text className="text-indigo-500 text-[9px] font-black uppercase mt-1 tracking-[2px]">Root Administrator</Text>
                        </View>
                    </Animated.View>
                </View>

                <View className="px-5 mt-8">
                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[4px] ml-4 mb-4">Core Protocols</Text>
                    <Animated.View entering={FadeInUp.delay(100)} className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-indigo-50 shadow-sm'} rounded-[40px] p-8 border mb-8`}>
                        <SettingItem
                            icon="notifications"
                            label="Global Alerts"
                            description="Operational system messages"
                            value={notifications}
                            onToggle={(v: any) => toggleSetting('notifications', v, setNotifications)}
                        />
                        <SettingItem
                            icon="moon"
                            label="Nocturnal mode"
                            description="Ultra-low light optimization"
                            value={darkMode}
                            onToggle={(v: any) => toggleSetting('darkMode', v, setDarkMode)}
                            color="#818CF8"
                        />
                        <SettingItem
                            icon="finger-print"
                            label="Biometric Link"
                            description="Encrypted access override"
                            value={biometric}
                            onToggle={(v: any) => toggleSetting('biometric', v, setBiometric)}
                            color="#10B981"
                        />
                        <SettingItem
                            icon="flash"
                            label="Fast Track"
                            description="Auto-verification of logs"
                            value={autoApprove}
                            onToggle={(v: any) => toggleSetting('autoApprove', v, setAutoApprove)}
                            color="#F59E0B"
                        />
                    </Animated.View>

                    <TouchableOpacity
                        onPress={() => router.push('/(admin)/profile')}
                        className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-indigo-50 shadow-sm'} rounded-[40px] p-8 border flex-row items-center justify-between mb-6`}
                    >
                        <View className="flex-row items-center">
                            <View className={`w-12 h-12 ${darkMode ? 'bg-slate-800' : 'bg-indigo-50'} rounded-2xl items-center justify-center mr-4`}>
                                <Ionicons name="lock-closed" size={22} color="#6366F1" />
                            </View>
                            <View>
                                <Text className={`font-black text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>Security Protocol</Text>
                                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Update Access Credentials</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#6366F1" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-rose-50 border-rose-100'} rounded-[40px] p-8 border flex-row items-center justify-center mb-10`}
                    >
                        <Ionicons name="power" size={24} color="#F43F5E" />
                        <Text className="text-rose-500 font-black ml-3 uppercase tracking-widest text-xs">Shutdown Command</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
