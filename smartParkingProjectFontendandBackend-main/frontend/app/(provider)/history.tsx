import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import BASE_URL from '../../constants/api';

interface BookingHistory {
    id: string;
    date: string;
    slot: string;
    amount: number;
    customer: string;
    vehicleNumber: string;
    vehicleType: string;
    duration: string;
    status: string;
}

const API = BASE_URL;

export default function ProviderHistoryScreen() {
    const router = useRouter();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const [history, setHistory] = useState<BookingHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await fetch(`${API}/api/provider/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setHistory(data);
            } catch (err) {
                console.error(err);
                Alert.alert('Error', 'Could not load booking history');
            } finally {
                setLoading(false);
            }
        };

        if (token) loadHistory();
    }, [token]);

    const renderItem = ({ item, index }: { item: BookingHistory, index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            className="bg-white rounded-[32px] p-6 mb-4 border border-gray-100 shadow-sm"
        >
            <View className="flex-row justify-between items-start mb-4">
                <View>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Booking ID</Text>
                    <Text className="text-sm font-black text-gray-900">{item.id}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${item.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'}`}>
                    <Text className={`text-[9px] font-black uppercase ${item.status === 'completed' ? 'text-green-700' : 'text-blue-700'}`}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center mb-6">
                <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center">
                    <Ionicons name="person" size={24} color="#6366F1" />
                </View>
                <View className="ml-4">
                    <Text className="text-lg font-black text-gray-900">{item.customer}</Text>
                    <Text className="text-gray-400 text-xs font-bold uppercase">{item.date} • {item.duration}</Text>
                </View>
            </View>

            {/* VEHICLE DETAILS - REQUESTED BY USER */}
            <View className="bg-gray-50 rounded-2xl p-4 flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <Ionicons
                        name={item.vehicleType === 'Car' ? 'car' : item.vehicleType === 'Bike' ? 'bicycle' : 'bus'}
                        size={20}
                        color="#4B5563"
                    />
                    <View className="ml-3">
                        <Text className="text-[9px] text-gray-500 font-bold uppercase">{item.vehicleType}</Text>
                        <Text className="text-sm font-black text-gray-900">{item.vehicleNumber}</Text>
                    </View>
                </View>
                <View className="items-end">
                    <Text className="text-[9px] text-gray-500 font-bold uppercase">Amount</Text>
                    <Text className="text-lg font-black text-indigo-600">₹{item.amount}</Text>
                </View>
            </View>
        </Animated.View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />

            <View className="pt-16 pb-6 px-6 bg-white rounded-b-[40px] shadow-sm">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-100 rounded-xl">
                        <Ionicons name="arrow-back" size={20} color="black" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-black">Booking History</Text>
                    <View className="w-10" />
                </View>
            </View>

            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="mt-20 items-center">
                        <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
                        <Text className="text-gray-400 mt-4 font-bold">No history available</Text>
                    </View>
                }
            />
        </View>
    );
}
