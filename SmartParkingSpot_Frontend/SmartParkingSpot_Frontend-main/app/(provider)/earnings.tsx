import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    TextInput,
    View,
    Modal,
    Alert,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../constants/api';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import BarChart from '../../components/BarChart';
import StatsCard from '../../components/StatsCard';
import LineChart from '../../components/LineChart';

const API = BASE_URL;

export default function ProviderEarningsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [userName, setUserName] = useState('Provider');
    const [data, setData] = useState<any>({
        summary: {
            totalEarnings: 0,
            thisMonth: 0,
            lastMonth: 0,
            growth: 0,
            pendingPayout: 0,
            availableBalance: 0,
        },
        weeklyData: [],
        monthlyTrend: [],
        transactions: [],
    });

    const [withdrawalModalVisible, setWithdrawalModalVisible] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [upiId, setUpiId] = useState('');

    const providerGradient: readonly [string, string, ...string[]] = ['#10B981', '#065F46'];

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', route: '/(provider)/dashboard' },
        { icon: 'business', label: 'My Spaces', route: '/(provider)/spaces' },
        { icon: 'bar-chart', label: 'Earnings', route: '/(provider)/earnings' },
        { icon: 'car', label: 'Live Traffic', route: '/(provider)/traffic' },
        { icon: 'time', label: 'History', route: '/(provider)/history' },
        { icon: 'flash', label: 'EV Station', route: '/(provider)/ev-station' },
        { icon: 'headset', label: 'Support', route: '/(provider)/support' },
    ];

    useEffect(() => {
        const initializeData = async () => {
            try {
                // Load Theme
                const settingsStr = await AsyncStorage.getItem('admin_settings');
                if (settingsStr) {
                    const settings = JSON.parse(settingsStr);
                    setIsDark(settings.darkMode ?? false);
                }

                const name = await AsyncStorage.getItem('userName');
                if (name) setUserName(name);

                await loadEarnings();
            } catch (err) {
                console.error('Initialization failed:', err);
            } finally {
                setLoading(false);
            }
        };
        initializeData();
    }, []);

    const loadEarnings = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/provider/earnings`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error('Earnings load failed:', err);
        }
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount || !upiId) {
            Alert.alert('Error', 'Please enter amount and UPI ID');
            return;
        }

        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Error', 'Invalid amount');
            return;
        }

        if (amount > (data.summary.availableBalance || 0)) {
            Alert.alert('Error', 'Insufficient balance');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/provider/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ amount, upiId })
            });

            const json = await res.json();

            if (res.ok) {
                Alert.alert('Success', 'Withdrawal requested successfully');
                setWithdrawalModalVisible(false);
                setWithdrawAmount('');
                setUpiId('');
                loadEarnings(); // Refresh data
            } else {
                Alert.alert('Error', json.message || 'Withdrawal failed');
            }
        } catch (err) {
            Alert.alert('Error', 'Network error');
        }
    };



    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text className="mt-4 text-emerald-600 font-bold uppercase tracking-widest text-xs">Financial Audit...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Profit Analytics"
                subtitle="Financial Overview"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => setSidebarOpen(true)}
                userName={userName}
                showBackButton={true}
            />

            <UnifiedSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userName={userName}
                userRole="Parking Provider"
                userStatus="Direct Payouts Active"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={providerGradient}
                dark={isDark}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* HERO STAT CARD */}
                <View className="px-5 mt-6">
                    <View className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-emerald-50 shadow-emerald-900/10'} rounded-[40px] p-8 shadow-2xl border items-center`}>
                        <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[3px] mb-2">Portfolio Value</Text>
                        <Text className="text-emerald-500 text-5xl font-black tracking-tighter">?{data.summary.totalEarnings.toLocaleString()}</Text>
                        <View className={`flex-row items-center mt-6 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'} px-4 py-2 rounded-full`}>
                            <Ionicons name="trending-up" size={16} color="#10B981" />
                            <Text className="text-emerald-500 font-black text-xs ml-2">+{data.summary.growth}% vs last month</Text>
                        </View>

                        <View className={`w-full h-[1px] ${isDark ? 'bg-slate-800' : 'bg-gray-100'} my-6`} />

                        <View className="flex-row w-full justify-around mb-6">
                            <View className="items-center">
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Payout Queue</Text>
                                <Text className={`text-xl font-black mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>?{data.summary.pendingPayout.toLocaleString()}</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Avg Daily</Text>
                                <Text className={`text-xl font-black mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>?{(data.summary.thisMonth / 30).toFixed(0)}</Text>
                            </View>
                        </View>

                        <View className="flex-row w-full gap-3">
                            <TouchableOpacity
                                onPress={() => setWithdrawalModalVisible(true)}
                                className="flex-1 bg-emerald-600 py-4 rounded-2xl shadow-lg shadow-emerald-600/30 items-center justify-center"
                            >
                                <Text className="text-white font-black text-[10px] uppercase tracking-wider">Withdraw Earnings</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* EARNINGS STATS GRID */}
                <View className="px-5 mt-8">
                    <View className="flex-row gap-4 mb-4">
                        <StatsCard
                            icon="cash"
                            iconColor="#10B981"
                            iconBgColor={isDark ? "bg-emerald-500/10" : "bg-emerald-50"}
                            label="This Month"
                            value={`?${data.summary.thisMonth.toLocaleString()}`}
                            dark={isDark}
                        />
                        <StatsCard
                            icon="wallet"
                            iconColor="#3B82F6"
                            iconBgColor={isDark ? "bg-blue-500/10" : "bg-blue-50"}
                            label="Last Month"
                            value={`?${data.summary.lastMonth.toLocaleString()}`}
                            dark={isDark}
                        />
                    </View>
                </View>

                {/* WEEKLY REVENUE CHART */}
                <View className="px-5 mt-6">
                    <BarChart
                        data={data.weeklyData}
                        barColor="bg-emerald-500"
                        title="Revenue Distribution (7-Day)"
                        valuePrefix="?"
                        dark={isDark}
                    />
                </View>

                {/* MONTHLY GROWTH LINE CHART */}
                <View className="px-5 mt-6">
                    <LineChart
                        data={data.monthlyTrend}
                        lineColor="#10B981"
                        fillColor="#10B981"
                        title="Growth Trajectory"
                        valuePrefix="?"
                        dark={isDark}
                    />
                </View>

                {/* TRANSACTION FEED */}
                <View className="px-5 mt-10">
                    <View className="flex-row items-center justify-between mb-6 px-2">
                        <Text className={`font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Ledger</Text>
                        <TouchableOpacity>
                            <Text className="text-emerald-500 font-bold text-xs uppercase tracking-widest">Export PDF</Text>
                        </TouchableOpacity>
                    </View>

                    {data.transactions.map((txn: any, index: number) => (
                        <View key={index} className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100 shadow-sm'} rounded-3xl p-5 mb-4 flex-row items-center border`}>
                            <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${txn.status === 'completed' ? (isDark ? 'bg-emerald-500/10' : 'bg-emerald-50') : (isDark ? 'bg-amber-500/10' : 'bg-amber-50')}`}>
                                <Ionicons
                                    name={txn.status === 'completed' ? "receipt" : "hourglass"}
                                    size={24}
                                    color={txn.status === 'completed' ? "#10B981" : "#F59E0B"}
                                />
                            </View>
                            <View className="flex-1">
                                <View className="flex-row items-center">
                                    <Text className={`font-black text-lg tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{txn.id}</Text>
                                    <View className={`ml-2 px-2 py-0.5 rounded-full ${txn.status === 'completed' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                                        <Text className={`text-[8px] font-black uppercase ${txn.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {txn.status}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                                    {txn.date} • Slot {txn.slot}
                                </Text>
                            </View>
                            <View className="items-end">
                                <Text className={`font-black text-xl tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>?{txn.amount}</Text>
                                <Text className="text-gray-500 text-[8px] font-bold">via UPI</Text>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity className={`w-full py-5 rounded-3xl border border-dashed items-center justify-center mt-2 ${isDark ? 'border-slate-800' : 'border-gray-300'}`}>
                        <Text className="text-gray-500 font-black uppercase tracking-widest text-xs">Load More Transactions</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* WITHDRAWAL MODAL */}
            <Modal visible={withdrawalModalVisible} transparent animationType="slide">
                <View className="flex-1 bg-black/60 justify-end">
                    <Animated.View entering={FadeInUp} className={`${isDark ? 'bg-slate-900' : 'bg-white'} rounded-t-[50px] p-8 pb-12`}>
                        <View className={`w-16 h-1.5 rounded-full self-center mb-10 ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`} />

                        <Text className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Withdraw Funds</Text>
                        <Text className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-8">
                            Available Balance: ?{(data.summary.availableBalance || 0).toLocaleString()}
                        </Text>

                        <View className="mb-6">
                            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3 ml-2">Amount</Text>
                            <View className="flex-row items-center">
                                <TextInput
                                    placeholder="Enter amount"
                                    placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
                                    value={withdrawAmount}
                                    onChangeText={setWithdrawAmount}
                                    keyboardType="numeric"
                                    className={`flex-1 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'} rounded-2xl p-5 font-bold border mr-2`}
                                />
                                <TouchableOpacity
                                    onPress={() => setWithdrawAmount((data.summary.availableBalance || 0).toString())}
                                    className="bg-emerald-600 p-5 rounded-2xl justify-center"
                                >
                                    <Text className="text-white font-black text-xs">MAX</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="mb-10">
                            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3 ml-2">UPI ID</Text>
                            <TextInput
                                placeholder="username@upi"
                                placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
                                value={upiId}
                                onChangeText={setUpiId}
                                className={`${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'} rounded-2xl p-5 font-bold border`}
                            />
                        </View>

                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                onPress={() => setWithdrawalModalVisible(false)}
                                className={`flex-1 py-5 rounded-2xl items-center ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}
                            >
                                <Text className={`font-black uppercase tracking-widest text-xs ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleWithdraw}
                                className="flex-1 py-5 bg-emerald-600 rounded-2xl items-center shadow-lg shadow-emerald-600/30"
                            >
                                <Text className="text-white font-black uppercase tracking-widest text-xs">Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

        </View >
    );
}
