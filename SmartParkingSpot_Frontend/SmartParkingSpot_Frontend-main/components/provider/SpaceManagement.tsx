import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface Slot {
    id: string;
    label: string;
    type: 'car' | 'bike' | 'ev';
    status: 'active' | 'inactive';
}

export default function SpaceManagement() {
    const [slots, setSlots] = useState<Slot[]>([
        { id: '1', label: 'A1', type: 'car', status: 'active' },
        { id: '2', label: 'A2', type: 'car', status: 'active' },
        { id: '3', label: 'B1', type: 'bike', status: 'active' },
        { id: '4', label: 'E1', type: 'ev', status: 'active' },
    ]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newSlot, setNewSlot] = useState({ label: '', type: 'car' as 'car' | 'bike' | 'ev' });

    const addSlot = () => {
        if (!newSlot.label.trim()) {
            Alert.alert("Required", "Please provide a slot label (e.g., A1)");
            return;
        }

        // Check for duplicate labels
        if (slots.some(s => s.label.toLowerCase() === newSlot.label.toLowerCase())) {
            Alert.alert("Duplicate", "A slot with this label already exists.");
            return;
        }

        const id = Date.now().toString();
        setSlots([...slots, { ...newSlot, id, status: 'active' }]);
        setNewSlot({ label: '', type: 'car' });
        setIsAddModalVisible(false);
        Alert.alert("Success", `Slot ${newSlot.label} has been added to your inventory.`);
    };

    const toggleStatus = (id: string) => {
        setSlots(slots.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
    };

    const deleteSlot = (id: string, label: string) => {
        Alert.alert(
            "Delete Slot",
            `Are you sure you want to remove Slot ${label}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        setSlots(slots.filter(s => s.id !== id));
                    }
                }
            ]
        );
    };

    const renderSlotItem = ({ item, index }: { item: Slot; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 50).springify()}
            className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100 flex-row items-center justify-between"
        >
            <View className="flex-row items-center">
                <View className={`w-12 h-12 rounded-2xl justify-center items-center ${item.status === 'active' ? 'bg-indigo-50' : 'bg-gray-100'}`}>
                    <Ionicons
                        name={item.type === 'car' ? 'car' : item.type === 'bike' ? 'bicycle' : 'flash'}
                        size={24}
                        color={item.status === 'active' ? '#6C5CE7' : '#9CA3AF'}
                    />
                </View>
                <View className="ml-4">
                    <Text className="text-gray-900 font-black text-lg">Slot {item.label}</Text>
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">{item.type} Space</Text>
                </View>
            </View>

            <View className="flex-row items-center gap-3">
                <TouchableOpacity
                    onPress={() => toggleStatus(item.id)}
                    className={`px-4 py-2 rounded-xl ${item.status === 'active' ? 'bg-green-50' : 'bg-red-50'}`}
                >
                    <Text className={`font-bold text-[10px] uppercase tracking-widest ${item.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.status}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => deleteSlot(item.id, item.label)}
                    className="w-10 h-10 bg-gray-50 rounded-xl justify-center items-center"
                >
                    <Ionicons name="trash-outline" size={20} color="#FF7675" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    return (
        <View className="flex-1 px-6 pt-24 pb-32">
            <View className="flex-row justify-between items-end mb-8">
                <View>
                    <Text className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] mb-1">Inventory Management</Text>
                    <Text className="text-gray-900 text-3xl font-black">My Parking Spaces</Text>
                </View>
                <TouchableOpacity
                    onPress={() => setIsAddModalVisible(true)}
                    className="w-12 h-12 bg-indigo-600 rounded-2xl justify-center items-center shadow-lg shadow-indigo-200"
                >
                    <Ionicons name="add" size={28} color="white" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={slots}
                renderItem={renderSlotItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <View className="py-20 items-center">
                        <Ionicons name="grid-outline" size={64} color="#E5E7EB" />
                        <Text className="text-gray-400 font-bold mt-4">No slots configured yet.</Text>
                    </View>
                }
            />

            <Modal
                visible={isAddModalVisible}
                transparent
                animationType="slide"
            >
                <View className="flex-1 justify-end bg-black/50">
                    <Animated.View entering={FadeInUp} className="bg-white rounded-t-[40px] p-8 pb-12">
                        <View className="flex-row justify-between items-center mb-8">
                            <Text className="text-2xl font-black text-gray-900">Add New Slot</Text>
                            <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                                <Ionicons name="close-circle" size={32} color="#D1D5DB" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 ml-1">Slot Label (e.g., A1, B2)</Text>
                        <TextInput
                            className="bg-gray-50 rounded-2xl p-4 text-gray-900 font-bold text-lg border border-gray-100 mb-6"
                            placeholder="A1"
                            value={newSlot.label}
                            onChangeText={text => setNewSlot({ ...newSlot, label: text })}
                            autoCapitalize="characters"
                        />

                        <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4 ml-1">Vehicle Type</Text>
                        <View className="flex-row gap-4 mb-10">
                            {['car', 'bike', 'ev'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => setNewSlot({ ...newSlot, type: type as any })}
                                    className={`flex-1 p-4 rounded-2xl border-2 items-center ${newSlot.type === type ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-gray-50'}`}
                                >
                                    <Ionicons
                                        name={type === 'car' ? 'car' : type === 'bike' ? 'bicycle' : 'flash'}
                                        size={24}
                                        color={newSlot.type === type ? '#6C5CE7' : '#9CA3AF'}
                                    />
                                    <Text className={`font-bold mt-2 capitalize ${newSlot.type === type ? 'text-indigo-600' : 'text-gray-400'}`}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={addSlot}
                            className="bg-indigo-600 py-5 rounded-3xl items-center shadow-xl shadow-indigo-200"
                        >
                            <Text className="text-white font-black text-lg uppercase tracking-wider">Confirm Addition</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
