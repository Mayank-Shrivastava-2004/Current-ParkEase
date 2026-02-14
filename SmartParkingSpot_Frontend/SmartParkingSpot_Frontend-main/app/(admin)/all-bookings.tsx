import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../constants/api';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import LineChart from '../../components/LineChart';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

interface Booking {
    bookingId: number;
    driverName: string;
    vehicleNumber: string;
    providerName: string;
    spotName: string;
    startTime: string;
    endTime: string;
    paymentStatus: string;
    bookingStatus: string;
}

export default function AllBookingsScreen() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [trend, setTrend] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const adminGradient: readonly [string, string, ...string[]] = ['#4F46E5', '#312E81'];

    const loadBookings = async (p: number, reset = false) => {
        if (p >= totalPages && !reset) return;

        if (reset) {
            setLoading(true);
            setPage(0);
        } else {
            setLoadingMore(true);
        }

        try {
            const settingsStr = await AsyncStorage.getItem('admin_settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                setIsDark(settings.darkMode ?? false);
            }

            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/api/admin/all-bookings?page=${p}&size=10&range=${filter}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                if (reset) {
                    setBookings(data.bookings);
                    setTrend(data.trend || []);
                } else {
                    setBookings(prev => [...prev, ...data.bookings]);
                }
                setTotalPages(data.totalPages);
            }
        } catch (err) {
            console.error('Failed to load bookings', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        loadBookings(0, true);
    }, [filter]);

    const formatDateTime = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' +
            date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'COMPLETED': return 'text-emerald-500';
            case 'ACTIVE':
            case 'ONGOING': return 'text-blue-500';
            case 'CANCELLED': return 'text-rose-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status.toUpperCase()) {
            case 'COMPLETED': return 'bg-emerald-500/10';
            case 'ACTIVE':
            case 'ONGOING': return 'bg-blue-500/10';
            case 'CANCELLED': return 'bg-rose-500/10';
            default: return 'bg-gray-500/10';
        }
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />
            <UnifiedHeader
                title="Master Bookings"
                subtitle="Fleet Records"
                role="admin"
                gradientColors={adminGradient}
                onMenuPress={() => setSidebarOpen(true)}
                userName="Admin"
                showBackButton={true}
            />

            <UnifiedSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userName="Admin User"
                userRole="System Administrator"
                userStatus="Root Access Online"
                menuItems={[
                    { icon: 'grid', label: 'Dashboard', route: '/(admin)/dashboard' },
                    { icon: 'people', label: 'Manage Drivers', route: '/(admin)/drivers' },
                    { icon: 'business', label: 'Manage Providers', route: '/(admin)/providers' },
                    { icon: 'bar-chart', label: 'Analytics', route: '/(admin)/analytics' },
                    { icon: 'list', label: 'All Bookings', route: '/(admin)/all-bookings' },
                ]}
                onLogout={async () => {
                    await AsyncStorage.clear();
                    router.replace('/');
                }}
                gradientColors={adminGradient}
                dark={isDark}
            />

            <View className="flex-1">
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* CHART SECTION */}
                    <View className="px-5 mt-6">
                        <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} p-6 rounded-[32px] border shadow-sm`}>
                            <View className="flex-row justify-between items-center mb-6">
                                <View>
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">System Activity</Text>
                                    <Text className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{filter === 'ALL' ? 'Lifetime' : filter} Bookings</Text>
                                </View>
                                <View className="bg-indigo-500/10 px-3 py-1 rounded-lg">
                                    <Text className="text-indigo-500 text-[10px] font-black">Verified Fleet</Text>
                                </View>
                            </View>

                            <LineChart
                                data={trend.length > 0 ? trend : [
                                    { label: 'Mon', value: 12 },
                                    { label: 'Tue', value: 18 },
                                    { label: 'Wed', value: 15 },
                                    { label: 'Thu', value: 25 },
                                    { label: 'Fri', value: 22 },
                                    { label: 'Sat', value: 35 },
                                    { label: 'Sun', value: 30 },
                                ]}
                                lineColor="#6366F1"
                                fillColor="#6366F1"
                                height={180}
                            />
                        </View>
                    </View>

                    {/* FILTERS */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-16 px-5 mt-6">
                        {['ALL', 'TODAY', 'WEEK', 'MONTH'].map((f) => (
                            <TouchableOpacity
                                key={f}
                                onPress={() => setFilter(f)}
                                className={`px-6 py-2 rounded-full mr-3 border ${filter === f ? 'bg-indigo-600 border-indigo-500' : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200')}`}
                            >
                                <Text className={`text-[10px] font-black uppercase tracking-widest ${filter === f ? 'text-white' : 'text-gray-400'}`}>{f}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* DATA LIST */}
                    <View className="px-5 mt-6 pb-20">
                        <Text className={`font-black text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Fleet Directory</Text>
                        {bookings.map((item, index) => (
                            <Animated.View key={item.bookingId} entering={FadeInUp.delay(index * 50)} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-[32px] p-6 mb-4 border shadow-sm`}>
                                <TouchableOpacity onPress={() => setSelectedBooking(item)}>
                                    <View className="flex-row justify-between items-start mb-4">
                                        <View>
                                            <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Booking ID</Text>
                                            <Text className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>#BK-{item.bookingId}</Text>
                                        </View>
                                        <View className={`px-3 py-1 rounded-full ${getStatusBg(item.bookingStatus)}`}>
                                            <Text className={`text-[9px] font-black uppercase ${getStatusColor(item.bookingStatus)}`}>{item.bookingStatus}</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row gap-4">
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-[8px] font-black uppercase mb-1">Driver</Text>
                                            <Text className={`text-[11px] font-black ${isDark ? 'text-slate-300' : 'text-gray-800'}`} numberOfLines={1}>{item.driverName}</Text>
                                            <Text className="text-[9px] text-gray-500 font-bold">{item.vehicleNumber}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-[8px] font-black uppercase mb-1">Provider/Spot</Text>
                                            <Text className={`text-[11px] font-black ${isDark ? 'text-slate-300' : 'text-gray-800'}`} numberOfLines={1}>{item.providerName}</Text>
                                            <Text className="text-[9px] text-gray-500 font-bold" numberOfLines={1}>{item.spotName}</Text>
                                        </View>
                                    </View>

                                    <View className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-gray-50'} flex-row justify-between items-center`}>
                                        <View className="flex-row items-center">
                                            <Ionicons name="time-outline" size={12} color="#94A3B8" />
                                            <Text className="text-gray-500 text-[9px] font-bold ml-1">{formatDateTime(item.startTime)}</Text>
                                        </View>
                                        <View className={`px-2 py-0.5 rounded-lg ${item.paymentStatus === 'PAID' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                            <Text className={`text-[8px] font-black ${item.paymentStatus === 'PAID' ? 'text-emerald-500' : 'text-rose-500'}`}>{item.paymentStatus}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* RECEIPT MODAL */}
            <Modal visible={!!selectedBooking} transparent animationType="fade">
                <View className="flex-1 bg-black/60 justify-center items-center px-6">
                    <Animated.View entering={ZoomIn} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} w-full rounded-[40px] p-8 border overflow-hidden`}>
                        <View className="items-center mb-6">
                            <View className="w-16 h-1 bg-gray-200 rounded-full mb-6" />
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[5px]">Booking Receipt</Text>
                        </View>

                        {selectedBooking && (
                            <View>
                                <View className="flex-row justify-between mb-8">
                                    <View>
                                        <Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>#BK-{selectedBooking.bookingId}</Text>
                                        <Text className="text-indigo-500 font-bold text-xs">Official Transaction Record</Text>
                                    </View>
                                    <Ionicons name="receipt" size={40} color="#6366F1" opacity={0.2} />
                                </View>

                                <View className="gap-5">
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-[10px] font-black uppercase">Start Session</Text>
                                        <Text className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDateTime(selectedBooking.startTime)}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-[10px] font-black uppercase">End Session</Text>
                                        <Text className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDateTime(selectedBooking.endTime)}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-[10px] font-black uppercase">Driver Info</Text>
                                        <Text className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.driverName}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-[10px] font-black uppercase">Vehicle</Text>
                                        <Text className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.vehicleNumber}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-[10px] font-black uppercase">Provider</Text>
                                        <Text className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.providerName}</Text>
                                    </View>
                                </View>

                                <View className={`mt-8 pt-8 border-t border-dashed ${isDark ? 'border-slate-800' : 'border-gray-200'} items-center`}>
                                    <Text className={`text-xs font-black uppercase tracking-widest ${selectedBooking.paymentStatus === 'PAID' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        Payment {selectedBooking.paymentStatus}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setSelectedBooking(null)}
                                    className="mt-10 bg-gray-900 py-5 rounded-3xl items-center"
                                >
                                    <Text className="text-white font-black uppercase tracking-widest text-xs">Close Records</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
