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
    TextInput,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../constants/api';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import LineChart from '../../components/LineChart';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

interface RevenueLog {
    transactionId: string;
    dateTime: string;
    providerName: string;
    totalAmount: number;
    adminCommission: number;
    status: string;
}

export default function FinancialsScreen() {
    const router = useRouter();
    const [logs, setLogs] = useState<RevenueLog[]>([]);
    const [trend, setTrend] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [filter, setFilter] = useState('ALL');

    // Settlement State
    const [showSettlement, setShowSettlement] = useState(false);
    const [upiId, setUpiId] = useState('');
    const [settling, setSettling] = useState(false);

    const adminGradient: readonly [string, string, ...string[]] = ['#4F46E5', '#312E81'];

    const loadFinancials = async (p: number, reset = false) => {
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
            const res = await fetch(`${BASE_URL}/api/admin/revenue-logs?page=${p}&size=10&range=${filter}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                if (reset) {
                    setLogs(data.logs);
                    setTrend(data.trend || []);
                } else {
                    setLogs(prev => [...prev, ...data.logs]);
                }
                setTotalPages(data.totalPages);
                setTotalRevenue(data.totalNetRevenue);
            }
        } catch (err) {
            console.error('Failed to load financials', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleSettleLeads = async () => {
        if (!upiId) {
            Alert.alert('Error', 'Please enter a valid UPI ID');
            return;
        }

        setSettling(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/api/admin/settle-revenue?amount=${totalRevenue}&upiId=${upiId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setShowSettlement(false);
                Alert.alert(
                    'Success',
                    `₹${totalRevenue.toLocaleString()} successfully transferred to ${upiId}.`,
                    [{ text: 'OK', onPress: () => loadFinancials(0, true) }]
                );
            } else {
                Alert.alert('Error', 'Settlement failed. Please try again.');
            }
        } catch (err) {
            Alert.alert('Error', 'Network error during settlement.');
        } finally {
            setSettling(false);
        }
    };

    useEffect(() => {
        loadFinancials(0, true);
    }, [filter]);

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ', ' +
            date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
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
                title="Financial Reports"
                subtitle="Revenue Streams"
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
                    { icon: 'cash', label: 'Financials', route: '/(admin)/financials' },
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
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Platform Earnings</Text>
                                    <Text className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{filter === 'ALL' ? 'Lifetime' : filter} Performance</Text>
                                </View>
                                <View className="bg-indigo-500/10 px-3 py-1 rounded-lg">
                                    <Text className="text-indigo-500 text-[10px] font-black">Net Growth</Text>
                                </View>
                            </View>

                            <LineChart
                                data={trend.length > 0 ? trend : [
                                    { label: 'Mon', value: 300 },
                                    { label: 'Tue', value: 450 },
                                    { label: 'Wed', value: 380 },
                                    { label: 'Thu', value: 600 },
                                    { label: 'Fri', value: 550 },
                                    { label: 'Sat', value: 800 },
                                    { label: 'Sun', value: 720 },
                                ]}
                                lineColor="#10B981"
                                fillColor="#10B981"
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

                    {/* TABLE HEADER */}
                    <View className={`flex-row px-5 py-3 mt-4 border-b ${isDark ? 'border-slate-800 bg-slate-950' : 'border-gray-100 bg-gray-50'}`}>
                        <Text className="flex-1 text-[8px] font-black text-gray-400 uppercase">TXN ID</Text>
                        <Text className="flex-[1.5] text-[8px] font-black text-gray-400 uppercase">Provider</Text>
                        <Text className="flex-1 text-[8px] font-black text-gray-400 uppercase text-right">Commission</Text>
                        <Text className="flex-1 text-[8px] font-black text-gray-400 uppercase text-right">Status</Text>
                    </View>

                    {/* DATA LIST MAPPED (Simulated FlatList behavior inside ScrollView for header logic) */}
                    <View className="pb-40">
                        {logs.map((item, index) => (
                            <Animated.View key={item.transactionId} entering={FadeInUp.delay(index * 50)} className={`flex-row items-center px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-gray-50'}`}>
                                <View className="flex-1">
                                    <Text className={`text-[10px] font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.transactionId}</Text>
                                    <Text className="text-[8px] text-gray-400 font-bold">{formatDateTime(item.dateTime)}</Text>
                                </View>
                                <View className="flex-[1.5]">
                                    <Text className={`text-[10px] font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`} numberOfLines={1}>{item.providerName}</Text>
                                    <Text className="text-[8px] text-gray-400">Total: ₹{item.totalAmount}</Text>
                                </View>
                                <Text className="flex-1 text-xs font-black text-emerald-500 text-right">+₹{item.adminCommission}</Text>
                                <View className="flex-1 items-end">
                                    <View className={`px-2 py-0.5 rounded-md ${item.status === 'PAID' ? 'bg-emerald-500/10' : 'bg-orange-500/10'}`}>
                                        <Text className={`text-[8px] font-black ${item.status === 'PAID' ? 'text-emerald-500' : 'text-orange-500'}`}>{item.status}</Text>
                                    </View>
                                </View>
                            </Animated.View>
                        ))}
                        {loadingMore && <ActivityIndicator size="small" color="#6366F1" className="py-4" />}
                    </View>
                </ScrollView>

                {/* TOTAL SUMMARY FOOTER */}
                <View className={`absolute bottom-0 left-0 right-0 ${isDark ? 'bg-slate-900' : 'bg-white'} p-6 border-t ${isDark ? 'border-slate-800' : 'border-gray-100'} shadow-2xl`}>
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px]">Total Net Revenue</Text>
                            <Text className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{totalRevenue.toLocaleString()}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowSettlement(true)}
                            className="bg-indigo-600 px-6 py-3 rounded-2xl shadow-lg shadow-indigo-600/30"
                        >
                            <Text className="text-white font-black text-xs uppercase tracking-widest">Settle Leads</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* SETTLEMENT MODAL */}
            <Modal visible={showSettlement} transparent animationType="fade">
                <View className="flex-1 bg-black/60 justify-center px-6">
                    <Animated.View entering={ZoomIn} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-[40px] p-8 border`}>
                        <View className="items-center mb-6">
                            <View className="w-16 h-1 bg-gray-200 rounded-full mb-6" />
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[5px]">Revenue Settlement</Text>
                        </View>

                        <Text className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{totalRevenue.toLocaleString()}</Text>
                        <Text className="text-gray-500 text-xs mb-8">Initiate funds transfer to your administrative bank account via UPI gateway.</Text>

                        <View className={`mb-8 p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                            <Text className="text-gray-400 text-[8px] font-black uppercase mb-2">Merchant UPI ID</Text>
                            <TextInput
                                placeholder="e.g. admin@upi"
                                placeholderTextColor="#64748b"
                                value={upiId}
                                onChangeText={setUpiId}
                                className={`font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                            />
                        </View>

                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                onPress={() => setShowSettlement(false)}
                                className={`flex-1 py-5 rounded-3xl items-center border ${isDark ? 'border-slate-800' : 'border-gray-200'}`}
                            >
                                <Text className={`font-black text-xs uppercase ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSettleLeads}
                                disabled={settling}
                                className="flex-1 py-5 bg-indigo-600 rounded-3xl items-center shadow-lg shadow-indigo-600/30"
                            >
                                {settling ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text className="text-white font-black text-xs uppercase tracking-widest">Pay Now</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
