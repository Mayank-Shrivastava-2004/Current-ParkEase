import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import UnifiedHeader from '../../components/UnifiedHeader';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DriverEVScreen() {
    const router = useRouter();
    const [scanning, setScanning] = useState(false);
    const [isDark, setIsDark] = useState(false);

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

    const handleScan = () => {
        setScanning(true);
        setTimeout(() => {
            setScanning(false);
            Alert.alert("Station Detected", "Connected to EV Station #402. Ready to charge.");
        }, 2000);
    };

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <UnifiedHeader
                title="EV Charging"
                subtitle="Green Mobility"
                role="driver"
                gradientColors={['#10B981', '#059669']}
                onMenuPress={() => router.back()}
                userName="Driver"
                showBackButton={true}
            />

            <View className="flex-1 px-5 pt-6">
                <View className="bg-emerald-600 rounded-[32px] p-8 mb-6 shadow-xl shadow-emerald-500/30 items-center justify-center h-48">
                    {scanning ? (
                        <View className="items-center">
                            <ActivityIndicator size="large" color="white" />
                            <Text className="text-white font-bold mt-4 animate-pulse">Scanning QR Code...</Text>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={handleScan} className="items-center">
                            <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-4 border-2 border-white/30">
                                <Ionicons name="qr-code" size={40} color="white" />
                            </View>
                            <Text className="text-white font-black text-lg uppercase tracking-widest">Scan to Charge</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text className="font-black text-xl mb-4 text-gray-900">Nearby Stations</Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {[1, 2, 3].map((_, i) => (
                        <View key={i} className="bg-white p-5 mb-4 rounded-3xl border border-gray-100 shadow-sm flex-row items-center">
                            <View className="w-12 h-12 bg-emerald-50 rounded-2xl items-center justify-center mr-4">
                                <Ionicons name="flash" size={24} color="#10B981" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-black text-gray-900 text-lg">VoltCharge Station {i + 1}</Text>
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">0.8 km • Fast Charging</Text>
                            </View>
                            <TouchableOpacity className="bg-gray-900 px-4 py-2 rounded-xl">
                                <Text className="text-white text-[10px] font-black uppercase">Navigate</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}
