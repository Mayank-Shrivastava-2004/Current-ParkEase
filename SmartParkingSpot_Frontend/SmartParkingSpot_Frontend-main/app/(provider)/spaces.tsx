import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    RefreshControl,
    Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedHeader from '../../components/UnifiedHeader';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import axios from 'axios';
import BASE_URL from '../../constants/api';

const API = BASE_URL;

export default function MySpacesScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [spaces, setSpaces] = useState<any[]>([]);
    const [providerName, setProviderName] = useState('Provider');

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newSlotCode, setNewSlotCode] = useState('');
    const [newSlotType, setNewSlotType] = useState('CAR');

    const providerGradient: readonly [string, string, ...string[]] = ['#8B5CF6', '#6D28D9'];

    useEffect(() => {
        loadSpaces();
    }, []);

    const loadSpaces = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const name = await AsyncStorage.getItem('userName');
            if (name) setProviderName(name);

            const res = await axios.get(`${API}/api/provider/slots`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 200) {
                setSpaces(res.data);
            }
        } catch (err) {
            console.error('Spaces load failed:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const addSlot = async () => {
        if (!newSlotCode) return Alert.alert('Error', 'Slot code required');
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await axios.post(`${API}/api/provider/slots`, {
                slotCode: newSlotCode,
                slotType: newSlotType
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 201 || res.status === 200) {
                setIsAddModalVisible(false);
                setNewSlotCode('');
                loadSpaces();
                Alert.alert('Asset Integrated', 'New parking asset successfully onboarded.');
            }
        } catch (err) {
            Alert.alert('Integration Failed', 'Duplicate identifier or network error.');
        }
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => (
        <Animated.View entering={FadeInUp.delay(index * 50)} className="px-5 mb-3">
            <TouchableOpacity
                onPress={() => router.push({
                    pathname: '/(provider)/slots/[id]',
                    params: { id: item.id }
                })}
                activeOpacity={0.8}
                className="bg-white rounded-3xl p-4 flex-row items-center border border-purple-50 shadow-sm"
            >
                {/* Thumbnail Layer */}
                <View className="mr-4">
                    <View className="w-16 h-16 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100 overflow-hidden">
                        <Ionicons
                            name={item.slotType === 'CAR' ? 'car' : 'bicycle'}
                            size={24}
                            color="#8B5CF6"
                            style={{ opacity: 0.2 }}
                        />
                        <View className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white bg-emerald-500" style={{ backgroundColor: item.status === 'AVAILABLE' ? '#10B981' : '#F43F5E' }} />
                    </View>
                </View>

                <View className="flex-1">
                    <Text className="text-gray-900 font-black text-lg tracking-tight">{item.slotCode}</Text>
                    <View className="flex-row items-center mt-1">
                        <Text className="text-gray-400 text-[7px] font-black uppercase tracking-widest">{item.slotType}</Text>
                        <View className="w-1 h-1 bg-gray-200 rounded-full mx-2" />
                        <Text className={`text-[7px] font-black uppercase tracking-widest ${item.status === 'AVAILABLE' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center gap-2">
                    {item.isOccupied && (
                        <View className="bg-amber-100 px-2 py-1 rounded-lg">
                            <Text className="text-amber-700 font-black text-[6px] uppercase">LIVE</Text>
                        </View>
                    )}
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text className="mt-2 text-purple-600 font-bold uppercase tracking-[2px] text-[8px]">Scanning Grid Layer...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <UnifiedHeader
                title="Active Assets"
                subtitle="INVENTORY"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => { }}
                userName={providerName}
                showBackButton={true}
                compact={true}
            />

            <View className="flex-1">
                <FlatList
                    data={spaces}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 60, paddingTop: 10 }}
                    ListHeaderComponent={() => (
                        <View className="px-4 mb-4">
                            {/* MINI ACTION BAR */}
                            <Animated.View entering={FadeInDown} className="flex-row gap-2">
                                <TouchableOpacity
                                    onPress={() => setIsAddModalVisible(true)}
                                    activeOpacity={0.9}
                                    className="flex-1 bg-gray-900 rounded-xl py-3 flex-row items-center justify-center"
                                >
                                    <View className="bg-white/10 w-6 h-6 rounded-lg items-center justify-center mr-2">
                                        <Ionicons name="add" size={16} color="white" />
                                    </View>
                                    <Text className="text-white font-black uppercase tracking-[2px] text-[8px]">Import Asset</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => Alert.alert('Sync', 'Geo-sync active.')}
                                    activeOpacity={0.8}
                                    className="w-12 bg-white rounded-xl border border-purple-100 items-center justify-center"
                                >
                                    <Ionicons name="map" size={18} color="#8B5CF6" />
                                </TouchableOpacity>
                            </Animated.View>

                            <View className="mt-6 flex-row items-center justify-between px-1">
                                <Text className="text-gray-900 text-lg font-black tracking-tight">Active Fleet</Text>
                                <Text className="text-gray-400 text-[7px] font-black uppercase tracking-widest">{spaces.length} NODES</Text>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <Animated.View entering={ZoomIn} className="items-center justify-center mt-10 px-12">
                            <Ionicons name="cube-outline" size={32} color="#E2E8F0" />
                            <Text className="text-gray-400 font-bold uppercase tracking-[4px] text-center text-[7px] mt-4">
                                Grid Empty
                            </Text>
                        </Animated.View>
                    )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSpaces(); }} tintColor="#8B5CF6" />
                    }
                />
            </View>

            {/* ADD MODAL */}
            <Modal visible={isAddModalVisible} transparent animationType="slide" statusBarTranslucent>
                <View className="flex-1 bg-black/80 justify-end">
                    <TouchableOpacity activeOpacity={1} className="flex-1" onPress={() => setIsAddModalVisible(false)} />
                    <Animated.View entering={FadeInUp} className="bg-white rounded-t-[40px] p-8 pb-12">
                        <View className="w-12 h-1 bg-gray-100 rounded-full self-center mb-8" />

                        <Text className="text-2xl font-black mb-1 text-gray-900 tracking-tighter">Add Asset</Text>
                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-[3px] mb-8">Node Integration</Text>

                        <View className="mb-6">
                            <TextInput
                                placeholder="ALPHA-01"
                                className="bg-gray-50 rounded-2xl p-5 border border-gray-100 font-black text-xl text-gray-900"
                                value={newSlotCode}
                                onChangeText={setNewSlotCode}
                                autoCapitalize="characters"
                            />
                        </View>

                        <View className="flex-row gap-3 mb-8">
                            {['CAR', 'BIKE'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => setNewSlotType(type)}
                                    className={`flex-1 rounded-2xl py-6 items-center border ${newSlotType === type ? 'bg-purple-600 border-purple-500' : 'bg-gray-50 border-gray-100'}`}
                                >
                                    <Ionicons name={type === 'CAR' ? 'car' : 'bicycle'} size={24} color={newSlotType === type ? 'white' : '#94A3B8'} />
                                    <Text className={`font-black uppercase tracking-[2px] text-[8px] mt-2 ${newSlotType === type ? 'text-white' : 'text-gray-400'}`}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={addSlot}
                            className="bg-gray-900 py-6 rounded-2xl items-center"
                        >
                            <Text className="text-white font-black uppercase tracking-[3px] text-[10px]">Initialize Node</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
