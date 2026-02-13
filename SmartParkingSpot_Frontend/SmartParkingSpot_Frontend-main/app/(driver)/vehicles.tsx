import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    Image,
    Modal
} from 'react-native';
import UnifiedHeader from '../../components/UnifiedHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VehicleGarageScreen() {
    const router = useRouter();
    const [isDark, setIsDark] = useState(false);
    const [vehicles, setVehicles] = useState([
        { id: 1, name: 'Tesla Model 3', plate: 'MH 12 AB 1234', type: 'Car', primary: true },
        { id: 2, name: 'Honda City', plate: 'MH 14 CD 5678', type: 'Car', primary: false }
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newVehicle, setNewVehicle] = useState({ name: '', plate: '', type: 'Car' });

    React.useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        const settingsStr = await AsyncStorage.getItem('admin_settings');
        if (settingsStr) {
            const settings = JSON.parse(settingsStr);
            setIsDark(settings.darkMode ?? false);
        }
    };

    const handleAddVehicle = () => {
        if (!newVehicle.name || !newVehicle.plate) {
            return Alert.alert('Error', 'Please fill all fields');
        }
        setVehicles([...vehicles, { ...newVehicle, id: Date.now(), primary: false }]);
        setShowAddModal(false);
        setNewVehicle({ name: '', plate: '', type: 'Car' });
        Alert.alert('Success', 'Vehicle added to garage');
    };

    const handleDelete = (id: number) => {
        Alert.alert('Confirm Delete', 'Remove this vehicle?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', onPress: () => setVehicles(vehicles.filter(v => v.id !== id)), style: 'destructive' }
        ]);
    };

    const setPrimary = (id: number) => {
        setVehicles(vehicles.map(v => ({ ...v, primary: v.id === id })));
        Alert.alert('Updated', 'Primary vehicle changed');
    };

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />
            <UnifiedHeader
                title="My Garage"
                subtitle="Manage Vehicles"
                role="driver"
                gradientColors={['#3B82F6', '#1D4ED8']}
                onMenuPress={() => router.back()}
                userName="Driver"
                showBackButton={true}
            />

            <ScrollView className="px-5 mt-6">
                <TouchableOpacity
                    onPress={() => setShowAddModal(true)}
                    className="bg-blue-600 rounded-[24px] p-6 mb-8 flex-row items-center justify-center shadow-lg shadow-blue-500/30"
                >
                    <Ionicons name="add-circle" size={24} color="white" />
                    <Text className="text-white font-black ml-2 uppercase tracking-widest text-xs">Add New Vehicle</Text>
                </TouchableOpacity>

                {vehicles.map((vehicle) => (
                    <View key={vehicle.id} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-[32px] p-6 mb-4 border shadow-sm relative overflow-hidden`}>
                        {vehicle.primary && (
                            <View className="absolute top-0 right-0 bg-blue-600 px-4 py-1 rounded-bl-2xl">
                                <Text className="text-white text-[9px] font-black uppercase tracking-widest">Primary</Text>
                            </View>
                        )}

                        <View className="flex-row items-center">
                            <View className={`w-14 h-14 ${isDark ? 'bg-slate-800' : 'bg-blue-50'} rounded-2xl items-center justify-center mr-5`}>
                                <Ionicons name="car-sport" size={28} color="#3B82F6" />
                            </View>
                            <View className="flex-1">
                                <Text className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{vehicle.name}</Text>
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{vehicle.plate}</Text>
                            </View>
                        </View>

                        <View className="flex-row justify-end mt-6 gap-3">
                            {!vehicle.primary && (
                                <TouchableOpacity onPress={() => setPrimary(vehicle.id)} className="px-4 py-2 bg-gray-100 rounded-xl">
                                    <Text className="text-gray-600 font-bold text-[10px] uppercase">Set Primary</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={() => handleDelete(vehicle.id)} className="px-4 py-2 bg-red-50 rounded-xl">
                                <Text className="text-red-500 font-bold text-[10px] uppercase">Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <Modal visible={showAddModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className={`${isDark ? 'bg-slate-900' : 'bg-white'} rounded-t-[32px] p-8`}>
                        <Text className={`text-2xl font-black mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Vehicle</Text>

                        <TextInput
                            placeholder="Vehicle Name (e.g. Tesla Model 3)"
                            placeholderTextColor="#94A3B8"
                            className={`bg-gray-50 p-4 rounded-2xl font-bold mb-4 ${isDark ? 'bg-slate-800 text-white' : 'text-gray-900'}`}
                            value={newVehicle.name}
                            onChangeText={(t) => setNewVehicle({ ...newVehicle, name: t })}
                        />
                        <TextInput
                            placeholder="License Plate (e.g. MH 12 AB 1234)"
                            placeholderTextColor="#94A3B8"
                            className={`bg-gray-50 p-4 rounded-2xl font-bold mb-6 ${isDark ? 'bg-slate-800 text-white' : 'text-gray-900'}`}
                            value={newVehicle.plate}
                            onChangeText={(t) => setNewVehicle({ ...newVehicle, plate: t })}
                        />

                        <View className="flex-row gap-4">
                            <TouchableOpacity onPress={() => setShowAddModal(false)} className="flex-1 bg-gray-200 py-4 rounded-2xl items-center">
                                <Text className="text-gray-600 font-bold uppercase tracking-widest text-xs">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAddVehicle} className="flex-1 bg-blue-600 py-4 rounded-2xl items-center">
                                <Text className="text-white font-black uppercase tracking-widest text-xs">Save Vehicle</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
