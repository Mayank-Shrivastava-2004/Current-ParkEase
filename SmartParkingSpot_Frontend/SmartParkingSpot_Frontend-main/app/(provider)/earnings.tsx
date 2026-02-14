import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UnifiedHeader from '../../components/UnifiedHeader';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { BarChart } from 'react-native-chart-kit';
import BASE_URL from '../../constants/api';
import axios from 'axios';

const API = BASE_URL;
const { width } = Dimensions.get('window');

export default function ProviderEarningsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Provider');
    const [data, setData] = useState<any>({
        summary: {
            totalEarnings: 0,
            availableBalance: 0,
            pendingPayout: 0,
            totalWithdrawals: 0,
        },
        weeklyData: [],
        transactions: [],
    });
    const [withdrawalModalVisible, setWithdrawalModalVisible] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [upiId, setUpiId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const providerGradient: readonly [string, string, ...string[]] = ['#059669', '#10B981'];

    const loadEarnings = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await axios.get(`${API}/api/provider/earnings`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 200) {
                setData(res.data);
            }
        } catch (err) {
            console.error('Earnings load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);
            await loadEarnings();
        };
        init();
    }, []);

    const handleWithdrawal = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0) {
            Alert.alert('Invalid Amount', 'Please specify a valid settlement volume.');
            return;
        }
        if (amount > data.summary.availableBalance) {
            Alert.alert('Insufficient Liquidity', 'The requested amount exceeds your available net balance.');
            return;
        }
        if (!upiId.trim()) {
            Alert.alert('Destination Required', 'Please provide a valid UPI identifier for the transfer.');
            return;
        }

        setSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await axios.post(`${API}/api/provider/withdraw`, {
                amount: amount,
                upiId: upiId.trim(),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 200 || res.status === 201) {
                Alert.alert('Protocol Initiated', 'Your withdrawal request has been queued for settlement.');
                setWithdrawalModalVisible(false);
                setWithdrawAmount('');
                loadEarnings();
            }
        } catch (err) {
            Alert.alert('Network Fault', 'Could not establish connection to the settlement gateway.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="small" color="#10B981" />
                <Text className="mt-2 text-emerald-600 font-bold uppercase tracking-[2px] text-[8px]">Syncing Financial Node...</Text>
            </View>
        );
    }

    const maxWeekly = Math.max(...(data.weeklyData?.map((d: any) => d.value) || [1]), 1);

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <UnifiedHeader
                title="Revenue Hub"
                subtitle="FINANCIAL OPS"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => { }}
                userName={userName}
                showBackButton={true}
                compact={true}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                {/* COMPACT REVENUE HERO */}
                <View className="px-4 mt-4">
                    <Animated.View entering={ZoomIn} className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-50 items-center">
                        <Text className="text-gray-400 text-[7px] font-black uppercase tracking-[3px]">Total Ecosystem Yield</Text>
                        <Text className="text-3xl font-black text-gray-900 tracking-tighter mt-1">₹{data.summary.totalEarnings.toFixed(2)}</Text>

                        <View className="flex-row gap-3 mt-6 w-full">
                            <View className="flex-1 items-center bg-emerald-50/20 p-3 rounded-xl border border-emerald-100">
                                <Text className="text-emerald-600 text-base font-black tracking-tight">₹{data.summary.availableBalance.toFixed(2)}</Text>
                                <Text className="text-gray-400 text-[6px] font-black uppercase tracking-widest">Available</Text>
                            </View>
                            <View className="flex-1 items-center bg-amber-50/20 p-3 rounded-xl border border-amber-100">
                                <Text className="text-amber-600 text-base font-black tracking-tight">₹{data.summary.pendingPayout.toFixed(2)}</Text>
                                <Text className="text-gray-400 text-[6px] font-black uppercase tracking-widest">In Transit</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => setWithdrawalModalVisible(true)}
                            activeOpacity={0.9}
                            className="bg-gray-900 mt-5 w-full py-3 rounded-xl items-center"
                        >
                            <Text className="text-white font-black uppercase tracking-[2px] text-[9px]">Execute Settlement</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* VELOCITY TRACK (COMPACT BAR CHART) */}
                <View className="px-4 mt-6">
                    <View className="bg-white rounded-3xl p-5 border border-emerald-50 shadow-sm">
                        <Text className="text-gray-900 text-base font-black tracking-tight mb-4">Velocity Track</Text>
                        <BarChart
                            data={{
                                labels: data.weeklyData?.map((d: any) => d.label) || [],
                                datasets: [{
                                    data: data.weeklyData?.map((d: any) => d.value) || [0, 0, 0, 0, 0, 0, 0]
                                }]
                            }}
                            width={width - 48}
                            height={160}
                            yAxisLabel="₹"
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                                style: { borderRadius: 16 }
                            }}
                            style={{ borderRadius: 16, marginLeft: -16 }}
                            fromZero
                        />
                    </View>
                </View>

                {/* LEDGER ACTIVITY (REAL TRANSACTIONS) */}
                <View className="px-5 mt-6">
                    <Text className="text-gray-900 text-lg font-black tracking-tight ml-2 mb-4">Ledger Activity</Text>
                    {data.transactions?.map((tx: any, i: number) => (
                        <Animated.View key={tx.id || i} entering={FadeInUp.delay(i * 30)}>
                            <TouchableOpacity activeOpacity={0.8} className="bg-white rounded-2xl p-4 mb-3 border border-gray-50 shadow-sm flex-row items-center">
                                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${tx.amount > 0 ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                                    <Ionicons
                                        name={tx.amount > 0 ? "arrow-down-circle" : "arrow-up-circle"}
                                        size={20}
                                        color={tx.amount > 0 ? "#10B981" : "#94A3B8"}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-black text-sm text-gray-900 tracking-tight">{tx.type || 'Booking Settlement'}</Text>
                                    <Text className="text-gray-400 text-[8px] font-bold uppercase mt-1">{tx.date}</Text>
                                </View>
                                <View className="items-end">
                                    <Text className={`text-base font-black ${tx.amount > 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                                        {tx.amount > 0 ? '+' : ''}₹{tx.amount.toFixed(2)}
                                    </Text>
                                    <Text className="text-[7px] font-black uppercase text-gray-300 mt-1">{tx.status}</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}

                    {data.transactions?.length === 0 && (
                        <View className="items-center py-10 bg-white rounded-[32px] border border-gray-50">
                            <Ionicons name="receipt-outline" size={32} color="#E2E8F0" />
                            <Text className="text-gray-300 font-bold uppercase tracking-[2px] text-[8px] mt-4">Clear Audit Logs</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* SETTLEMENT MODAL */}
            <Modal visible={withdrawalModalVisible} transparent animationType="slide" statusBarTranslucent>
                <View className="flex-1 bg-black/80 justify-end">
                    <TouchableOpacity activeOpacity={1} className="flex-1" onPress={() => setWithdrawalModalVisible(false)} />
                    <Animated.View entering={FadeInUp} className="bg-white rounded-t-[40px] p-8 pb-12">
                        <View className="w-12 h-1 rounded-full self-center mb-8 bg-gray-100" />

                        <Text className="text-2xl font-black mb-2 text-gray-900 tracking-tighter">Settlement</Text>
                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-[3px] mb-8">Node Transfer Protocol</Text>

                        <View className="mb-6">
                            <Text className="text-gray-400 text-[8px] font-black uppercase tracking-[3px] mb-3 ml-4">Volume (₹)</Text>
                            <TextInput
                                className="bg-gray-50 rounded-2xl p-5 border border-gray-100 font-black text-2xl text-gray-900"
                                keyboardType="numeric"
                                placeholder="0.00"
                                value={withdrawAmount}
                                onChangeText={setWithdrawAmount}
                            />
                        </View>

                        <View className="mb-8">
                            <Text className="text-gray-400 text-[8px] font-black uppercase tracking-[3px] mb-3 ml-4">UPI Destination</Text>
                            <TextInput
                                className="bg-gray-50 rounded-2xl p-5 border border-gray-100 font-black text-sm text-gray-900"
                                placeholder="user@bank"
                                value={upiId}
                                autoCapitalize="none"
                                onChangeText={setUpiId}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleWithdrawal}
                            disabled={submitting}
                            activeOpacity={0.9}
                            className="bg-emerald-600 py-5 rounded-2xl items-center shadow-lg shadow-emerald-600/20"
                        >
                            {submitting ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text className="text-white font-black uppercase tracking-[2px] text-[10px]">Execute Cloud Transfer</Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
