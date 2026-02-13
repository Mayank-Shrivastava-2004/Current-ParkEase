import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  fetchAdminParkingSlots,
  ParkingSlotApi,
  VehicleType
} from '../api/adminParkingSlots';

interface Props {
  columns?: number;
}

export default function ParkingSlotGrid({ columns = 8 }: Props) {
  const [selectedType, setSelectedType] = useState<VehicleType>('CAR');
  const [slots, setSlots] = useState<ParkingSlotApi[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSlots();
  }, [selectedType]);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminParkingSlots(selectedType);
      setSlots(data);
    } finally {
      setLoading(false);
    }
  };

  const getSlotColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-gray-100 border-gray-200';
      case 'OCCUPIED': return 'bg-slate-700 border-slate-800';
     
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const getSlotIcon = (status: string, type: VehicleType) => {
    const isOutlined = status === 'AVAILABLE';
    switch (type) {
      case 'BIKE': return isOutlined ? 'bicycle-outline' : 'bicycle';
      case 'TRUCK': return isOutlined ? 'bus-outline' : 'bus';
      default: return isOutlined ? 'car-outline' : 'car';
    }
  };

  const availableCount = slots.filter(s => s.status === 'AVAILABLE').length;
  const occupiedCount = slots.filter(s => s.status === 'OCCUPIED').length;
  

  const vehicleTypes = [
    { type: 'CAR' as const, icon: 'car', label: 'CAR' },
    { type: 'BIKE' as const, icon: 'bicycle', label: 'BIKE' },
    { type: 'TRUCK' as const, icon: 'bus', label: 'TRUCK' },
  ];






  return (
    <View className="bg-white rounded-3xl p-6 shadow-sm shadow-gray-200 border border-gray-100">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-dark-900 font-bold text-xl">Slot Overview</Text>
      </View>

      {/* Vehicle Type Selector */}
      <View className="flex-row gap-2 mb-6">
        {vehicleTypes.map(vehicle => (
          <TouchableOpacity
            key={vehicle.type}
            onPress={() => setSelectedType(vehicle.type)}
            className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
              selectedType === vehicle.type ? 'bg-yellow-400' : 'bg-gray-50'
            }`}
          >
            <Ionicons
              name={vehicle.icon as any}
              size={18}
              color={selectedType === vehicle.type ? '#000' : '#636E72'}
            />
            <Text className={`ml-2 font-bold text-sm ${
              selectedType === vehicle.type ? 'text-dark-900' : 'text-gray-600'
            }`}>
              {vehicle.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View className="flex-row gap-3 mb-6">
        <View className="flex-1 bg-green-50 rounded-xl p-3">
          <Text className="text-green-600 text-xs font-bold uppercase">Available</Text>
          <Text className="text-green-700 text-2xl font-black">{availableCount}</Text>
        </View>
        <View className="flex-1 bg-slate-100 rounded-xl p-3">
          <Text className="text-slate-600 text-xs font-bold uppercase">Occupied</Text>
          <Text className="text-slate-700 text-2xl font-black">{occupiedCount}</Text>
        </View>
      
      </View>

      {/* Grid */}
      <ScrollView className="border-t border-gray-100 pt-4" style={{ maxHeight: 400 }}>
        <View className="flex-row flex-wrap gap-2">
          {slots.map((slot, index) => (
            <Animated.View
              key={slot.id}
              entering={FadeInDown.delay(index * 20).springify()}
              style={{ width: `${100 / columns - 2}%` }}
            >
              <TouchableOpacity
                onPress={() => setSelectedSlot(slot.id)}
                className={`aspect-square rounded-xl border-2 items-center justify-center ${
                  getSlotColor(slot.status)
                } ${selectedSlot === slot.id ? 'border-blue-500' : ''}`}
              >
                <Text className={`text-xs font-bold mb-1 ${
                  slot.status === 'OCCUPIED' ? 'text-white' : 'text-gray-600'
                }`}>
                  {slot.label}
                </Text>

                <Ionicons
                  name={getSlotIcon(slot.status, slot.vehicleType) as any}
                  size={20}
                  color={slot.status === 'OCCUPIED' ? '#fff' : '#B2BEC3'}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
