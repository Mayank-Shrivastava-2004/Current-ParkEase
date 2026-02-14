import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import UnifiedHeader from '../../../components/UnifiedHeader';
import BASE_URL from '../../../constants/api';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import axios from 'axios';

const API = BASE_URL;

export default function SlotDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [slot, setSlot] = useState<any>(null);
    const [editedSlot, setEditedSlot] = useState<any>(null);

    const providerGradient: readonly [string, string, ...string[]] = ['#8B5CF6', '#6D28D9'];

    useEffect(() => {
        loadSlotDetails();
    }, [id]);

    const loadSlotDetails = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await axios.get(`${API}/api/provider/slots/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 200) {
                setSlot(res.data);
                setEditedSlot(res.data);
            }
        } catch (err) {
            console.error('Failed to load slot details', err);
        } finally {
            setLoading(false);
        }
    };

    const saveChanges = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await axios.put(`${API}/api/provider/slots/${id}`, editedSlot, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (res.status === 200) {
                setSlot(editedSlot);
                setEditMode(false);
                Alert.alert('Protocol Success', 'Parking asset records updated.');
            }
        } catch (err) {
            Alert.alert('Error', 'Update protocol failed.');
        }
    };

    if (loading || !slot) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="mt-4 text-purple-600 font-bold uppercase tracking-widest text-xs">Accessing Asset Records...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <UnifiedHeader
                title="Asset Control"
                subtitle={`Registry: ${slot.slotCode}`}
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => { }}
                userName="Admin"
                showBackButton={true}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* HERO BOX */}
                <View className="px-6 -mt-12">
                    <Animated.View entering={ZoomIn} className="bg-white rounded-[60px] p-12 border border-white shadow-2xl shadow-indigo-900/10 items-center">
                        <LinearGradient
                            colors={slot.status === 'AVAILABLE' ? ['#ECFDF5', '#D1FAE5'] : ['#FFF1F2', '#FFE4E6']}
                            className="w-32 h-32 rounded-[45px] items-center justify-center mb-8 border border-white shadow-inner"
                        >
                            <Ionicons
                                name={slot.slotType === 'CAR' ? 'car-sport' : 'bicycle'}
                                size={64}
                                color={slot.status === 'AVAILABLE' ? '#10B981' : '#F43F5E'}
                            />
                        </LinearGradient>
                        <Text className="text-4xl font-black text-gray-900 tracking-tighter">{slot.slotCode}</Text>
                        <View className="flex-row items-center mt-4 bg-gray-50 px-6 py-2 rounded-full border border-gray-100">
                            <View className={`w-2.5 h-2.5 rounded-full mr-3 ${slot.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-rose-500 shadow-lg shadow-rose-500/50'}`} />
                            <Text className={`font-black uppercase tracking-[2px] text-[10px] ${slot.status === 'AVAILABLE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {slot.status}
                            </Text>
                        </View>
                    </Animated.View>
                </View>

                {/* CONFIGURATION SECTION */}
                <View className="px-7 mt-12">
                    <View className="flex-row justify-between items-center mb-10 px-3">
                        <Text className="text-3xl font-black text-gray-900 tracking-tighter">Configuration</Text>
                        {!editMode ? (
                            <TouchableOpacity onPress={() => setEditMode(true)} className="bg-purple-100 px-6 py-2.5 rounded-full">
                                <Text className="text-purple-700 font-black text-[10px] uppercase tracking-widest">Update State</Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="flex-row gap-4">
                                <TouchableOpacity onPress={() => setEditMode(false)} className="bg-gray-100 px-6 py-2.5 rounded-full">
                                    <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Abort</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={saveChanges} className="bg-emerald-600 px-6 py-2.5 rounded-full shadow-lg shadow-emerald-600/30">
                                    <Text className="text-white font-black text-[10px] uppercase tracking-widest">Commit</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <Animated.View entering={FadeInUp.delay(200)} className="bg-white rounded-[45px] p-10 border border-white shadow-sm mb-10">
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px] mb-6 ml-4">Slot Identifier</Text>
                        {editMode ? (
                            <View className="bg-gray-50 border border-gray-100 rounded-3xl p-6">
                                <TextInput
                                    className="font-black text-2xl text-gray-900"
                                    value={editedSlot.slotCode}
                                    onChangeText={(t) => setEditedSlot({ ...editedSlot, slotCode: t })}
                                    autoCapitalize="characters"
                                />
                            </View>
                        ) : (
                            <View className="bg-gray-50/50 rounded-3xl p-6 border border-gray-50">
                                <Text className="font-black text-2xl text-gray-900">{slot.slotCode}</Text>
                            </View>
                        )}

                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px] mt-10 mb-6 ml-4">Hardware Classification</Text>
                        <View className="flex-row gap-5">
                            {['CAR', 'BIKE'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    disabled={!editMode}
                                    onPress={() => setEditedSlot({ ...editedSlot, slotType: type })}
                                    className={`flex-1 py-6 rounded-[30px] border items-center ${editedSlot.slotType === type ? 'bg-gray-900 border-gray-800 shadow-xl' : 'bg-gray-50 border-gray-100'} ${!editMode && slot.slotType !== type ? 'opacity-30' : ''}`}
                                >
                                    <Text className={`font-black text-[11px] uppercase tracking-[3px] ${editedSlot.slotType === type ? 'text-white' : 'text-gray-400'}`}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(300)} className="bg-white rounded-[45px] p-10 border border-white shadow-sm mb-10 flex-row items-center justify-between">
                        <View>
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px] mb-3">Live Presence</Text>
                            <Text className="font-black text-2xl text-gray-900">{slot.status}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={async () => {
                                try {
                                    const token = await AsyncStorage.getItem('token');
                                    await axios.patch(`${API}/api/provider/slots/${slot.id}/toggle`, {}, {
                                        headers: { Authorization: `Bearer ${token}` }
                                    });
                                    loadSlotDetails();
                                } catch (err) {
                                    Alert.alert('Status Sync Error');
                                }
                            }}
                            activeOpacity={0.8}
                            className={`w-16 h-16 rounded-[24px] items-center justify-center ${slot.status === 'AVAILABLE' ? 'bg-rose-50' : 'bg-emerald-50'} border ${slot.status === 'AVAILABLE' ? 'border-rose-100' : 'border-emerald-100'}`}
                        >
                            <Ionicons name={slot.status === 'AVAILABLE' ? 'power' : 'flash'} size={32} color={slot.status === 'AVAILABLE' ? '#F43F5E' : '#10B981'} />
                        </TouchableOpacity>
                    </Animated.View>

                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert('Decommission Asset', 'Permanently remove this parking spot from the ecosystem?', [
                                { text: 'Abort', style: 'cancel' },
                                {
                                    text: 'Confirm Removal',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            const token = await AsyncStorage.getItem('token');
                                            await axios.delete(`${API}/api/provider/slots/${slot.id}`, {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            router.back();
                                        } catch (err) {
                                            Alert.alert('Decommissing failed');
                                        }
                                    }
                                }
                            ]);
                        }}
                        activeOpacity={0.8}
                        className="mt-4 bg-rose-50/50 border border-rose-100 py-8 rounded-[40px] items-center"
                    >
                        <Text className="text-rose-600 font-black uppercase tracking-[4px] text-[11px]">Decommission Asset</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
