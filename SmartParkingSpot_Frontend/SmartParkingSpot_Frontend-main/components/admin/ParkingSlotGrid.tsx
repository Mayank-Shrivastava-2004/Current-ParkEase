import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ParkingSlot {
    id: string;
    label: string;
    status: 'available' | 'occupied' | 'reserved';
    vehicleType?: 'car' | 'bike' | 'truck';
}

interface Props {
    slots: ParkingSlot[];
    columns?: number;
}

export default function ParkingSlotGrid({ slots, columns = 8 }: Props) {
    const [selectedType, setSelectedType] = useState<'car' | 'bike' | 'truck'>('car');
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const vehicleTypes = [
        { type: 'car' as const, icon: 'car', label: 'CAR' },
        { type: 'bike' as const, icon: 'bicycle', label: 'BIKE' },
        { type: 'truck' as const, icon: 'bus', label: 'TRUCK' },
    ];

    const getSlotColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-gray-100 border-gray-200';
            case 'occupied': return 'bg-slate-700 border-slate-800';
            case 'reserved': return 'bg-yellow-400 border-yellow-500';
            default: return 'bg-gray-100 border-gray-200';
        }
    };

    const getSlotIcon = (status: string, type: 'car' | 'bike' | 'truck') => {
        const isOutlined = status === 'available';
        switch (type) {
            case 'bike': return isOutlined ? 'bicycle-outline' : 'bicycle';
            case 'truck': return isOutlined ? 'bus-outline' : 'bus';
            default: return isOutlined ? 'car-outline' : 'car';
        }
    };

    // Filter slots by vehicle type (simulate for demo)
    const filteredSlots = slots.map(slot => ({
        ...slot,
        // Randomly modify status based on type to simulate "switching lots"
        status: (slot.id.charCodeAt(0) + (selectedType === 'car' ? 0 : selectedType === 'bike' ? 1 : 2)) % 3 === 0
            ? 'available' as const
            : (slot.id.charCodeAt(0) + (selectedType === 'car' ? 0 : selectedType === 'bike' ? 1 : 2)) % 3 === 1
                ? 'occupied' as const
                : 'reserved' as const
    }));

    // Calculate stats based on filtered data
    const availableCount = filteredSlots.filter(s => s.status === 'available').length;
    const occupiedCount = filteredSlots.filter(s => s.status === 'occupied').length;
    const reservedCount = filteredSlots.filter(s => s.status === 'reserved').length;

    return (
        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-gray-200 border border-gray-100">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-dark-900 font-bold text-xl">Slot Overview</Text>
                <View className="flex-row items-center gap-2">
                    <Ionicons name="search" size={20} color="#636E72" />
                    <Ionicons name="filter" size={20} color="#636E72" />
                </View>
            </View>

            {/* Vehicle Type Selector */}
            <View className="flex-row gap-2 mb-6">
                {vehicleTypes.map((vehicle) => (
                    <TouchableOpacity
                        key={vehicle.type}
                        onPress={() => setSelectedType(vehicle.type)}
                        className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${selectedType === vehicle.type
                            ? 'bg-yellow-400'
                            : 'bg-gray-50'
                            }`}
                    >
                        <Ionicons
                            name={vehicle.icon as any}
                            size={18}
                            color={selectedType === vehicle.type ? '#000' : '#636E72'}
                        />
                        <Text className={`ml-2 font-bold text-sm ${selectedType === vehicle.type
                            ? 'text-dark-900'
                            : 'text-gray-600'
                            }`}>
                            {vehicle.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Stats Row */}
            <View className="flex-row gap-3 mb-6">
                <View className="flex-1 bg-green-50 rounded-xl p-3">
                    <Text className="text-green-600 text-xs font-bold uppercase mb-1">Available</Text>
                    <Text className="text-green-700 text-2xl font-black">{availableCount}</Text>
                </View>
                <View className="flex-1 bg-slate-100 rounded-xl p-3">
                    <Text className="text-slate-600 text-xs font-bold uppercase mb-1">Occupied</Text>
                    <Text className="text-slate-700 text-2xl font-black">{occupiedCount}</Text>
                </View>
                <View className="flex-1 bg-yellow-50 rounded-xl p-3">
                    <Text className="text-yellow-600 text-xs font-bold uppercase mb-1">Reserved</Text>
                    <Text className="text-yellow-700 text-2xl font-black">{reservedCount}</Text>
                </View>
            </View>

            {/* Parking Grid */}
            <ScrollView
                style={{ maxHeight: 400 }}
                showsVerticalScrollIndicator={false}
                className="border-t border-gray-100 pt-4"
            >
                <View className="flex-row flex-wrap gap-2">
                    {filteredSlots.map((slot, index) => (
                        <Animated.View
                            key={slot.id}
                            entering={FadeInDown.delay(index * 20).springify()}
                            style={{ width: `${100 / columns - 2}%` }}
                        >
                            <TouchableOpacity
                                onPress={() => setSelectedSlot(slot.id)}
                                className={`aspect-square rounded-xl border-2 items-center justify-center ${getSlotColor(slot.status)} ${selectedSlot === slot.id ? 'border-blue-500' : ''
                                    }`}
                            >
                                {/* Slot Label */}
                                <Text className={`text-xs font-bold mb-1 ${slot.status === 'occupied' ? 'text-white' : 'text-gray-600'
                                    }`}>
                                    {slot.label}
                                </Text>

                                {/* Vehicle Icon */}
                                <Ionicons
                                    name={getSlotIcon(slot.status, selectedType) as any}
                                    size={20}
                                    color={slot.status === 'occupied' ? '#fff' : '#B2BEC3'}
                                />
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>

            {/* Legend */}
            <View className="border-t border-gray-100 mt-4 pt-4 flex-row justify-around">
                <View className="flex-row items-center">
                    <View className="w-4 h-4 bg-gray-100 border border-gray-200 rounded mr-2" />
                    <Text className="text-gray-600 text-xs">Available</Text>
                </View>
                <View className="flex-row items-center">
                    <View className="w-4 h-4 bg-slate-700 rounded mr-2" />
                    <Text className="text-gray-600 text-xs">Occupied</Text>
                </View>
                <View className="flex-row items-center">
                    <View className="w-4 h-4 bg-yellow-400 rounded mr-2" />
                    <Text className="text-gray-600 text-xs">Reserved</Text>
                </View>
            </View>
        </View>
    );
}
