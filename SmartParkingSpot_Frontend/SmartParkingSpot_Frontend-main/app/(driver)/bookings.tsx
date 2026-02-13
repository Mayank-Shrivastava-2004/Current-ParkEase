import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import UnifiedHeader from '../../components/UnifiedHeader';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInUp } from 'react-native-reanimated';

import BASE_URL from '../../constants/api';

const API = BASE_URL;

export default function DriverBookingsScreen() {
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        loadSettings();
        fetchBookings();
    }, []);

    const loadSettings = async () => {
        const settingsStr = await AsyncStorage.getItem('admin_settings');
        if (settingsStr) {
            const settings = JSON.parse(settingsStr);
            setIsDark(settings.darkMode ?? false);
        }
    };

    const fetchBookings = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            let backendData = [];

            // 1. Try fetching from Backend
            try {
                const res = await fetch(`${API}/api/driver/bookings`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    backendData = await res.json();
                }
            } catch (e) {
                console.log("Backend fetch failed, using local only");
            }

            // 2. Fetch Local Simulated Bookings
            const localStr = await AsyncStorage.getItem('local_bookings');
            const localData = localStr ? JSON.parse(localStr) : [];

            // 3. Merge (Local first so they appear at top if sorted by date, or you can sort them)
            // Sorting by ID or time might be better, here we just concat
            const allBookings = [...localData, ...backendData];

            // Optional: Sort by startTime descending
            allBookings.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

            setBookings(allBookings);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRebook = (booking: any) => {
        router.push({
            pathname: '/(driver)/book-charging',
            params: {
                id: booking.parkingLot?.id || '1',
                name: booking.parkingLot?.name || 'Charging Station',
                price: booking.parkingLot?.price || '20',
                type: booking.parkingLot?.type || 'Standard',
                location: booking.parkingLot?.location || '0.5km'
            }
        } as any);
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    const handleCancel = (booking: any) => {
        Alert.alert(
            "Cancel Booking",
            "Are you sure you want to cancel this booking?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        // 1. Try Backend Cancel (if API exists)
                        try {
                            const token = await AsyncStorage.getItem('token');
                            await fetch(`${API}/api/driver/bookings/${booking.id}`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${token}` }
                            });
                        } catch (e) {
                            console.log("Backend cancel failed (or not implemented)");
                        }

                        // 2. Update Local State & Storage
                        const updatedBookings = bookings.map(b =>
                            b.id === booking.id ? { ...b, status: 'CANCELLED' } : b
                        );
                        setBookings(updatedBookings);

                        // Update in AsyncStorage local_bookings
                        const localStr = await AsyncStorage.getItem('local_bookings');
                        if (localStr) {
                            let localData = JSON.parse(localStr);
                            localData = localData.map((b: any) =>
                                b.id === booking.id ? { ...b, status: 'CANCELLED' } : b
                            );
                            await AsyncStorage.setItem('local_bookings', JSON.stringify(localData));
                        }

                        Alert.alert("Cancelled", "Booking has been cancelled.");
                    }
                }
            ]
        );
    };

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar style="light" />
            <UnifiedHeader
                title="My Bookings"
                subtitle="History & Upcoming"
                role="driver"
                gradientColors={['#3B82F6', '#1D4ED8']}
                onMenuPress={() => router.back()}
                userName="Driver"
                showBackButton={true}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}>
                <Text className={`font-black text-xl mt-6 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>All Reservations</Text>

                {bookings.length === 0 ? (
                    <View className="items-center py-10">
                        <Ionicons name="calendar-outline" size={64} color="#CBD5E1" />
                        <Text className="text-gray-400 mt-4 font-bold">No bookings found</Text>
                    </View>
                ) : (
                    bookings.map((booking, index) => (
                        <Animated.View
                            key={booking.id}
                            entering={FadeInUp.delay(index * 100)}
                            className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-gray-100 shadow-sm'} p-6 mb-4 rounded-[24px] border`}
                        >
                            <View className="flex-row justify-between items-start mb-4">
                                <View>
                                    <View className="flex-row items-center mb-1">
                                        <Ionicons name="location" size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                                        <Text className={`ml-1 font-black text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {booking.parkingLot?.name || 'Unknown Lot'}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest pl-5">
                                        Slot {booking.parkingSlot?.slotNumber} • {booking.vehicleNumber}
                                    </Text>
                                </View>
                                <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-slate-800' : 'bg-blue-50'}`}>
                                    <Text className={`text-[9px] font-black uppercase ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {booking.status}
                                    </Text>
                                </View>
                            </View>

                            <View className={`h-[1px] w-full my-2 ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`} />

                            <View className="flex-row justify-between items-center mt-2">
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                    {new Date(booking.startTime).toLocaleDateString()}
                                </Text>
                                <View className="flex-row justify-end gap-3 mt-4">
                                    {booking.status !== 'CANCELLED' && (
                                        <TouchableOpacity
                                            onPress={() => handleCancel(booking)}
                                            className={`${isDark ? 'bg-red-900/30' : 'bg-red-50'} px-5 py-3 rounded-xl border ${isDark ? 'border-red-900' : 'border-red-100'}`}
                                        >
                                            <Text className={`${isDark ? 'text-red-400' : 'text-red-600'} text-[10px] font-black uppercase tracking-widest`}>Cancel</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        onPress={() => handleRebook(booking)}
                                        className={`${isDark ? 'bg-blue-900/30' : 'bg-blue-50'} px-5 py-3 rounded-xl border ${isDark ? 'border-blue-900' : 'border-blue-100'}`}
                                    >
                                        <Text className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-[10px] font-black uppercase tracking-widest`}>Book Again</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    ))
                )}
            </ScrollView>
        </View >
    );
}
