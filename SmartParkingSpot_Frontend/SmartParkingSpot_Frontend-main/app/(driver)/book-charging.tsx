import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import UnifiedHeader from '../../components/UnifiedHeader';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../constants/api';

export default function BookChargingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id, name, price, type, location } = params;

    const [duration, setDuration] = useState(1);
    const [selectedVehicle, setSelectedVehicle] = useState('car');
    const [selectedDate, setSelectedDate] = useState('Today');
    const [selectedTime, setSelectedTime] = useState('09-10 AM');
    const [chargingSlot, setChargingSlot] = useState('Slow (L1)');
    const [loading, setLoading] = useState(false);
    const [userBalance, setUserBalance] = useState(0);

    const pricePerHour = Number(price) || 20;
    const slots = [
        { id: 'Slow (L1)', label: 'Slot A - Slow (L1)', time: '7kW • AC', color: '#10B981', bg: 'bg-emerald-50', extra: 0 },
        { id: 'Medium (L2)', label: 'Slot B - Medium (L2)', time: '22kW • AC', color: '#F59E0B', bg: 'bg-amber-50', extra: 20 },
        { id: 'Rapid (L3)', label: 'Slot C - Rapid (L3)', time: '50kW • DC', color: '#3B82F6', bg: 'bg-blue-50', extra: 40 },
        { id: 'Super (S)', label: 'Slot S - Super Sonic', time: '150kW • DC', color: '#EF4444', bg: 'bg-rose-50', extra: 70 },
    ];

    const selectedSlotInfo = slots.find(s => s.id === chargingSlot);
    const extraCost = selectedSlotInfo ? selectedSlotInfo.extra : 0;
    const totalCost = (duration * pricePerHour) + extraCost;

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/api/driver/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                let serverBalance = data.balance || 0;
                setUserBalance(serverBalance);
            }
        } catch (err) {
            console.error("Failed to fetch balance", err);
        }
    };

    const handleConfirmBooking = async () => {
        if (totalCost > userBalance) {
            Alert.alert("Insufficient Balance", `Your wallet balance is ₹${userBalance}. Total cost is ₹${totalCost}. Please top up.`);
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');

            // Construct Date Object
            const startTimeDate = new Date();
            if (selectedDate === 'Tomorrow') {
                startTimeDate.setDate(startTimeDate.getDate() + 1);
            }

            // Parse time string "09-10 AM" -> 9
            const timeParts = selectedTime.split(' '); // ["09-10", "AM"]
            const hourRange = timeParts[0]; // "09-10"
            const ampm = timeParts[1]; // "AM"
            let startHour = parseInt(hourRange.split('-')[0]); // 9

            if (ampm === 'PM' && startHour !== 12) startHour += 12;
            if (ampm === 'AM' && startHour === 12) startHour = 0;

            startTimeDate.setHours(startHour, 0, 0, 0);

            const endTimeDate = new Date(startTimeDate);
            endTimeDate.setHours(endTimeDate.getHours() + duration);

            const payload = {
                parkingLotId: id, // Using the ID passed from params
                vehicleNumber: `${selectedVehicle.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`, // Simulating a vehicle number if not selected
                startTime: startTimeDate.toISOString(),
                endTime: endTimeDate.toISOString(),
                totalAmount: totalCost,
                status: 'CONFIRMED',
                slotType: chargingSlot
            };

            const res = await fetch(`${BASE_URL}/api/driver/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                Alert.alert(
                    "Booking Confirmed!",
                    `Slot: ${chargingSlot}\nVehicle: ${selectedVehicle}\nTime: ${selectedDate} ${selectedTime}\nAmount Deducted: ₹${totalCost}`,
                    [
                        {
                            text: "View My Bookings",
                            onPress: () => router.push('/(driver)/bookings')
                        }
                    ]
                );
            } else {
                const txt = await res.text();
                console.log("Booking failed on backend:", txt);

                // Create a simulated booking object that matches the structure expected by bookings.tsx
                const simulatedBooking = {
                    id: Date.now().toString(),
                    parkingLot: {
                        id: id,
                        name: name || 'Charging Station',
                        type: type || 'Standard',
                        location: location || '0.5km',
                        price: price || '20'
                    },
                    parkingSlot: { slotNumber: chargingSlot },
                    vehicleNumber: payload.vehicleNumber,
                    startTime: payload.startTime,
                    endTime: payload.endTime,
                    status: 'CONFIRMED',
                    totalAmount: totalCost
                };

                // Save to local storage
                const existingStr = await AsyncStorage.getItem('local_bookings');
                const existing = existingStr ? JSON.parse(existingStr) : [];
                existing.push(simulatedBooking);
                await AsyncStorage.setItem('local_bookings', JSON.stringify(existing));

                // --- NEW: Handle Local Wallet Deduction & Transaction ---
                const walletStr = await AsyncStorage.getItem('local_wallet');
                let walletData = walletStr ? JSON.parse(walletStr) : { deducted: 0, transactions: [] };

                // 1. Deduct Amount (Track how much to subtract from server balance)
                walletData.deducted = (walletData.deducted || 0) + totalCost;

                const newTransaction = {
                    id: Date.now(),
                    type: 'DEBIT',
                    title: `EV Charging: ${name || 'Station'}`,
                    amount: totalCost,
                    date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
                    isLocal: true
                };
                walletData.transactions = [newTransaction, ...(walletData.transactions || [])];

                await AsyncStorage.setItem('local_wallet', JSON.stringify(walletData));
                // -------------------------------------------------------

                Alert.alert(
                    "Booking Confirmed (Simulation)",
                    `The backend couldn't find Station ID ${id} (Mock Data). \n\nBalance Deducted: ₹${totalCost}\n\nDetails:\nSlot: ${chargingSlot}`,
                    [
                        {
                            text: "View My Bookings",
                            onPress: () => router.push('/(driver)/bookings')
                        }
                    ]
                );
            }
        } catch (err) {
            Alert.alert("Network Error", "Could not connect to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar style="dark" />
            <UnifiedHeader
                title="Secure Slot"
                subtitle="CHARGING RESERVATION"
                role="driver"
                gradientColors={['#0F172A', '#1E293B']}
                onMenuPress={() => router.back()}
                userName="Driver"
                showBackButton={true}
                compact={true}
            />

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>

                {/* STATION INFO CARD */}
                <Animated.View entering={FadeInUp.delay(100)} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row justify-between items-start">
                        <View>
                            <View className="bg-emerald-50 self-start px-3 py-1 rounded-full mb-2">
                                <Text className="text-emerald-600 font-black text-[9px] uppercase tracking-widest">{type || 'Standard'} Station</Text>
                            </View>
                            <Text className="text-2xl font-black text-slate-900 mb-1">{name || 'Charging Station'}</Text>
                            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wide">{location || '0.5km Away'}</Text>
                        </View>
                        <View className="bg-blue-50 w-14 h-14 rounded-2xl items-center justify-center border border-blue-100">
                            <Ionicons name="flash" size={24} color="#3B82F6" />
                        </View>
                    </View>
                </Animated.View>

                {/* SCHEDULE SELECTION */}
                <Animated.View entering={FadeInUp.delay(150)} className="mb-8">
                    <Text className="text-slate-900 font-black text-lg mb-4">Schedule</Text>
                    <View className="flex-row gap-4 mb-4">
                        {['Today', 'Tomorrow'].map((day) => (
                            <TouchableOpacity
                                key={day}
                                onPress={() => setSelectedDate(day)}
                                className={`flex-1 p-4 rounded-2xl border ${selectedDate === day ? 'bg-slate-900 border-slate-900' : 'bg-white border-gray-100'}`}
                            >
                                <Text className={`text-center font-bold ${selectedDate === day ? 'text-white' : 'text-slate-500'}`}>{day}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View className="flex-row gap-4">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                            {['09-10 AM', '10-11 AM', '11-12 PM', '12-01 PM', '01-02 PM', '02-03 PM', '03-04 PM', '04-05 PM', '05-06 PM', '06-07 PM', '07-08 PM'].map((time) => (
                                <TouchableOpacity
                                    key={time}
                                    onPress={() => setSelectedTime(time)}
                                    className={`px-5 py-3 rounded-2xl border ${selectedTime === time ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-100'}`}
                                >
                                    <Text className={`text-center font-bold whitespace-nowrap ${selectedTime === time ? 'text-white' : 'text-slate-500'}`}>{time}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Animated.View>


                {/* CHARGING SLOT SELECTION */}
                <Animated.View entering={FadeInUp.delay(200)} className="mb-8">
                    <Text className="text-slate-900 font-black text-lg mb-4">Select Charging Slot</Text>
                    <View className="gap-3">
                        {slots.map((slot) => (
                            <TouchableOpacity
                                key={slot.id}
                                onPress={() => setChargingSlot(slot.id)}
                                activeOpacity={0.7}
                                style={{
                                    backgroundColor: chargingSlot === slot.id ? 'white' : 'white',
                                    borderColor: chargingSlot === slot.id ? '#0F172A' : '#F8FAFC',
                                    borderWidth: chargingSlot === slot.id ? 2 : 1,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: chargingSlot === slot.id ? 0.1 : 0,
                                    shadowRadius: 3.84,
                                    elevation: chargingSlot === slot.id ? 5 : 0
                                }}
                                className={`flex-row items-center p-4 rounded-2xl`}
                            >
                                <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${slot.bg}`}>
                                    <Ionicons name="flash" size={18} color={slot.color} />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row justify-between items-center">
                                        <Text className={`font-bold text-sm ${chargingSlot === slot.id ? 'text-slate-900' : 'text-slate-500'}`}>{slot.label}</Text>
                                        {slot.extra > 0 && (
                                            <View className="bg-slate-100 px-2 py-0.5 rounded-md">
                                                <Text className="text-[10px] font-bold text-slate-500">+₹{slot.extra}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{slot.time}</Text>
                                </View>
                                {chargingSlot === slot.id && (
                                    <Ionicons name="checkmark-circle" size={24} color="#0F172A" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* VEHICLE SELECTION */}
                <Animated.View entering={FadeInUp.delay(250)} className="mb-8">
                    <Text className="text-slate-900 font-black text-lg mb-4">Select Vehicle</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-4">
                        {[
                            { id: 'car', label: 'Electric Car', icon: 'car' },
                            { id: 'bike', label: 'E-Bike', icon: 'bicycle' },
                            { id: 'truck', label: 'E-Truck', icon: 'bus' },
                        ].map((v) => (
                            <TouchableOpacity
                                key={v.id}
                                onPress={() => setSelectedVehicle(v.id)}
                                className={`p-6 rounded-[24px] border-2 items-center w-32 ${selectedVehicle === v.id ? 'bg-slate-900 border-slate-900' : 'bg-white border-gray-100'}`}
                            >
                                <Ionicons name={v.icon as any} size={32} color={selectedVehicle === v.id ? 'white' : '#94A3B8'} />
                                <Text className={`font-bold mt-2 text-xs ${selectedVehicle === v.id ? 'text-white' : 'text-slate-400'}`}>{v.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* DURATION SLIDER */}
                <Animated.View entering={FadeInUp.delay(300)} className="mb-8">
                    <Text className="text-slate-900 font-black text-lg mb-4">Duration</Text>
                    <View className="bg-white p-6 rounded-[32px] border border-gray-100 flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={() => setDuration(Math.max(1, duration - 1))}
                            className="w-12 h-12 bg-slate-100 rounded-2xl items-center justify-center"
                        >
                            <Ionicons name="remove" size={24} color="#0F172A" />
                        </TouchableOpacity>

                        <View className="items-center">
                            <Text className="text-4xl font-black text-slate-900">{duration}</Text>
                            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">HOURS</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => setDuration(Math.min(24, duration + 1))}
                            className="w-12 h-12 bg-slate-100 rounded-2xl items-center justify-center"
                        >
                            <Ionicons name="add" size={24} color="#0F172A" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

            </ScrollView>

            {/* BOTTOM CHECKOUT BAR */}
            <Animated.View entering={FadeInDown.duration(500)} className="absolute bottom-0 left-0 right-0 bg-white pt-6 pb-10 px-6 rounded-t-[40px] shadow-2xl border-t border-gray-100">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Amount</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-slate-900 text-3xl font-black">₹{totalCost}</Text>
                            <Text className="text-slate-400 text-sm font-bold ml-1">.00</Text>
                        </View>
                    </View>
                    <View className="items-end">
                        <Text className="text-emerald-500 font-bold text-xs uppercase tracking-widest">{duration} Hours</Text>
                        <Text className="text-slate-400 text-[10px] font-bold">@ ₹{pricePerHour}/hr</Text>
                        <Text className="text-blue-500 text-[9px] font-bold uppercase mt-1">
                            Balance: ₹{userBalance}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleConfirmBooking}
                    disabled={loading}
                    className={`${loading ? 'bg-slate-400' : 'bg-slate-900'} w-full py-5 rounded-[28px] items-center shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-black text-lg uppercase tracking-widest">Confirm & Pay</Text>
                    )}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
