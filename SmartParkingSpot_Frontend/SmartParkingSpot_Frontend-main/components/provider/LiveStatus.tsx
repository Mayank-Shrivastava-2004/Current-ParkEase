import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface ActiveBooking {
    id: string;
    user: string;
    vehicle: string;
    slot: string;
    timeRange: string;
    timeLeft: string;
    status: 'parking' | 'departing';
}

export default function LiveStatus() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([
        { id: '1', user: 'Ravi Kumar', vehicle: 'TN09 XX 1234', slot: 'A1', timeRange: '14:00 - 16:00', timeLeft: '45 mins', status: 'parking' },
        { id: '2', user: 'Amit Shah', vehicle: 'MH12 AB 5678', slot: 'A2', timeRange: '15:30 - 17:30', timeLeft: '1h 20m', status: 'parking' },
        { id: '3', user: 'Sneha Patel', vehicle: 'GJ01 CD 9012', slot: 'B1', timeRange: '15:45 - 16:45', timeLeft: '15 mins', status: 'departing' },
    ]);

    const filteredBookings = activeBookings.filter(b =>
        b.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.slot.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleReceipt = (user: string) => {
        Alert.alert("Receipt Sent", `Digital receipt for ${user} has been sent to their registered mobile number.`);
    };

    const handleMessage = (user: string) => {
        Alert.alert("Messaging", `Opening secure chat with ${user}...`);
    };

    const renderBookingCard = ({ item, index }: { item: ActiveBooking; index: number }) => (
        <Animated.View
            entering={FadeInRight.delay(index * 100).springify()}
            className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-50"
        >
            <View className="flex-row justify-between items-start mb-6">
                <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-indigo-50 rounded-2xl justify-center items-center">
                        <Text className="text-indigo-600 font-black text-lg">{item.slot}</Text>
                    </View>
                    <View className="ml-4">
                        <Text className="text-gray-900 font-black text-xl">{item.user}</Text>
                        <Text className="text-gray-400 font-bold text-xs">{item.vehicle}</Text>
                    </View>
                </View>
                <View className={`px-4 py-2 rounded-full ${item.status === 'parking' ? 'bg-green-50' : 'bg-amber-50'}`}>
                    <Text className={`font-black text-[10px] uppercase tracking-widest ${item.status === 'parking' ? 'text-green-600' : 'text-amber-600'}`}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View className="bg-gray-50 rounded-2xl p-4 flex-row justify-between items-center mb-6">
                <View>
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-tighter mb-1">Time Slot</Text>
                    <Text className="text-gray-900 font-bold">{item.timeRange}</Text>
                </View>
                <View className="h-8 w-[1px] bg-gray-200" />
                <View className="items-end">
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-tighter mb-1">Time Left</Text>
                    <Text className="text-indigo-600 font-black">{item.timeLeft}</Text>
                </View>
            </View>

            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={() => handleMessage(item.user)}
                    className="flex-1 bg-indigo-600 py-4 rounded-2xl flex-row justify-center items-center"
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color="white" />
                    <Text className="text-white font-bold ml-2">Message</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleReceipt(item.user)}
                    className="w-14 h-14 bg-gray-100 rounded-2xl justify-center items-center border border-gray-200"
                >
                    <Ionicons name="receipt-outline" size={24} color="#4B5563" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    return (
        <View className="flex-1 px-6 pt-24 pb-32">
            <View className="mb-8">
                <Text className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] mb-1">Real-Time Monitoring</Text>
                <Text className="text-gray-900 text-3xl font-black">Live Traffic</Text>
            </View>

            <View className="flex-row gap-4 mb-8">
                <View className="flex-1 bg-white p-4 rounded-3xl border border-gray-100 items-center">
                    <Text className="text-gray-400 font-bold text-[10px] uppercase mb-1">Occupied</Text>
                    <Text className="text-2xl font-black text-indigo-600">{activeBookings.length}</Text>
                </View>
                <View className="flex-1 bg-white p-4 rounded-3xl border border-gray-100 items-center">
                    <Text className="text-gray-400 font-bold text-[10px] uppercase mb-1">Available</Text>
                    <Text className="text-2xl font-black text-green-500">08</Text>
                </View>
                <View className="flex-1 bg-white p-4 rounded-3xl border border-gray-100 items-center">
                    <Text className="text-gray-400 font-bold text-[10px] uppercase mb-1">Exiting</Text>
                    <Text className="text-2xl font-black text-amber-500">01</Text>
                </View>
            </View>

            {/* Search filter */}
            <View className="bg-gray-50 rounded-2xl px-5 py-3 flex-row items-center mb-6 border border-gray-100">
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                    placeholder="Search by name, vehicle or slot..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 ml-3 text-gray-900 font-bold"
                />
            </View>

            <FlatList
                data={filteredBookings}
                renderItem={renderBookingCard}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <View className="py-20 items-center">
                        <Ionicons name="car-outline" size={64} color="#E5E7EB" />
                        <Text className="text-gray-400 font-bold mt-4">No active parkings found.</Text>
                    </View>
                }
            />
        </View>
    );
}
