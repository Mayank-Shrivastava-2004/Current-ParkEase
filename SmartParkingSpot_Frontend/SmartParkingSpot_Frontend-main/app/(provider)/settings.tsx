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
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import UnifiedHeader from '../../components/UnifiedHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProviderSettingsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState(true);
    const [instantBooking, setInstantBooking] = useState(true);
    const [visibleToPublic, setVisibleToPublic] = useState(true);
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

    const handleLogout = async () => {
        Alert.alert("Terminating Session", "Are you sure you want to disconnect from the Provider Hub?", [
            { text: "Abort", style: "cancel" },
            {
                text: "Disconnect", style: "destructive", onPress: async () => {
                    await AsyncStorage.clear();
                    router.replace('/' as any);
                }
            }
        ]);
    };

    const SettingItem = ({ icon, label, description, value, onToggle, color = "#8B5CF6" }: any) => (
        <View className="flex-row items-center justify-between py-8 border-b border-gray-50">
            <View className="flex-row items-center flex-1">
                <View style={{ backgroundColor: `${color}15` }} className="w-16 h-16 rounded-[24px] items-center justify-center mr-6">
                    <Ionicons name={icon} size={28} color={color} />
                </View>
                <View className="flex-1 pr-6">
                    <Text className="font-black text-xl text-gray-900 tracking-tight">{label}</Text>
                    <Text className="text-gray-400 text-[9px] font-black uppercase tracking-[3px] mt-2">{description}</Text>
                </View>
            </View>
            <View className="scale-110">
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: '#E2E8F0', true: '#C4B5FD' }}
                    thumbColor={value ? '#8B5CF6' : '#94A3B8'}
                />
            </View>
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="mt-4 text-purple-600 font-bold uppercase tracking-widest text-xs">Syncing Protocol...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <UnifiedHeader
                title="Business Control"
                subtitle="OPERATIONS HUB"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => { }}
                userName={userName}
                showBackButton={true}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* ACCOUNT HERO */}
                <View className="px-6 -mt-12">
                    <Animated.View
                        entering={ZoomIn.duration(400)}
                        className="bg-white rounded-[60px] p-12 border border-white shadow-2xl shadow-indigo-900/10 flex-row items-center"
                    >
                        <LinearGradient colors={['#8B5CF6', '#6D28D9']} className="w-24 h-24 rounded-[35px] items-center justify-center mr-8 shadow-xl shadow-purple-600/30">
                            <Text className="text-white text-4xl font-black">{userName.charAt(0).toUpperCase()}</Text>
                        </LinearGradient>
                        <View className="flex-1">
                            <Text className="text-3xl font-black text-gray-900 tracking-tighter">{userName}</Text>
                            <View className="bg-gray-50 px-5 py-2 rounded-full self-start mt-3 border border-gray-100">
                                <Text className="text-purple-600 text-[10px] font-black uppercase tracking-[3px]">Verified Partner</Text>
                            </View>
                        </View>
                    </Animated.View>
                </View>

                {/* SYSTEM SETTINGS */}
                <View className="px-7 mt-16">
                    <Text className="text-gray-900 text-3xl font-black tracking-tighter ml-4 mb-4">Operations Control</Text>
                    <Animated.View entering={FadeInUp.delay(100)} className="bg-white rounded-[50px] p-12 border border-white shadow-sm mb-12">
                        <SettingItem
                            icon="notifications"
                            label="Neuro Link"
                            description="Real-time hub alerts"
                            value={notifications}
                            onToggle={(v: any) => { setNotifications(v); saveSetting('notifications', v); }}
                        />
                        <SettingItem
                            icon="flash"
                            label="Instant Flow"
                            description="Auto-approve credentials"
                            value={instantBooking}
                            onToggle={(v: any) => { setInstantBooking(v); saveSetting('instantBooking', v); }}
                            color="#F59E0B"
                        />
                        <SettingItem
                            icon="eye"
                            label="Node Visibility"
                            description="Public listing on grid"
                            value={visibleToPublic}
                            onToggle={(v: any) => { setVisibleToPublic(v); saveSetting('visibleToPublic', v); }}
                            color="#10B981"
                        />

                        <TouchableOpacity
                            onPress={() => Alert.alert('Security Protocol', 'Updating encryption keys for hub communication...')}
                            className="flex-row items-center justify-between py-8"
                        >
                            <View className="flex-row items-center flex-1">
                                <View className="bg-rose-50 w-16 h-16 rounded-[24px] items-center justify-center mr-6">
                                    <Ionicons name="shield-checkmark" size={28} color="#F43F5E" />
                                </View>
                                <View className="flex-1 pr-6">
                                    <Text className="font-black text-xl text-gray-900 tracking-tight">Access Integrity</Text>
                                    <Text className="text-gray-400 text-[9px] font-black uppercase tracking-[3px] mt-2">Update security certificates</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#CBD5E1" />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* DANGER ZONE */}
                    <Text className="text-rose-500 text-3xl font-black tracking-tighter ml-4 mb-4">Terminal Exit</Text>
                    <TouchableOpacity
                        onPress={handleLogout}
                        activeOpacity={0.9}
                        className="bg-rose-50 rounded-[50px] p-12 border border-rose-100 flex-row items-center justify-center mb-10 shadow-2xl shadow-rose-900/10"
                    >
                        <View className="bg-white w-20 h-20 rounded-[30px] items-center justify-center mr-8 shadow-sm">
                            <Ionicons name="power" size={40} color="#F43F5E" />
                        </View>
                        <View>
                            <Text className="text-rose-600 font-black text-2xl tracking-tighter">Shut Down Hub</Text>
                            <Text className="text-rose-400 text-[10px] font-black uppercase tracking-[3px] mt-2">Terminate all sessions</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
