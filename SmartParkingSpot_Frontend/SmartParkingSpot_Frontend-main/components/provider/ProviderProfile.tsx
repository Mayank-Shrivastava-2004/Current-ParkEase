import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProviderProfile() {
    const details = [
        { id: 'owner', label: 'Owner Name', value: 'Rajesh Kumar', icon: 'person-outline' },
        { id: 'area', label: 'Parking Area', value: 'City Plaza Underground', icon: 'business-outline' },
        { id: 'location', label: 'Location', value: 'Sector 62, Noida, UP', icon: 'location-outline' },
        { id: 'email', label: 'Email', value: 'rajesh@cityplaza.com', icon: 'mail-outline' },
        { id: 'phone', label: 'Phone', value: '+91 98765 43210', icon: 'call-outline' },
    ];

    const handleEdit = (field: string) => {
        Alert.alert("Edit Profile", `The option to edit your ${field} is currently undergoing maintenance for compliance updates.`);
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: () => { } } // Handled by dashbaord parent
            ]
        );
    };

    return (
        <ScrollView className="flex-1 px-6 pt-24 pb-32" showsVerticalScrollIndicator={false}>
            <View className="mb-8">
                <Text className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] mb-1">Account Info</Text>
                <Text className="text-gray-900 text-3xl font-black">My Profile</Text>
            </View>

            <View className="items-center mb-10">
                <View className="relative">
                    <View className="w-32 h-32 bg-indigo-100 rounded-[48px] justify-center items-center border-[6px] border-white shadow-xl shadow-indigo-100">
                        <Text className="text-indigo-600 text-4xl font-black uppercase">RK</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => Alert.alert("Upload", "Select a new profile photo from your gallery.")}
                        className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 rounded-2xl justify-center items-center border-4 border-white"
                    >
                        <Ionicons name="camera" size={20} color="white" />
                    </TouchableOpacity>
                </View>
                <Text className="text-gray-900 font-black text-2xl mt-6">Rajesh Kumar</Text>
                <View className="bg-green-50 px-4 py-1.5 rounded-full mt-2 border border-green-100">
                    <Text className="text-green-600 font-black text-[10px] uppercase tracking-widest">Verified Provider</Text>
                </View>
            </View>

            <View className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm mb-12">
                {details.map((item, index) => (
                    <Animated.View
                        key={index}
                        entering={FadeInDown.delay(index * 100)}
                        className={`flex-row items-center py-6 ${index !== details.length - 1 ? 'border-b border-gray-50' : ''}`}
                    >
                        <View className="w-12 h-12 bg-gray-50 rounded-2xl justify-center items-center">
                            <Ionicons name={item.icon as any} size={22} color="#6C5CE7" />
                        </View>
                        <View className="ml-5 flex-1">
                            <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">{item.label}</Text>
                            <Text className="text-gray-900 font-black text-lg">{item.value}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleEdit(item.label)}>
                            <Ionicons name="pencil-outline" size={18} color="#D1D5DB" />
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>

            <TouchableOpacity
                onPress={handleLogout}
                className="bg-red-50 py-5 rounded-[24px] items-center mb-10 flex-row justify-center gap-3"
            >
                <Ionicons name="log-out-outline" size={20} color="#FF7675" />
                <Text className="text-red-500 font-black uppercase tracking-wider">Log Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
