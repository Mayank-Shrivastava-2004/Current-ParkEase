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
    ActivityIndicator,
    Alert,
} from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import UnifiedHeader from '../../components/UnifiedHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProviderSettingsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState(true);
    const [instantBooking, setInstantBooking] = useState(true);
    const [visibleToPublic, setVisibleToPublic] = useState(true);
    const [isDark, setIsDark] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Provider');

    const providerGradient: readonly [string, string, ...string[]] = ['#8B5CF6', '#6D28D9'];

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
                setInstantBooking(parsed.instantBooking ?? true);
                setVisibleToPublic(parsed.visibleToPublic ?? true);
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
        Alert.alert('System Update', `Dark mode ${val ? 'enabled' : 'disabled'}. Visual sync applied.`);
    };

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Exit", style: "destructive", onPress: async () => {
                    await AsyncStorage.clear();
                    router.replace('/' as any);
                }
            }
        ]);
    };

    const SettingItem = ({ icon, label, description, value, onToggle, color = "#8B5CF6" }: any) => (
        <View className={`flex-row items-center justify-between py-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
            <View className="flex-row items-center flex-1">
                <View className={`w-12 h-12 ${isDark ? 'bg-slate-800' : 'bg-purple-50'} rounded-2xl items-center justify-center mr-4`}>
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
                trackColor={{ false: isDark ? '#1E293B' : '#E2E8F0', true: isDark ? '#7C3AED' : '#DDD6FE' }}
                thumbColor={value ? '#8B5CF6' : '#94A3B8'}
            />
        </View>
    );

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Business Control"
                subtitle="OPERATIONS HUB"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => router.back()}
                userName={userName}
                showBackButton={true}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                <View className="px-5 mt-6">
                    <Animated.View
                        entering={FadeInDown.duration(400)}
                        className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-50 shadow-2xl shadow-purple-900/10'} rounded-[40px] p-8 border flex-row items-center`}
                    >
                        <LinearGradient colors={['#8B5CF6', '#6D28D9']} className="w-20 h-20 rounded-[28px] items-center justify-center mr-6">
                            <Text className="text-white text-3xl font-black">{userName.charAt(0).toUpperCase()}</Text>
                        </LinearGradient>
                        <View className="flex-1">
                            <Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>{userName}</Text>
                            <Text className="text-purple-500 text-[9px] font-black uppercase mt-1 tracking-[2px]">Verified Partner</Text>
                        </View>
                    </Animated.View>
                </View>

                <View className="px-5 mt-8">
                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[4px] ml-4 mb-4">Core Systems</Text>
                    <Animated.View entering={FadeInUp.delay(100)} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-50 shadow-sm'} rounded-[40px] p-8 border mb-8`}>
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
                            description="Interface synchronization"
                            value={isDark}
                            onToggle={toggleDark}
                            color="#A78BFA"
                        />
                        <SettingItem
                            icon="flash"
                            label="Instant Flow"
                            description="Auto-approve guest bookings"
                            value={instantBooking}
                            onToggle={(v: any) => { setInstantBooking(v); saveSetting('instantBooking', v); }}
                            color="#F59E0B"
                        />
                        <SettingItem
                            icon="eye"
                            label="Node Visibility"
                            description="Public listing on ecosystem"
                            value={visibleToPublic}
                            onToggle={(v: any) => { setVisibleToPublic(v); saveSetting('visibleToPublic', v); }}
                            color="#10B981"
                        />
                    </Animated.View>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-rose-50 border-rose-100'} rounded-[40px] p-8 border flex-row items-center justify-center mb-10`}
                    >
                        <Ionicons name="power" size={24} color="#F43F5E" />
                        <Text className="text-rose-500 font-black ml-3 uppercase tracking-widest text-xs">Shutdown Terminal</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
