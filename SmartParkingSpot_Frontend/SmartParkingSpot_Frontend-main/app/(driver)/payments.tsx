import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import UnifiedHeader from '../../components/UnifiedHeader';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../constants/api';

const API = BASE_URL;

export default function DriverPaymentsScreen() {
    const router = useRouter();
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [upiId, setUpiId] = useState('');
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successAmount, setSuccessAmount] = useState(0);

    const [transactions, setTransactions] = useState<any[]>([]);

    React.useEffect(() => {
        loadBalance();
        loadTransactions();
    }, []);

    const loadBalance = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/driver/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                let serverBalance = data.balance || 0;
                setBalance(serverBalance);
                if (data.phone) {
                    setUpiId(`${data.phone}@okaxis`);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadTransactions = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            let serverTxns = [];

            // 1. Fetch Backend Transactions
            try {
                const res = await fetch(`${API}/api/driver/dashboard/transactions`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    serverTxns = await res.json();
                }
            } catch (e) { console.log('Backend Txn fetch failed'); }

            // 2. Fetch Local Simulated Transactions
            const walletStr = await AsyncStorage.getItem('local_wallet');
            let localTxns = [];
            if (walletStr) {
                const walletData = JSON.parse(walletStr);
                localTxns = walletData.transactions || [];
            }

            // 3. Merge & Sort (Newest first)
            const allTxns = [...localTxns, ...serverTxns];
            allTxns.sort((a, b) => b.id - a.id); // Assuming ID is timestamp-based for local, or close enough

            setTransactions(allTxns);
        } catch (err) {
            console.error('Transactions load failed:', err);
        }
    };

    const handleAddFunds = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return Alert.alert('Invalid Amount', 'Please enter a valid amount.');
        }
        if (!upiId || !upiId.includes('@')) {
            return Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g. name@upi).');
        }

        try {
            setIsProcessing(true);
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/driver/dashboard/add-money`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ amount: Number(amount), upiId: upiId })
            });

            const data = await res.json();

            if (res.ok) {
                setBalance(data.newBalance);
                setTransactions(prev => [{
                    id: Date.now(),
                    type: 'CREDIT',
                    title: 'Wallet Top-up',
                    amount: Number(amount),
                    date: 'Just now'
                }, ...prev]);
                setShowAddFunds(false);
                setSuccessAmount(Number(amount));
                setAmount('');
                setShowSuccess(true);
            } else {
                Alert.alert('Error', data.message || 'Failed to add funds.');
            }
        } catch (err) {
            Alert.alert('Error', 'Network error or system failure.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleWithdraw = () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return Alert.alert('Invalid Amount', 'Please enter a valid amount.');
        }
        if (Number(amount) > balance) {
            return Alert.alert('Insufficient Balance', 'You do not have enough funds.');
        }
        if (!upiId.includes('@')) {
            return Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g. user@bank).');
        }

        setBalance(prev => prev - Number(amount));
        setTransactions(prev => [{ id: Date.now(), type: 'DEBIT', title: `Withdraw to ${upiId}`, amount: Number(amount), date: 'Just now' }, ...prev]);
        setShowWithdraw(false);
        setAmount('');
        setUpiId('');
        Alert.alert('Success', `₹${amount} withdrawn to ${upiId} successfully!`);
    };

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar style="dark" />
            <UnifiedHeader
                title="Smart Wallet"
                subtitle="Transactions"
                role="driver"
                gradientColors={['#3B82F6', '#1D4ED8']}
                onMenuPress={() => router.back()}
                userName="Driver"
                showBackButton={true}
            />

            <ScrollView className="px-5">
                {/* WALLET CARD */}
                <View className="bg-blue-600 rounded-[32px] p-8 mt-6 shadow-xl shadow-blue-500/30">
                    <Text className="text-blue-100 font-bold uppercase tracking-widest text-xs mb-2">Total Balance</Text>
                    <Text className="text-white text-4xl font-black">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                    <View className="flex-row mt-6 gap-3">
                        <TouchableOpacity onPress={() => setShowAddFunds(true)} className="bg-white/20 px-6 py-3 rounded-xl flex-1 items-center active:bg-white/30">
                            <Text className="text-white font-bold text-xs uppercase tracking-widest">+ Add Funds</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowWithdraw(true)} className="bg-white px-6 py-3 rounded-xl flex-1 items-center active:bg-gray-100">
                            <Text className="text-blue-600 font-bold text-xs uppercase tracking-widest">Withdraw</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* MODALS FOR ADD FUNDS / WITHDRAW */}
                <Modal visible={showAddFunds} transparent animationType="slide">
                    <View className="flex-1 bg-black/50 justify-end">
                        <View className="bg-white rounded-t-[32px] p-8">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="font-black text-xl text-gray-900">Add Funds</Text>
                                <TouchableOpacity onPress={() => setShowAddFunds(false)}>
                                    <Ionicons name="close-circle" size={30} color="#CBD5E1" />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-2xl text-2xl font-black text-gray-900 mb-4"
                                placeholder="Amount (₹)"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                            />
                            <TextInput
                                className="bg-gray-50 p-4 rounded-2xl text-lg font-bold text-gray-900 mb-6"
                                placeholder="Enter UPI ID (e.g. name@upi)"
                                value={upiId}
                                onChangeText={setUpiId}
                                autoCapitalize="none"
                            />
                            <View className="flex-row gap-3 mb-6">
                                {[100, 500, 1000].map(val => (
                                    <TouchableOpacity key={val} onPress={() => setAmount(val.toString())} className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                                        <Text className="text-blue-600 font-bold">+₹{val}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TouchableOpacity
                                onPress={handleAddFunds}
                                disabled={isProcessing}
                                className={`${isProcessing ? 'bg-blue-400' : 'bg-blue-600'} py-4 rounded-2xl items-center shadow-lg shadow-blue-600/30 flex-row justify-center space-x-2`}
                            >
                                {isProcessing && <View className="mr-2"><Text>🔄</Text></View>}
                                <Text className="text-white font-bold uppercase tracking-widest text-xs">
                                    {isProcessing ? 'Processing Transaction...' : 'Confirm & Pay Now'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* SUCCESS MODAL */}
                <Modal visible={showSuccess} transparent animationType="fade">
                    <View className="flex-1 bg-black/60 justify-center items-center px-8">
                        <View className="bg-white rounded-[40px] p-8 w-full items-center">
                            <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-6">
                                <Ionicons name="checkmark-circle" size={50} color="#10B981" />
                            </View>
                            <Text className="text-2xl font-black text-gray-900 mb-2">Success!</Text>
                            <Text className="text-gray-500 text-center mb-6">₹{successAmount.toLocaleString()} has been added to your smart wallet.</Text>

                            <TouchableOpacity
                                onPress={() => setShowSuccess(false)}
                                className="bg-gray-900 w-full py-4 rounded-2xl items-center"
                            >
                                <Text className="text-white font-bold uppercase tracking-widest text-xs">Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal visible={showWithdraw} transparent animationType="slide">
                    <View className="flex-1 bg-black/50 justify-end">
                        <View className="bg-white rounded-t-[32px] p-8">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="font-black text-xl text-gray-900">Withdraw Funds</Text>
                                <TouchableOpacity onPress={() => setShowWithdraw(false)}>
                                    <Ionicons name="close-circle" size={30} color="#CBD5E1" />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-2xl text-2xl font-black text-gray-900 mb-4"
                                placeholder="Amount (₹)"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                            />
                            <TextInput
                                className="bg-gray-50 p-4 rounded-2xl text-lg font-bold text-gray-900 mb-6"
                                placeholder="Enter UPI ID (e.g. name@upi)"
                                value={upiId}
                                onChangeText={setUpiId}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={handleWithdraw} className="bg-gray-900 py-4 rounded-2xl items-center">
                                <Text className="text-white font-bold uppercase tracking-widest text-xs">Transfer to Bank</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* TRANSACTION HISTORY */}
                <Text className="font-black text-xl mt-8 mb-4 text-gray-900">Recent Transactions</Text>
                {transactions.map((txn) => (
                    <View key={txn.id} className="bg-white p-5 mb-3 rounded-3xl border border-gray-100 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${txn.type === 'CREDIT' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                <Ionicons name={txn.type === 'CREDIT' ? 'arrow-down' : 'arrow-up'} size={20} color={txn.type === 'CREDIT' ? '#10B981' : '#EF4444'} />
                            </View>
                            <View>
                                <Text className="font-bold text-gray-900">{txn.title}</Text>
                                <Text className="text-gray-400 text-[10px] font-bold uppercase">{txn.date}</Text>
                            </View>
                        </View>
                        <Text className={`font-black text-lg ${txn.type === 'CREDIT' ? 'text-emerald-500' : 'text-gray-900'}`}>
                            {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount}
                        </Text>
                    </View>
                ))}

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
