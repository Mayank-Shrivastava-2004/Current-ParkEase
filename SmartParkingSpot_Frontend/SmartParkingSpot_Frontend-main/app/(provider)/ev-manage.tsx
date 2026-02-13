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
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import BASE_URL from '../../constants/api';

const API = BASE_URL;

interface EVCharger {
    id: string;
    name: string;
    type: 'Slow' | 'Medium' | 'Rapid' | 'Super Charge';
    power: number; // kW
    status: 'Active' | 'Inactive' | 'In Use' | 'Maintenance';
    location: string;
    pricePerKwh: number;
    enabled: boolean;
}

export default function EVManagementScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Provider');
    const [isDark, setIsDark] = useState(false);
    const [chargers, setChargers] = useState<EVCharger[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCharger, setEditingCharger] = useState<EVCharger | null>(null);
    const [formData, setFormData] = useState<Partial<EVCharger>>({
        name: '',
        type: 'Medium',
        power: 22,
        location: '',
        pricePerKwh: 8,
        status: 'Active',
        enabled: true,
    });

    const providerGradient: readonly [string, string, ...string[]] = ['#10B981', '#047857'];

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', route: '/(provider)/dashboard' },
        { icon: 'business', label: 'My Spaces', route: '/(provider)/spaces' },
        { icon: 'bar-chart', label: 'Earnings', route: '/(provider)/earnings' },
        { icon: 'car', label: 'Live Traffic', route: '/(provider)/traffic' },
        { icon: 'time', label: 'History', route: '/(provider)/history' },
        { icon: 'flash', label: 'EV Station', route: '/(provider)/ev-station' },
        { icon: 'person-circle', label: 'Account Profile', route: '/(provider)/profile' },
        { icon: 'settings', label: 'Settings', route: '/(provider)/settings' },
        { icon: 'headset', label: 'Support', route: '/(provider)/support' },
    ];

    useEffect(() => {
        loadChargers();
    }, []);

    const loadChargers = async () => {
        try {
            const settingsStr = await AsyncStorage.getItem('admin_settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                setIsDark(settings.darkMode ?? false);
            }

            const token = await AsyncStorage.getItem('token');
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);

            // Mock data with new types
            const mockChargers: EVCharger[] = [
                { id: 'EV-01', name: 'Charger Alpha', type: 'Super Charge', power: 150, status: 'Active', location: 'Section A1', pricePerKwh: 15, enabled: true },
                { id: 'EV-02', name: 'Charger Beta', type: 'Rapid', power: 50, status: 'In Use', location: 'Section B2', pricePerKwh: 12, enabled: true },
                { id: 'EV-03', name: 'Charger Gamma', type: 'Medium', power: 22, status: 'Active', location: 'Section C3', pricePerKwh: 8, enabled: true },
                { id: 'EV-04', name: 'Charger Delta', type: 'Slow', power: 7, status: 'Inactive', location: 'Section D4', pricePerKwh: 5, enabled: false },
            ];
            setChargers(mockChargers);
        } catch (err) {
            console.error('Failed to load chargers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCharger = () => {
        if (!formData.name || !formData.location) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        const newCharger: EVCharger = {
            id: `EV-${String(chargers.length + 1).padStart(2, '0')}`,
            name: formData.name!,
            type: formData.type!,
            power: formData.power!,
            status: formData.enabled ? 'Active' : 'Inactive',
            location: formData.location!,
            pricePerKwh: formData.pricePerKwh!,
            enabled: formData.enabled!,
        };

        setChargers([...chargers, newCharger]);
        setShowAddModal(false);
        resetForm();
        Alert.alert('Success', 'EV Charger added');
    };

    const handleUpdateCharger = () => {
        if (!editingCharger) return;

        const updated = chargers.map(c =>
            c.id === editingCharger.id ? { ...c, ...formData, status: formData.enabled ? 'Active' : 'Inactive' } as EVCharger : c
        );
        setChargers(updated);
        setEditingCharger(null);
        resetForm();
        Alert.alert('Success', 'Configuration updated');
    };

    const handleDeleteCharger = (id: string) => {
        Alert.alert(
            'Decommission Charger',
            'Are you sure you want to remove this unit?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setChargers(chargers.filter(c => c.id !== id));
                    },
                },
            ]
        );
    };

    const toggleChargerStatus = (id: string) => {
        const updated = chargers.map(c =>
            c.id === id ? { ...c, enabled: !c.enabled, status: (!c.enabled ? 'Active' : 'Inactive') as EVCharger['status'] } : c
        );
        setChargers(updated);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'Medium',
            power: 22,
            location: '',
            pricePerKwh: 8,
            status: 'Active',
            enabled: true,
        });
    };

    const openEditModal = (charger: EVCharger) => {
        setEditingCharger(charger);
        setFormData(charger);
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return '#10B981';
            case 'In Use': return '#3B82F6';
            case 'Maintenance': return '#F59E0B';
            case 'Inactive': return '#94A3B8';
            default: return '#94A3B8';
        }
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text className="mt-4 text-emerald-600 font-bold uppercase tracking-widest text-xs">Accessing Grid...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Charger Network"
                subtitle="Energy Management System"
                role="provider"
                gradientColors={['#059669', '#10B981']}
                onMenuPress={() => setSidebarOpen(true)}
                userName={userName}
                showBackButton={true}
            />

            <UnifiedSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userName={userName}
                userRole="Parking Provider"
                userStatus="Clean Energy Feed"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={providerGradient}
                dark={isDark}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* GLOBAL METRICS */}
                <View className="px-5 mt-6">
                    <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-emerald-50'} rounded-[40px] p-8 shadow-2xl border`}>
                        <View className="flex-row justify-between">
                            <View className="items-center flex-1">
                                <Text className="text-emerald-500 text-3xl font-black">{chargers.filter(c => c.enabled).length}</Text>
                                <Text className="text-gray-500 text-[10px] font-black uppercase mt-1">Active</Text>
                            </View>
                            <View className={`w-[1px] h-10 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`} />
                            <View className="items-center flex-1">
                                <Text className="text-blue-500 text-3xl font-black">{chargers.filter(c => c.status === 'In Use').length}</Text>
                                <Text className="text-gray-500 text-[10px] font-black uppercase mt-1">In Use</Text>
                            </View>
                            <View className={`w-[1px] h-10 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`} />
                            <View className="items-center flex-1">
                                <Text className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{chargers.length}</Text>
                                <Text className="text-gray-500 text-[10px] font-black uppercase mt-1">Total</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* PROVISION BUTTON */}
                <View className="px-5 mt-6">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setShowAddModal(true)}
                        className="bg-emerald-600 rounded-[35px] p-6 flex-row items-center justify-center shadow-lg shadow-emerald-500/30"
                    >
                        <Ionicons name="add-circle" size={24} color="white" />
                        <Text className="text-white font-black text-sm ml-3 uppercase tracking-[2px]">Provision New Charger</Text>
                    </TouchableOpacity>
                </View>

                {/* ASSET GRID */}
                <View className="px-5 mt-10">
                    <View className="flex-row items-center justify-between mb-8 px-2">
                        <View className="flex-row items-center">
                            <View className={`w-2 h-8 ${isDark ? 'bg-emerald-500' : 'bg-emerald-600'} rounded-full mr-4`} />
                            <View>
                                <Text className={`font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Unit Inventory</Text>
                                <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-[2px]">Deployed Hardware</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowAddModal(true)}
                            className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-600'} items-center justify-center`}
                        >
                            <Ionicons name="add" size={28} color="white" />
                        </TouchableOpacity>
                    </View>
                    {chargers.map((charger) => {
                        const sColor = getStatusColor(charger.status);
                        return (
                            <View key={charger.id} className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100'} rounded-[35px] p-7 mb-5 border shadow-sm`}>
                                <View className="flex-row items-start justify-between mb-6">
                                    <View className="flex-1">
                                        <View className="flex-row items-center">
                                            <Text className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{charger.name}</Text>
                                            <View className={`ml-3 px-3 py-1 rounded-full ${isDark ? 'bg-slate-800' : 'bg-gray-50'}`}>
                                                <Text style={{ color: sColor }} className="text-[8px] font-black uppercase tracking-widest">{charger.status}</Text>
                                            </View>
                                        </View>
                                        <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-[2px] mt-1">{charger.id} • {charger.type}</Text>
                                    </View>
                                    <View className="items-end">
                                        <Switch
                                            value={charger.enabled}
                                            onValueChange={() => toggleChargerStatus(charger.id)}
                                            trackColor={{ false: isDark ? '#1E293B' : '#E2E8F0', true: '#D1FAE5' }}
                                            thumbColor={charger.enabled ? '#10B981' : '#94A3B8'}
                                        />
                                        <Text className="text-gray-400 text-[8px] font-black mt-1 uppercase">{charger.enabled ? 'ACTIVE' : 'INACTIVE'}</Text>
                                    </View>
                                </View>

                                <View className={`${isDark ? 'bg-slate-800' : 'bg-gray-50'} rounded-[28px] p-5 mb-6 flex-row justify-between`}>
                                    <View>
                                        <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Power Output</Text>
                                        <Text className={`text-base font-black mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{charger.power} kW</Text>
                                    </View>
                                    <View className={`w-[1px] h-full ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
                                    <View>
                                        <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Rate (kWh)</Text>
                                        <Text className={`text-base font-black mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{charger.pricePerKwh}</Text>
                                    </View>
                                    <View className={`w-[1px] h-full ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
                                    <View>
                                        <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Placement</Text>
                                        <Text className={`text-base font-black mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{charger.location}</Text>
                                    </View>
                                </View>

                                <View className="flex-row gap-4">
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => openEditModal(charger)}
                                        className={`flex-1 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'} rounded-2xl py-4 items-center`}
                                    >
                                        <Text className="text-emerald-600 font-black text-xs uppercase tracking-widest">Manage</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => handleDeleteCharger(charger.id)}
                                        className={`flex-1 ${isDark ? 'bg-rose-500/10' : 'bg-rose-50'} rounded-2xl py-4 items-center`}
                                    >
                                        <Text className="text-rose-600 font-black text-xs uppercase tracking-widest">Decommission</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* CONFIGURATION MODAL */}
            <Modal
                visible={showAddModal || editingCharger !== null}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setShowAddModal(false);
                    setEditingCharger(null);
                    resetForm();
                }}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className={`${isDark ? 'bg-slate-900' : 'bg-white'} rounded-t-[50px] p-10`}>
                        <View className="flex-row items-center justify-between mb-8">
                            <Text className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {editingCharger ? 'Unit Config' : 'New Unit'}
                            </Text>
                            <TouchableOpacity onPress={() => {
                                setShowAddModal(false);
                                setEditingCharger(null);
                                resetForm();
                            }}>
                                <Ionicons name="close-circle" size={36} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 550 }}>
                            {/* Identity */}
                            <View className="mb-6">
                                <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[2px] mb-3">Unit Alias</Text>
                                <TextInput
                                    className={`${isDark ? 'bg-slate-800 text-white' : 'bg-gray-50 text-gray-900'} rounded-[24px] p-5 font-bold text-base`}
                                    placeholder="e.g., Ultra-Charge 1"
                                    placeholderTextColor="#94A3B8"
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                />
                            </View>

                            {/* Classification */}
                            <View className="mb-6">
                                <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[2px] mb-3">Classification</Text>
                                <View className="flex-row flex-wrap gap-3">
                                    {['Slow', 'Medium', 'Rapid', 'Super Charge'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            activeOpacity={0.7}
                                            onPress={() => setFormData({
                                                ...formData,
                                                type: type as any,
                                                power: type === 'Super Charge' ? 150 : type === 'Rapid' ? 50 : type === 'Medium' ? 22 : 7
                                            })}
                                            className={`px-5 py-4 rounded-2xl border ${formData.type === type ? 'bg-emerald-600 border-emerald-600' : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200')}`}
                                        >
                                            <Text className={`text-center font-black text-xs ${formData.type === type ? 'text-white' : 'text-gray-500'}`}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className="flex-row gap-5 mb-6">
                                {/* Power */}
                                <View className="flex-1">
                                    <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[2px] mb-3">Power (kW)</Text>
                                    <TextInput
                                        className={`${isDark ? 'bg-slate-800 text-white' : 'bg-gray-50 text-gray-900'} rounded-[24px] p-5 font-bold text-base`}
                                        placeholder="150"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="numeric"
                                        value={String(formData.power)}
                                        onChangeText={(text) => setFormData({ ...formData, power: Number(text) })}
                                    />
                                </View>
                                {/* Price */}
                                <View className="flex-1">
                                    <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[2px] mb-3">Rate (₹/kWh)</Text>
                                    <TextInput
                                        className={`${isDark ? 'bg-slate-800 text-white' : 'bg-gray-50 text-gray-900'} rounded-[24px] p-5 font-bold text-base`}
                                        placeholder="12"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="numeric"
                                        value={String(formData.pricePerKwh)}
                                        onChangeText={(text) => setFormData({ ...formData, pricePerKwh: Number(text) })}
                                    />
                                </View>
                            </View>

                            {/* Placement */}
                            <View className="mb-10">
                                <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[2px] mb-3">Unit Placement</Text>
                                <TextInput
                                    className={`${isDark ? 'bg-slate-800 text-white' : 'bg-gray-50 text-gray-900'} rounded-[24px] p-5 font-bold text-base`}
                                    placeholder="Section A, Row 4"
                                    placeholderTextColor="#94A3B8"
                                    value={formData.location}
                                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                                />
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={editingCharger ? handleUpdateCharger : handleAddCharger}
                                className="bg-emerald-600 rounded-[30px] py-6 items-center shadow-xl shadow-emerald-500/40"
                            >
                                <Text className="text-white font-black uppercase tracking-[3px] text-sm">
                                    {editingCharger ? 'Push Updates' : 'Initialize Unit'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
