import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ParkingSlot {
    id: string;
    name: string;
    location: string;
    price: number;
    available: boolean;
    distance: string;
    rating: number;
}

export default function DriverDashboardScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'available' | 'bookings'>('available');

    const parkingSlots: ParkingSlot[] = [
        { id: '1', name: 'City Center Hub', location: 'Downtown, Block A', price: 50, available: true, distance: '0.5 km', rating: 4.8 },
        { id: '2', name: 'Grand Mall Plaza', location: 'Shopping District', price: 40, available: true, distance: '1.2 km', rating: 4.5 },
        { id: '3', name: 'Airport Premium', location: 'Terminal 3', price: 100, available: false, distance: '5.0 km', rating: 4.9 },
        { id: '4', name: 'Seaside Parking', location: 'Coastal Road', price: 60, available: true, distance: '3.5 km', rating: 4.2 },
    ];

    const handleBook = (slot: ParkingSlot) => {
        if (!slot.available) return;
        Alert.alert('Booking confirmed', `You booked ${slot.name}`);
    };

    const renderHeader = () => (
        <LinearGradient
            colors={['#00B894', '#00cec9']} // Teal Gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="pt-14 pb-8 px-6 rounded-b-[35px] shadow-lg shadow-teal-900/10 z-10 md:hidden"
        >
            <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-white/20 rounded-2xl justify-center items-center backdrop-blur-sm border border-white/20">
                        <Ionicons name="person" size={24} color="white" />
                    </View>
                    <View>
                        <Text className="text-white/80 text-[10px] font-bold tracking-widest uppercase">Welcome back</Text>
                        <Text className="text-white text-xl font-bold">Alex Driver</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/20 rounded-full justify-center items-center backdrop-blur-sm">
                    <Ionicons name="log-out-outline" size={22} color="white" />
                </TouchableOpacity>
            </View>

            {/* Quick Stats / Wallet Card */}
            <View className="bg-white/10 p-4 rounded-2xl flex-row justify-between items-center border border-white/10">
                <View>
                    <Text className="text-white/90 text-xs font-medium mb-1 uppercase tracking-wide">Wallet Balance</Text>
                    <Text className="text-white text-2xl font-bold">₹ 1,250.00</Text>
                </View>
                <TouchableOpacity className="bg-white px-5 py-2 rounded-xl shadow-sm">
                    <Text className="text-teal-600 font-bold text-xs uppercase">Top Up</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );

    const renderSlotItem = ({ item, index }: { item: ParkingSlot; index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => item.available && handleBook(item)}
                className={`bg-white rounded-3xl p-5 mb-4 shadow-sm shadow-gray-200 border border-gray-50 ${!item.available ? 'opacity-60' : ''}`}
            >
                <View className="flex-row justify-between items-start mb-3">
                    <View>
                        <Text className="text-lg font-bold text-dark-900">{item.name}</Text>
                        <View className="flex-row items-center gap-1 mt-1">
                            <Ionicons name="location" size={12} color="#636E72" />
                            <Text className="text-xs text-gray-500 font-medium">{item.location}</Text>
                        </View>
                    </View>
                    <View className={`px-3 py-1 rounded-full ${item.available ? 'bg-teal-50' : 'bg-red-50'}`}>
                        <Text className={`text-[10px] font-bold uppercase ${item.available ? 'text-teal-600' : 'text-red-500'}`}>
                            {item.available ? '● Available' : '● Full'}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-gray-50">
                    <View className="flex-row items-center gap-3">
                        <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded-lg">
                            <Ionicons name="time-outline" size={14} color="#636E72" />
                            <Text className="text-xs text-gray-600 ml-1 font-medium">{item.distance}</Text>
                        </View>
                        <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-lg">
                            <Ionicons name="star" size={14} color="#FDCB6E" />
                            <Text className="text-xs text-yellow-700 ml-1 font-bold">{item.rating}</Text>
                        </View>
                    </View>
                    <Text className="text-xl font-bold text-teal-600">₹{item.price}<Text className="text-xs text-gray-400 font-normal">/hr</Text></Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View className="flex-1 bg-driver-bg">
            <StatusBar barStyle="light-content" />
            {renderHeader()}

            <View className="flex-1 px-6 pt-6">
                <Text className="text-dark-900 font-bold text-lg mb-4">Nearby Spots</Text>
                <FlatList
                    data={parkingSlots}
                    renderItem={renderSlotItem}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            </View>

            {/* Bottom Floating Menu */}
            <View className="absolute bottom-8 left-6 right-6 bg-white rounded-2xl shadow-xl shadow-gray-200 p-2 flex-row justify-around items-center border border-gray-50">
                <TouchableOpacity
                    onPress={() => setActiveTab('available')}
                    className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'available' ? 'bg-teal-50' : ''}`}
                >
                    <Ionicons name="map" size={24} color={activeTab === 'available' ? '#00B894' : '#B2BEC3'} />
                    {activeTab === 'available' && <Text className="text-[10px] font-bold text-teal-600 mt-1 uppercase">Explore</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('bookings')}
                    className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'bookings' ? 'bg-teal-50' : ''}`}
                >
                    <Ionicons name="ticket" size={24} color={activeTab === 'bookings' ? '#00B894' : '#B2BEC3'} />
                    {activeTab === 'bookings' && <Text className="text-[10px] font-bold text-teal-600 mt-1 uppercase">Bookings</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-1 py-3 items-center rounded-xl"
                >
                    <Ionicons name="settings-outline" size={24} color="#B2BEC3" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
