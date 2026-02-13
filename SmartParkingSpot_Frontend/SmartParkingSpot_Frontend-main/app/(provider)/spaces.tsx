import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StatusBar,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInUp, FadeInRight, FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../constants/api';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import StatsCard from '../../components/StatsCard';

const API = BASE_URL;

export default function ProviderSpacesScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Provider');
    const [isDark, setIsDark] = useState(false);
    const [slots, setSlots] = useState<any[]>([
        { id: 1, slotCode: 'A-101', slotType: 'CAR', status: 'ACTIVE', isOccupied: false },
        { id: 2, slotCode: 'A-102', slotType: 'CAR', status: 'ACTIVE', isOccupied: true },
        { id: 3, slotCode: 'B-201', slotType: 'BIKE', status: 'ACTIVE', isOccupied: false },
        { id: 4, slotCode: 'EV-01', slotType: 'EV', status: 'INACTIVE', isOccupied: false },
        { id: 5, slotCode: 'P-001', slotType: 'PREMIUM', status: 'ACTIVE', isOccupied: false },
    ]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newSlotCode, setNewSlotCode] = useState('');
    const [newSlotType, setNewSlotType] = useState('STANDARD');

    const providerGradient: readonly [string, string, ...string[]] = ['#4F46E5', '#312E81'];

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', route: '/(provider)/dashboard' },
        { icon: 'business', label: 'My Spaces', route: '/(provider)/spaces' },
        { icon: 'bar-chart', label: 'Earnings', route: '/(provider)/earnings' },
        { icon: 'car', label: 'Live Traffic', route: '/(provider)/traffic' },
        { icon: 'time', label: 'History', route: '/(provider)/history' },
        { icon: 'flash', label: 'EV Station', route: '/(provider)/ev-station' },
        { icon: 'headset', label: 'Support', route: '/(provider)/support' },
    ];

    const loadSlots = async () => {
        try {
            // Load Theme
            const settingsStr = await AsyncStorage.getItem('admin_settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                setIsDark(settings.darkMode ?? false);
            }

            const token = await AsyncStorage.getItem('token');
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);

            const res = await fetch(`${API}/api/provider/slots`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setSlots(data);
            }
        } catch (err) {
            console.error('Slots load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSlots();
    }, []);

    const addSlot = async () => {
        if (!newSlotCode.trim()) {
            Alert.alert('Error', 'Please enter slot code');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/provider/slots`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    slotCode: newSlotCode,
                    slotType: newSlotType,
                }),
            });
            if (!res.ok) throw new Error();
            setModalVisible(false);
            setNewSlotCode('');
            setNewSlotType('STANDARD');
            loadSlots();
            Alert.alert('Success', 'Slot added successfully!');
        } catch (err) {
            Alert.alert('Error', 'Failed to add slot');
        }
    };

    const toggleSlot = async (id: number) => {
        try {
            const token = await AsyncStorage.getItem('token');
            // Optimistic update
            setSlots(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'AVAILABLE' ? 'INACTIVE' : 'AVAILABLE' } : s));

            const res = await fetch(`${API}/api/provider/slots/${id}/toggle`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
        } catch (err) {
            Alert.alert('Error', 'Failed to toggle slot');
            loadSlots(); // Revert
        }
    };

    const deleteSlot = async (id: number) => {
        Alert.alert('Delete Slot', 'This action cannot be undone. Proceed?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('token');
                        await fetch(`${API}/api/provider/slots/${id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        loadSlots();
                    } catch (err) {
                        Alert.alert('Error', 'Failed to delete slot');
                    }
                },
            },
        ]);
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="mt-4 text-indigo-500 font-bold uppercase tracking-widest text-xs">Loading Inventory...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Space Manager"
                subtitle="Inventory Control"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => setSidebarOpen(true)}
                userName={userName}
                showBackButton={true}
            />

            <UnifiedSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userName={userName}
                userRole="Parking Provider"
                userStatus="Inventory Sync Active"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={providerGradient}
                dark={isDark}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* INVENTORY SUMMARY */}
                <View className="px-5 mt-6">
                    <View className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100 shadow-xl shadow-black/5'} rounded-[35px] p-6 border flex-row justify-between`}>
                        <View className={`w-[1px] ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`} />
                        <View className="items-center flex-1">
                            <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Occupied</Text>
                            <Text className="text-indigo-500 text-3xl font-black">{slots.filter(s => s.isOccupied).length}</Text>
                        </View>
                    </View>
                </View>

                {/* ADD SLOT ACTION */}
                <View className="px-5 mt-8">
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="bg-indigo-600 py-5 rounded-3xl flex-row items-center justify-center shadow-lg shadow-indigo-600/30"
                    >
                        <Ionicons name="add-circle" size={24} color="white" />
                        <Text className="text-white font-black uppercase tracking-widest ml-2">Register New Slot</Text>
                    </TouchableOpacity>
                </View>

                {/* VISUAL INFRASTRUCTURE MAP */}
                <View className="px-5 mt-10">
                    <View className="flex-row items-center justify-between mb-8 px-2">
                        <View className="flex-row items-center">
                            <View className={`w-2 h-8 ${isDark ? 'bg-indigo-500' : 'bg-indigo-600'} rounded-full mr-4`} />
                            <View>
                                <Text className={`font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Spatial Matrix</Text>
                                <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-[2px]">Real-time Asset Map</Text>
                            </View>
                        </View>
                    </View>

                    <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-gray-100 border-gray-200'} rounded-[40px] p-8 border shadow-inner`}>
                        <View className="flex-row flex-wrap justify-between gap-y-6">
                            {slots.map((slot, idx) => (
                                <TouchableOpacity
                                    key={slot.id}
                                    onPress={() => toggleSlot(slot.id)}
                                    activeOpacity={0.7}
                                    className={`${isDark ? (slot.status === 'INACTIVE' ? 'bg-slate-800' : (slot.isOccupied ? 'bg-indigo-500/20' : 'bg-emerald-500/20')) : (slot.status === 'INACTIVE' ? 'bg-white' : (slot.isOccupied ? 'bg-indigo-50' : 'bg-emerald-50'))} w-[22%] aspect-square rounded-2xl items-center justify-center relative overflow-hidden border-2 ${slot.status === 'INACTIVE' ? 'border-dashed border-gray-500/30' : (slot.isOccupied ? 'border-indigo-500/50' : 'border-emerald-500/50')}`}
                                >
                                    {slot.isOccupied ? (
                                        <Ionicons name="car" size={20} color={isDark ? "#818CF8" : "#6366F1"} />
                                    ) : slot.status === 'INACTIVE' ? (
                                        <Ionicons name="close-outline" size={20} color={isDark ? "#475569" : "#94A3B8"} />
                                    ) : (
                                        <Ionicons name={slot.slotType === 'EV' ? "flash" : "checkmark-circle"} size={20} color={isDark ? "#34D399" : "#10B981"} />
                                    )}
                                    <View className="absolute bottom-1 w-full items-center">
                                        <Text className={`font-black text-[7px] uppercase tracking-tighter ${slot.status === 'INACTIVE' ? 'text-gray-500' : (slot.isOccupied ? 'text-indigo-400' : 'text-emerald-400')}`}>{slot.slotCode}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                onPress={() => setModalVisible(true)}
                                className={`w-[22%] aspect-square rounded-2xl items-center justify-center border-2 border-dashed ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-200/50 border-gray-400'}`}
                            >
                                <Ionicons name="add" size={24} color={isDark ? '#475569' : '#64748B'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>


                {/* DETAILED LIST */}
                <View className="px-5 mt-10">
                    <Text className={`font-black text-2xl tracking-tight mb-6 px-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Detailed Inventory</Text>
                    {slots.map((slot) => (
                        <View key={slot.id} className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100 shadow-sm'} rounded-[32px] p-5 mb-4 border`}>
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${slot.status === 'ACTIVE' ? (isDark ? 'bg-indigo-500/10' : 'bg-blue-50') : (isDark ? 'bg-rose-500/10' : 'bg-rose-50')}`}>
                                        <Ionicons
                                            name={slot.slotType === 'EV' ? "flash" : "car"}
                                            size={24}
                                            color={slot.status === 'ACTIVE' ? "#6366F1" : "#EF4444"}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row items-center">
                                            <Text className={`font-black text-lg tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{slot.slotCode}</Text>
                                            <View className={`ml-2 px-2 py-0.5 rounded-full ${slot.isOccupied ? (isDark ? 'bg-indigo-500/10' : 'bg-blue-100') : (isDark ? 'bg-emerald-500/10' : 'bg-emerald-100')}`}>
                                                <Text className={`text-[8px] font-black uppercase ${slot.isOccupied ? 'text-indigo-500' : 'text-emerald-500'}`}>
                                                    {slot.isOccupied ? 'OCCUPIED' : 'VACANT'}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                                            Type: {slot.slotType} • {slot.status}
                                        </Text>
                                    </View>
                                </View>

                                <View className="items-end">
                                    <Switch
                                        value={slot.status !== 'INACTIVE'}
                                        onValueChange={() => toggleSlot(slot.id)}
                                        trackColor={{ false: isDark ? '#1E293B' : '#E2E8F0', true: isDark ? '#10B981' : '#A7F3D0' }}
                                        thumbColor={slot.status !== 'INACTIVE' ? '#10B981' : '#94A3B8'}
                                    />
                                    <Text className={`text-[8px] font-black uppercase mt-1 ${slot.status !== 'INACTIVE' ? 'text-emerald-500' : 'text-gray-400'}`}>
                                        {slot.status !== 'INACTIVE' ? 'Active' : 'Inactive'}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => deleteSlot(slot.id)}
                                        className="mt-4"
                                    >
                                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* ADD SLOT MODAL */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View className="flex-1 bg-black/60 justify-end">
                    <Animated.View entering={FadeInUp} className={`${isDark ? 'bg-slate-900' : 'bg-white'} rounded-t-[50px] p-8 pb-12`}>
                        <View className={`w-16 h-1.5 rounded-full self-center mb-10 ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`} />

                        <Text className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>New Asset</Text>
                        <Text className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-8">Registering parking inventory</Text>

                        <View className="mb-6">
                            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3 ml-2">Slot Code</Text>
                            <TextInput
                                placeholder="e.g. A-502"
                                placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
                                value={newSlotCode}
                                onChangeText={setNewSlotCode}
                                className={`${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'} rounded-2xl p-5 font-bold border`}
                            />
                        </View>

                        <View className="mb-10">
                            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3 ml-2">Asset Type</Text>
                            <View className="flex-row gap-2">
                                {['STANDARD', 'BIKE', 'EV', 'PREMIUM'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => setNewSlotType(type)}
                                        className={`flex-1 py-4 rounded-xl items-center border ${newSlotType === type ? 'bg-indigo-600 border-indigo-600' : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100')
                                            }`}
                                    >
                                        <Text className={`font-black text-[8px] uppercase ${newSlotType === type ? 'text-white' : 'text-gray-500'}`}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className={`flex-1 py-5 rounded-2xl items-center ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}
                            >
                                <Text className={`font-black uppercase tracking-widest text-xs ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={addSlot}
                                className="flex-1 py-5 bg-indigo-600 rounded-2xl items-center shadow-lg shadow-indigo-600/30"
                            >
                                <Text className="text-white font-black uppercase tracking-widest text-xs">Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
