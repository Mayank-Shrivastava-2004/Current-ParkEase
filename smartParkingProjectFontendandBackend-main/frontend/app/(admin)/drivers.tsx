import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import BASE_URL from '../../constants/api';
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Driver {
    id: number;
    name: string;
    email: string;
    phone: string;
    vehicleNumber: string;
    vehicleType: string;
    status: 'active' | 'suspended';
    joinedDate: string;
}

const API = BASE_URL;

export default function DriversScreen() {
    const router = useRouter();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);

    const token =
        typeof window !== 'undefined'
            ? localStorage.getItem('token')
            : null;

    /* ================= FETCH DRIVERS ================= */
    const loadDrivers = async () => {
        try {
            const res = await fetch(`${API}/api/admin/drivers`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to load drivers');
            }

            const data = await res.json();
            setDrivers(data);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Unable to load drivers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDrivers();
    }, []);

    /* ================= ACTION HANDLER ================= */
    const action = (id: number, type: string) => {
        const actionLabel =
            type === 'suspend'
                ? 'Suspend'
                : 'Reactivate';

        Alert.alert(
            `${actionLabel} Driver`,
            `Are you sure you want to ${actionLabel.toLowerCase()} this driver?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: actionLabel,
                    style: type === 'suspend' ? 'destructive' : 'default',
                    onPress: async () => {
                        try {
                            const res = await fetch(
                                `${API}/api/admin/drivers/${id}/${type}`,
                                {
                                    method: 'PUT',
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );

                            if (!res.ok) {
                                throw new Error('Action failed');
                            }

                            Alert.alert(
                                'Success',
                                `Driver ${actionLabel.toLowerCase()}d successfully`
                            );

                            loadDrivers(); // 🔄 refresh list
                        } catch (err) {
                            console.error(err);
                            Alert.alert('Error', 'Action failed. Try again.');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Loading drivers…</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 px-6 pt-24 pb-32 bg-gray-50">
            <View className="flex-row items-center mb-6">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-3xl font-black">
                    Driver Network
                </Text>
            </View>

            {drivers.length === 0 && (
                <Text className="text-gray-400 mt-10 text-center">
                    No registered drivers found
                </Text>
            )}

            {drivers.map((d) => (
                <View
                    key={d.id}
                    className="bg-white rounded-[32px] p-6 mb-4 border border-gray-100 shadow-sm"
                >
                    <View className="flex-row justify-between items-start">
                        <View>
                            <Text className="text-xl font-black">
                                {d.name}
                            </Text>
                            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                                {d.phone}
                            </Text>
                        </View>
                        <View className={`px-3 py-1 rounded-full ${d.status === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Text className={`text-[10px] font-black uppercase ${d.status === 'active' ? 'text-green-700' : 'text-red-700'}`}>
                                {d.status}
                            </Text>
                        </View>
                    </View>

                    <View className="h-[1px] bg-gray-50 my-4" />

                    {/* VEHICLE DETAILS - REQUESTED BY USER */}
                    <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-4">
                        <View className="w-10 h-10 bg-white rounded-xl justify-center items-center shadow-sm">
                            <Ionicons
                                name={d.vehicleType === 'Car' ? 'car' : d.vehicleType === 'Bike' ? 'bicycle' : 'bus'}
                                size={20}
                                color="#3B82F6"
                            />
                        </View>
                        <View className="ml-4">
                            <Text className="text-[10px] text-gray-400 font-bold uppercase">Vehicle Type: {d.vehicleType}</Text>
                            <Text className="text-sm font-black text-gray-900">{d.vehicleNumber}</Text>
                        </View>
                    </View>

                    <View className="flex-row gap-3">
                        {d.status === 'active' ? (
                            <TouchableOpacity
                                onPress={() => action(d.id, 'suspend')}
                                className="bg-amber-100 px-6 py-3 rounded-xl flex-row items-center"
                            >
                                <Ionicons name="hand-right" size={16} color="#D97706" />
                                <Text className="text-amber-700 font-black ml-2 uppercase text-[10px] tracking-widest">
                                    Suspend Access
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => action(d.id, 'reactivate')}
                                className="bg-indigo-600 px-6 py-3 rounded-xl flex-row items-center"
                            >
                                <Ionicons name="refresh" size={16} color="white" />
                                <Text className="text-white font-black ml-2 uppercase text-[10px] tracking-widest">
                                    Reactivate
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={() => Alert.alert('History', 'Detailed booking history coming soon')}
                            className="bg-gray-100 px-6 py-3 rounded-xl flex-row items-center"
                        >
                            <Ionicons name="time" size={16} color="#4B5563" />
                            <Text className="text-gray-600 font-black ml-2 uppercase text-[10px] tracking-widest">
                                History
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}
