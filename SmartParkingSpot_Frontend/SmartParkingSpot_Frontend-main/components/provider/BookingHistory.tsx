import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface BookingRecord {
    id: string;
    user: string;
    vehicle: string;
    slot: string;
    timeRange: string;
    status: 'Completed' | 'Cancelled' | 'No Show';
    amount: string;
    date: string;
}

export default function BookingHistory() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

    const history: BookingRecord[] = [
        { id: '1', user: 'Ravi', vehicle: 'TN09XX 1234', slot: 'A1', timeRange: '14:00 - 16:00', status: 'Completed', amount: '₹150', date: '02 Feb 2026' },
        { id: '2', user: 'Sunil', vehicle: 'KA01YY 4321', slot: 'B2', timeRange: '10:00 - 12:00', status: 'Completed', amount: '₹120', date: '02 Feb 2026' },
        { id: '3', user: 'Priya', vehicle: 'DL04ZZ 7890', slot: 'A3', timeRange: '09:00 - 11:00', status: 'Cancelled', amount: '₹0', date: '01 Feb 2026' },
        { id: '4', user: 'Karthik', vehicle: 'MH02AA 1122', slot: 'E1', timeRange: '13:00 - 15:00', status: 'Completed', amount: '₹250', date: '01 Feb 2026' },
        { id: '5', user: 'Ananya', vehicle: 'AP03BB 3344', slot: 'A1', timeRange: '17:00 - 18:30', status: 'No Show', amount: '₹40', date: '31 Jan 2026' },
    ];

    const filteredHistory = history.filter(h =>
        h.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderDetailsModal = () => (
        <Modal
            visible={!!selectedBooking}
            transparent
            animationType="slide"
        >
            <View className="flex-1 justify-end bg-black/50">
                <Animated.View entering={FadeInUp} className="bg-white rounded-t-[40px] p-8 pb-12">
                    <View className="flex-row justify-between items-center mb-8">
                        <Text className="text-2xl font-black text-gray-900">Booking Details</Text>
                        <TouchableOpacity onPress={() => setSelectedBooking(null)}>
                            <Ionicons name="close-circle" size={32} color="#D1D5DB" />
                        </TouchableOpacity>
                    </View>

                    {selectedBooking && (
                        <View>
                            <View className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100">
                                <View className="flex-row justify-between mb-4">
                                    <Text className="text-gray-400 font-bold uppercase text-[10px]">User</Text>
                                    <Text className="text-gray-900 font-black">{selectedBooking.user}</Text>
                                </View>
                                <View className="flex-row justify-between mb-4">
                                    <Text className="text-gray-400 font-bold uppercase text-[10px]">Vehicle</Text>
                                    <Text className="text-gray-900 font-black">{selectedBooking.vehicle}</Text>
                                </View>
                                <View className="flex-row justify-between mb-4">
                                    <Text className="text-gray-400 font-bold uppercase text-[10px]">Slot</Text>
                                    <Text className="text-indigo-600 font-black">{selectedBooking.slot}</Text>
                                </View>
                                <View className="flex-row justify-between mb-4">
                                    <Text className="text-gray-400 font-bold uppercase text-[10px]">Status</Text>
                                    <Text className={`font-black uppercase text-[10px] ${selectedBooking.status === 'Completed' ? 'text-green-500' : 'text-red-500'
                                        }`}>{selectedBooking.status}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-400 font-bold uppercase text-[10px]">Amount</Text>
                                    <Text className="text-gray-900 font-black text-lg">{selectedBooking.amount}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => {
                                    Alert.alert("Invoice Downloaded", "The invoice has been saved to your downloads.");
                                    setSelectedBooking(null);
                                }}
                                className="bg-indigo-600 py-5 rounded-3xl items-center flex-row justify-center gap-2"
                            >
                                <Ionicons name="download-outline" size={20} color="white" />
                                <Text className="text-white font-black uppercase">Download Invoice</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );

    return (
        <View className="flex-1 px-6 pt-24 pb-32">
            <View className="mb-8 flex-row justify-between items-end">
                <View>
                    <Text className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] mb-1">Transaction Logs</Text>
                    <Text className="text-gray-900 text-3xl font-black">Bookings</Text>
                </View>
                <TouchableOpacity className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                    <Ionicons name="filter-outline" size={20} color="#6C5CE7" />
                </TouchableOpacity>
            </View>

            <View className="bg-gray-50 rounded-2xl px-5 py-3 flex-row items-center mb-6 border border-gray-100">
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                    placeholder="Search by name or vehicle..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 ml-3 text-gray-900 font-bold"
                />
            </View>

            <View className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex-1">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View>
                        {/* Header */}
                        <View className="flex-row bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                            <Text className="w-24 text-[10px] font-black uppercase text-gray-400">User</Text>
                            <Text className="w-32 text-[10px] font-black uppercase text-gray-400">Vehicle</Text>
                            <Text className="w-16 text-[10px] font-black uppercase text-gray-400">Slot</Text>
                            <Text className="w-24 text-[10px] font-black uppercase text-gray-400">Status</Text>
                            <Text className="w-20 text-[10px] font-black uppercase text-gray-400 text-right">Fee</Text>
                        </View>

                        {/* Rows */}
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                            {filteredHistory.map((item, index) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => setSelectedBooking(item)}
                                >
                                    <Animated.View
                                        entering={FadeInDown.delay(index * 100)}
                                        className={`flex-row px-6 py-5 items-center border-b border-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`}
                                    >
                                        <Text className="w-24 text-sm font-bold text-gray-800">{item.user}</Text>
                                        <Text className="w-32 text-xs font-medium text-gray-500">{item.vehicle}</Text>
                                        <View className="w-16">
                                            <View className="bg-indigo-50 self-start px-2 py-1 rounded-md">
                                                <Text className="text-[10px] font-black text-indigo-600">{item.slot}</Text>
                                            </View>
                                        </View>
                                        <View className="w-24">
                                            <Text className={`text-[10px] font-black uppercase ${item.status === 'Completed' ? 'text-green-500' :
                                                item.status === 'Cancelled' ? 'text-red-500' : 'text-amber-500'
                                                }`}>{item.status}</Text>
                                        </View>
                                        <Text className="w-20 text-xs font-black text-gray-900 text-right">{item.amount}</Text>
                                    </Animated.View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </ScrollView>
            </View>
            {renderDetailsModal()}
        </View>
    );
}
