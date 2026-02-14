import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UnifiedHeader from '../../components/UnifiedHeader';
import BASE_URL from '../../constants/api';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import axios from 'axios';

const API = BASE_URL;

export default function ProviderHistoryScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userName, setUserName] = useState('Provider');
    const [history, setHistory] = useState<any[]>([]);

    const providerGradient: readonly [string, string, ...string[]] = ['#8B5CF6', '#6D28D9'];

    const loadHistory = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await axios.get(`${API}/api/provider/history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 200) {
                setHistory(res.data);
            }
        } catch (err) {
            console.error('History load failed:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);
            loadHistory();
        };
        init();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadHistory();
    }, []);

    const renderItem = ({ item, index }: { item: any; index: number }) => (
        <Animated.View entering={FadeInUp.delay(index * 50)}>
            <TouchableOpacity
                activeOpacity={0.9}
                className="bg-white p-8 mb-6 rounded-[50px] border border-white shadow-2xl shadow-indigo-900/5"
            >
                <View className="flex-row justify-between items-start mb-8">
                    <View className="flex-row items-center flex-1">
                        <View className="w-16 h-16 rounded-[24px] items-center justify-center mr-6 bg-purple-50 border border-purple-100/50">
                            <Ionicons name="car-sport" size={32} color="#8B5CF6" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-black text-2xl text-gray-900 tracking-tighter">{item.customer || 'Guest User'}</Text>
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px] mt-1">{item.vehicleNumber || 'Vehicule ID N/A'}</Text>
                        </View>
                    </View>
                    <View className={`px-5 py-2 rounded-full ${item.status === 'completed' ? 'bg-emerald-50' : 'bg-amber-50'} border ${item.status === 'completed' ? 'border-emerald-100' : 'border-amber-100'}`}>
                        <Text className={`text-[10px] font-black uppercase tracking-[3px] ${item.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View className="h-[1px] w-full mb-8 bg-gray-50/50" />

                <View className="flex-row justify-between items-center bg-gray-50/50 p-6 rounded-[32px] border border-gray-50">
                    <View>
                        <Text className="text-gray-400 text-[9px] font-black uppercase tracking-[3px] mb-2">Timestamp</Text>
                        <Text className="font-black text-gray-900 text-xs tracking-tight">{item.date}</Text>
                    </View>
                    <View className="w-[1px] h-8 bg-gray-200" />
                    <View>
                        <Text className="text-gray-400 text-[9px] font-black uppercase tracking-[3px] mb-2 text-center">Slot</Text>
                        <Text className="font-black text-gray-900 text-xs text-center tracking-tight">{item.slot}</Text>
                    </View>
                    <View className="w-[1px] h-8 bg-gray-200" />
                    <View className="items-end">
                        <Text className="text-gray-400 text-[9px] font-black uppercase tracking-[3px] mb-2">Net Yield</Text>
                        <Text className="font-black text-2xl text-purple-600">₹{item.amount}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="mt-4 text-purple-600 font-bold uppercase tracking-widest text-xs">Accessing Ledger...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <UnifiedHeader
                title="Business Logs"
                subtitle="Historical Archive"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => { }}
                userName={userName}
                showBackButton={true}
            />

            <FlatList
                data={history}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 24, paddingBottom: 120, paddingTop: 40 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
                }
                ListHeaderComponent={() => (
                    <View className="mb-12 mt-[-84px] px-2 flex-row justify-between items-center">
                        <Text className="font-black text-4xl text-gray-900 tracking-tighter">Records</Text>
                        <View className="bg-white/80 px-5 py-2 rounded-full border border-gray-100 shadow-sm">
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{history.length} ITEMS</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <Animated.View entering={ZoomIn} className="items-center justify-center mt-32 px-12">
                        <View className="w-32 h-32 bg-white rounded-[60px] items-center justify-center mb-10 shadow-sm border border-gray-50">
                            <Ionicons name="folder-open-outline" size={56} color="#E2E8F0" />
                        </View>
                        <Text className="text-gray-400 font-black uppercase tracking-[4px] text-xs text-center leading-relaxed">No historical records found in your environment</Text>
                    </Animated.View>
                }
            />
        </View>
    );
}
