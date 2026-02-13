import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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
import BASE_URL from '../../constants/api';

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
    const [selectedBooking, setSelectedBooking] =
        useState<BookingRecord | null>(null);

    const [history, setHistory] = useState<BookingRecord[]>([]);
    const [loading, setLoading] = useState(true);

    /* ================= LOAD HISTORY ================= */
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(
                `${BASE_URL}/api/provider/bookings/history`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch booking history');
            }

            const data = await res.json();
            setHistory(data);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Unable to load booking history');
        } finally {
            setLoading(false);
        }
    };

    /* ================= FILTER ================= */
    const filteredHistory = history.filter(h =>
        h.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    /* ================= DETAILS MODAL ================= */
    const renderDetailsModal = () => (
        <Modal visible={!!selectedBooking} transparent animationType="slide">
            <View className="flex-1 justify-end bg-black/50">
                <Animated.View
                    entering={FadeInUp}
                    className="bg-white rounded-t-[40px] p-8 pb-12"
                >
                    <View className="flex-row justify-between items-center mb-8">
                        <Text className="text-2xl font-black text-gray-900">
                            Booking Details
                        </Text>
                        <TouchableOpacity onPress={() => setSelectedBooking(null)}>
                            <Ionicons name="close-circle" size={32} color="#D1D5DB" />
                        </TouchableOpacity>
                    </View>

                    {selectedBooking && (
                        <View>
                            <View className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100">
                                <DetailRow label="User" value={selectedBooking.user} />
                                <DetailRow label="Vehicle" value={selectedBooking.vehicle} />
                                <DetailRow label="Slot" value={selectedBooking.slot} highlight />
                                <DetailRow
                                    label="Status"
                                    value={selectedBooking.status}
                                    status={selectedBooking.status}
                                />
                                <DetailRow label="Amount" value={selectedBooking.amount} bold />
                                <DetailRow label="Date" value={selectedBooking.date} />
                                <DetailRow label="Time" value={selectedBooking.timeRange} />
                            </View>

                            <TouchableOpacity
                                onPress={() => {
                                    Alert.alert(
                                        'Invoice Downloaded',
                                        'The invoice has been saved to your downloads.'
                                    );
                                    setSelectedBooking(null);
                                }}
                                className="bg-indigo-600 py-5 rounded-3xl items-center flex-row justify-center gap-2"
                            >
                                <Ionicons name="download-outline" size={20} color="white" />
                                <Text className="text-white font-black uppercase">
                                    Download Invoice
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );

    /* ================= UI ================= */
    return (
        <View className="flex-1 px-6 pt-24 pb-32">
            <View className="mb-8 flex-row justify-between items-end">
                <View>
                    <Text className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] mb-1">
                        Transaction Logs
                    </Text>
                    <Text className="text-gray-900 text-3xl font-black">
                        Bookings
                    </Text>
                </View>
                <TouchableOpacity className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                    <Ionicons name="filter-outline" size={20} color="#6C5CE7" />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="bg-gray-50 rounded-2xl px-5 py-3 flex-row items-center mb-6 border border-gray-100">
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                    placeholder="Search by name or vehicle..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 ml-3 text-gray-900 font-bold"
                />
            </View>

            {/* Table */}
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
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        >
                            {!loading && filteredHistory.length === 0 && (
                                <View className="py-20 items-center">
                                    <Ionicons name="receipt-outline" size={64} color="#E5E7EB" />
                                    <Text className="text-gray-400 font-bold mt-4">
                                        No booking records found.
                                    </Text>
                                </View>
                            )}

                            {filteredHistory.map((item, index) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => setSelectedBooking(item)}
                                >
                                    <Animated.View
                                        entering={FadeInDown.delay(index * 80)}
                                        className={`flex-row px-6 py-5 items-center border-b border-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'
                                            }`}
                                    >
                                        <Text className="w-24 text-sm font-bold text-gray-800">
                                            {item.user}
                                        </Text>
                                        <Text className="w-32 text-xs font-medium text-gray-500">
                                            {item.vehicle}
                                        </Text>
                                        <View className="w-16">
                                            <View className="bg-indigo-50 self-start px-2 py-1 rounded-md">
                                                <Text className="text-[10px] font-black text-indigo-600">
                                                    {item.slot}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="w-24">
                                            <Text
                                                className={`text-[10px] font-black uppercase ${item.status === 'Completed'
                                                    ? 'text-green-500'
                                                    : item.status === 'Cancelled'
                                                        ? 'text-red-500'
                                                        : 'text-amber-500'
                                                    }`}
                                            >
                                                {item.status}
                                            </Text>
                                        </View>
                                        <Text className="w-20 text-xs font-black text-gray-900 text-right">
                                            {item.amount}
                                        </Text>
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

/* ================= HELPER ================= */

function DetailRow({
    label,
    value,
    bold,
    highlight,
    status,
}: {
    label: string;
    value: string;
    bold?: boolean;
    highlight?: boolean;
    status?: string;
}) {
    return (
        <View className="flex-row justify-between mb-4">
            <Text className="text-gray-400 font-bold uppercase text-[10px]">
                {label}
            </Text>
            <Text
                className={`font-black ${highlight
                    ? 'text-indigo-600'
                    : status === 'Completed'
                        ? 'text-green-500'
                        : status === 'Cancelled'
                            ? 'text-red-500'
                            : 'text-gray-900'
                    } ${bold ? 'text-lg' : ''}`}
            >
                {value}
            </Text>
        </View>
    );
}
