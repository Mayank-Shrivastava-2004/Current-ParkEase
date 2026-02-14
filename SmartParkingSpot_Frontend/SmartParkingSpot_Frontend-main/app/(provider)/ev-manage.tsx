import { Ionicons } from '@expo/vector-icons';
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
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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
    const [userName, setUserName] = useState('Provider');
    const [chargers, setChargers] = useState<EVCharger[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCharger, setEditingCharger] = useState<EVCharger | null>(null);
    const [formData, setFormData] = useState<Partial<EVCharger>>({
        name: '',
        type: 'Medium',
        power: 22,
        location: '',
        pricePerKwh: 12,
        status: 'Active',
        enabled: true,
    });

    const providerGradient: readonly [string, string, ...string[]] = ['#10B981', '#047857'];

    const loadChargers = async () => {
        try {
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);

            // Mock Data - In a real app this would be an API call
            const mockChargers: EVCharger[] = [
                { id: 'EV-01', name: 'Ultra-Charge Alpha', type: 'Super Charge', power: 150, status: 'Active', location: 'Wing A, L1', pricePerKwh: 15, enabled: true },
                { id: 'EV-02', name: 'Rapid Unit Beta', type: 'Rapid', power: 50, status: 'In Use', location: 'Wing B, Main', pricePerKwh: 12, enabled: true },
                { id: 'EV-03', name: 'Standard Flow Unit', type: 'Medium', power: 22, status: 'Active', location: 'Wing C, L2', pricePerKwh: 8, enabled: true },
            ];
            setChargers(mockChargers);
        } catch (err) {
            console.error('Failed to load chargers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadChargers();
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'Medium',
            power: 22,
            location: '',
            pricePerKwh: 12,
            status: 'Active',
            enabled: true,
        });
        setEditingCharger(null);
    };

    const handleSaveCharger = () => {
        if (!formData.name || !formData.location) {
            Alert.alert('Incomplete Protocol', 'Please fill all required diagnostic fields');
            return;
        }

        if (editingCharger) {
            setChargers(prev => prev.map(c => c.id === editingCharger.id ? { ...c, ...formData } as EVCharger : c));
        } else {
            const newCharger: EVCharger = {
                id: `EV-${String(chargers.length + 1).padStart(2, '0')}`,
                name: formData.name!,
                type: formData.type!,
                power: formData.power!,
                status: 'Active',
                location: formData.location!,
                pricePerKwh: formData.pricePerKwh!,
                enabled: true,
            };
            setChargers(prev => [...prev, newCharger]);
        }
        setShowAddModal(false);
        resetForm();
    };

    const toggleCharger = (id: string) => {
        setChargers(prev => prev.map(c =>
            c.id === id ? { ...c, enabled: !c.enabled, status: !c.enabled ? 'Active' : 'Inactive' } : c
        ));
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#10B981" />
                <Text className="mt-4 text-emerald-600 font-bold uppercase tracking-widest text-xs">Accessing Smart Grid...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <UnifiedHeader
                title="Charger Network"
                subtitle="High-Voltage Asset Control"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => { }}
                userName={userName}
                showBackButton={true}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* GRID OVERVIEW */}
                <View className="px-6 -mt-12">
                    <Animated.View entering={ZoomIn} className="bg-white rounded-[60px] p-12 shadow-2xl shadow-emerald-900/10 border border-white">
                        <View className="flex-row justify-between items-center mb-10">
                            <View>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px]">Total Grid Capacity</Text>
                                <Text className="text-4xl font-black text-gray-900 tracking-tighter mt-1">{chargers.reduce((acc, c) => acc + c.power, 0)} kW</Text>
                            </View>
                            <View className="w-20 h-20 bg-emerald-50 rounded-[28px] items-center justify-center">
                                <Ionicons name="flash" size={40} color="#10B981" />
                            </View>
                        </View>

                        <View className="flex-row gap-6">
                            <View className="flex-1 bg-gray-50 p-6 rounded-[35px] border border-gray-100">
                                <Text className="text-emerald-500 text-2xl font-black tracking-tight">{chargers.filter(c => c.enabled).length}</Text>
                                <Text className="text-gray-400 text-[8px] font-black uppercase mt-1">Online Units</Text>
                            </View>
                            <View className="flex-1 bg-gray-50 p-6 rounded-[35px] border border-gray-100">
                                <Text className="text-blue-500 text-2xl font-black tracking-tight">{chargers.filter(c => c.status === 'In Use').length}</Text>
                                <Text className="text-gray-400 text-[8px] font-black uppercase mt-1">Active Loads</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => setShowAddModal(true)}
                            activeOpacity={0.9}
                            className="bg-emerald-600 mt-10 p-7 rounded-[35px] flex-row items-center justify-center shadow-xl shadow-emerald-600/30"
                        >
                            <Ionicons name="add-circle" size={24} color="white" />
                            <Text className="text-white font-black uppercase tracking-[3px] text-xs ml-3">Deploy New Asset</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* ASSET LIST */}
                <View className="px-8 mt-16">
                    <Text className="font-black text-3xl tracking-tighter mb-10 text-gray-900 px-2">Deployed Hardware</Text>
                    {chargers.map((charger, index) => (
                        <Animated.View key={charger.id} entering={FadeInUp.delay(index * 100)}>
                            <View className="bg-white rounded-[45px] p-10 mb-8 shadow-sm border border-white">
                                <View className="flex-row justify-between items-start mb-10">
                                    <View className="flex-1">
                                        <View className="flex-row items-center">
                                            <Text className="text-2xl font-black text-gray-900 tracking-tight">{charger.name}</Text>
                                            <View className={`ml-4 px-3 py-1.5 rounded-full ${charger.status === 'Active' ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                                                <Text className={`text-[8px] font-black uppercase tracking-widest ${charger.status === 'Active' ? 'text-emerald-600' : 'text-gray-400'}`}>{charger.status}</Text>
                                            </View>
                                        </View>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px] mt-2">{charger.id} • {charger.type}</Text>
                                    </View>
                                    <Switch
                                        value={charger.enabled}
                                        onValueChange={() => toggleCharger(charger.id)}
                                        trackColor={{ false: '#E2E8F0', true: '#D1FAE5' }}
                                        thumbColor={charger.enabled ? '#10B981' : '#94A3B8'}
                                        style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
                                    />
                                </View>

                                <View className="bg-gray-50 rounded-[35px] p-8 mb-8 flex-row justify-between border border-gray-100/50">
                                    <View>
                                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-[3px] mb-2">Yield Rate</Text>
                                        <Text className="text-xl font-black text-gray-900">₹{charger.pricePerKwh}<Text className="text-xs text-gray-400">/kWh</Text></Text>
                                    </View>
                                    <View className="w-[1px] h-full bg-gray-200" />
                                    <View>
                                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-[3px] mb-2">Power</Text>
                                        <Text className="text-xl font-black text-gray-900">{charger.power} kW</Text>
                                    </View>
                                    <View className="w-[1px] h-full bg-gray-200" />
                                    <View className="items-end">
                                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-[3px] mb-2">Node</Text>
                                        <Text className="text-xl font-black text-gray-900">{charger.location}</Text>
                                    </View>
                                </View>

                                <View className="flex-row gap-5">
                                    <TouchableOpacity
                                        onPress={() => { setEditingCharger(charger); setFormData(charger); setShowAddModal(true); }}
                                        className="flex-1 bg-emerald-50 py-6 rounded-[30px] items-center border border-emerald-100"
                                    >
                                        <Text className="text-emerald-600 font-black uppercase tracking-[3px] text-[10px]">Configure</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity className="flex-1 bg-gray-50 py-6 rounded-[30px] items-center border border-gray-100">
                                        <Text className="text-gray-400 font-black uppercase tracking-[3px] text-[10px]">Diagnostics</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>

            {/* DEPLOYMENT MODAL */}
            <Modal visible={showAddModal} transparent animationType="slide" statusBarTranslucent>
                <View className="flex-1 bg-black/80 justify-end">
                    <TouchableOpacity activeOpacity={1} className="flex-1" onPress={() => setShowAddModal(false)} />
                    <Animated.View entering={FadeInUp} className="bg-white rounded-t-[70px] p-12 pb-20">
                        <View className="w-20 h-1.5 rounded-full self-center mb-12 bg-gray-100" />

                        <Text className="text-5xl font-black mb-10 text-gray-900 tracking-tighter">
                            {editingCharger ? 'Unit Config' : 'Deploy Asset'}
                        </Text>

                        <View className="mb-10">
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[4px] mb-4 ml-6">Unit Designation</Text>
                            <TextInput
                                className="bg-gray-50 rounded-[35px] p-8 border border-gray-100 font-black text-xl text-gray-900"
                                placeholder="Designation Name"
                                value={formData.name}
                                onChangeText={text => setFormData({ ...formData, name: text })}
                            />
                        </View>

                        <View className="flex-row gap-6 mb-10">
                            <View className="flex-1">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[4px] mb-4 ml-6">Power (kW)</Text>
                                <TextInput
                                    className="bg-gray-50 rounded-[35px] p-8 border border-gray-100 font-black text-xl text-gray-900"
                                    keyboardType="numeric"
                                    value={String(formData.power)}
                                    onChangeText={text => setFormData({ ...formData, power: Number(text) })}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[4px] mb-4 ml-6">Rate (₹)</Text>
                                <TextInput
                                    className="bg-gray-50 rounded-[35px] p-8 border border-gray-100 font-black text-xl text-gray-900"
                                    keyboardType="numeric"
                                    value={String(formData.pricePerKwh)}
                                    onChangeText={text => setFormData({ ...formData, pricePerKwh: Number(text) })}
                                />
                            </View>
                        </View>

                        <View className="mb-12">
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[4px] mb-4 ml-6">Node Location</Text>
                            <TextInput
                                className="bg-gray-50 rounded-[35px] p-8 border border-gray-100 font-black text-xl text-gray-900"
                                placeholder="Wing / Section"
                                value={formData.location}
                                onChangeText={text => setFormData({ ...formData, location: text })}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSaveCharger}
                            activeOpacity={0.9}
                            className="bg-emerald-600 py-8 rounded-[40px] items-center shadow-2xl shadow-emerald-600/40"
                        >
                            <Text className="text-white font-black uppercase tracking-[4px] text-xs">Initialize Hardlink</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
