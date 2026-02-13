import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface BookingModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (hours: number, vehicle: string) => void;
    slotName: string;
    pricePerHour: number;
}

export default function BookingModal({ visible, onClose, onConfirm, slotName, pricePerHour }: BookingModalProps) {
    const [hours, setHours] = useState(1);
    const [selectedVehicle, setSelectedVehicle] = useState('car'); // 'car' or 'bike'

    const totalCost = hours * pricePerHour;

    const handleConfirm = () => {
        onConfirm(hours, selectedVehicle);
        setHours(1); // Reset
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/60 justify-center items-center px-6">
                <Animated.View
                    entering={FadeInDown.springify()}
                    className="bg-white w-full rounded-3xl p-6 shadow-2xl"
                >
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">Booking Slot</Text>
                            <Text className="text-dark-900 font-black text-2xl">{slotName}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                            <Ionicons name="close" size={20} color="#2D3436" />
                        </TouchableOpacity>
                    </View>

                    {/* Vehicle Selection */}
                    <Text className="text-gray-900 font-bold mb-3">Select Vehicle</Text>
                    <View className="flex-row gap-4 mb-6">
                        <TouchableOpacity
                            onPress={() => setSelectedVehicle('car')}
                            className={`flex-1 p-4 rounded-xl border-2 flex-row items-center justify-center gap-2 ${selectedVehicle === 'car' ? 'border-teal-500 bg-teal-50' : 'border-gray-100 bg-gray-50'}`}
                        >
                            <Ionicons name="car" size={24} color={selectedVehicle === 'car' ? '#00B894' : '#B2BEC3'} />
                            <Text className={`font-bold ${selectedVehicle === 'car' ? 'text-teal-700' : 'text-gray-400'}`}>Car</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setSelectedVehicle('bike')}
                            className={`flex-1 p-4 rounded-xl border-2 flex-row items-center justify-center gap-2 ${selectedVehicle === 'bike' ? 'border-teal-500 bg-teal-50' : 'border-gray-100 bg-gray-50'}`}
                        >
                            <Ionicons name="bicycle" size={24} color={selectedVehicle === 'bike' ? '#00B894' : '#B2BEC3'} />
                            <Text className={`font-bold ${selectedVehicle === 'bike' ? 'text-teal-700' : 'text-gray-400'}`}>Bike</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Duration Slider (Mock) */}
                    <Text className="text-gray-900 font-bold mb-3">Duration</Text>
                    <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl mb-6">
                        <TouchableOpacity
                            onPress={() => setHours(Math.max(1, hours - 1))}
                            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
                        >
                            <Ionicons name="remove" size={24} color="#2D3436" />
                        </TouchableOpacity>
                        <View className="items-center">
                            <Text className="text-3xl font-black text-dark-900">{hours}</Text>
                            <Text className="text-gray-400 text-xs font-bold uppercase">Hours</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setHours(Math.min(24, hours + 1))}
                            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
                        >
                            <Ionicons name="add" size={24} color="#2D3436" />
                        </TouchableOpacity>
                    </View>

                    {/* Total & Action */}
                    <View className="border-t border-gray-100 pt-6">
                        <View className="flex-row justify-between items-end mb-6">
                            <Text className="text-gray-500 font-medium">Total Amount</Text>
                            <Text className="text-3xl font-black text-teal-600">₹{totalCost}</Text>
                        </View>

                        <TouchableOpacity
                            onPress={handleConfirm}
                            className="bg-teal-600 w-full py-4 rounded-2xl items-center shadow-lg shadow-teal-200"
                        >
                            <Text className="text-white font-bold text-lg">Confirm Booking</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}
