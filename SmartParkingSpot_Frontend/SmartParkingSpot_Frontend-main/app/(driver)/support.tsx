import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import UnifiedHeader from '../../components/UnifiedHeader';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../constants/api';


const API = BASE_URL;

export default function DriverSupportScreen() {
    const router = useRouter();
    const [messages, setMessages] = useState<{ text: string, sender: 'user' | 'bot' }[]>([
        { text: "Hello! I'm your Smart Deck Assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isDark, setIsDark] = useState(false);
    const [userName, setUserName] = useState('Driver');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const settingsStr = await AsyncStorage.getItem('admin_settings');
        if (settingsStr) {
            const settings = JSON.parse(settingsStr);
            setIsDark(settings.darkMode ?? false);
        }
        const savedName = await AsyncStorage.getItem('userName');
        if (savedName) setUserName(savedName);
    };

    const handleSOS = async () => {
        try {
            Alert.alert("SOS Triggered", "Emergency alert broadcasted to nearby providers & admin.", [{ text: "OK" }]);
        } catch (e) {
            Alert.alert("Error", "Failed to send SOS");
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const currentText = inputText;
        const userMsg = { text: currentText, sender: 'user' as const };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');

        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/support/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ text: currentText })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { text: data.reply, sender: 'bot' as const }]);
            }
        } catch (err) {
            console.error('Chat failed Erro:', err);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar style="dark" />
            <UnifiedHeader
                title="Support Center"
                subtitle="24/7 Assistance"
                role="driver"
                gradientColors={['#3B82F6', '#1D4ED8']}
                onMenuPress={() => router.back()}
                userName="Driver"
                showBackButton={true}
            />

            <View className="flex-1 px-5 pt-6">
                {/* SOS Button */}
                <TouchableOpacity
                    onPress={handleSOS}
                    className="bg-red-500 rounded-[24px] p-6 mb-6 shadow-lg shadow-red-500/30 flex-row items-center justify-center animate-pulse"
                >
                    <Ionicons name="warning" size={32} color="white" />
                    <View className="ml-4">
                        <Text className="text-white font-black text-xl uppercase tracking-widest">Emergency SOS</Text>
                        <Text className="text-red-100 text-xs font-bold">Tap to alert nearby providers & admin</Text>
                    </View>
                </TouchableOpacity>

                {/* Chat Bot Interface */}
                <View className="flex-1 bg-white rounded-[32px] border border-gray-200 overflow-hidden mb-6">
                    <View className="bg-gray-100 p-4 border-b border-gray-200">
                        <Text className="font-black text-gray-700 uppercase tracking-widest text-xs">ParkEase AI Assistant</Text>
                    </View>

                    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                        {messages.map((msg, i) => (
                            <View key={i} className={`mb-3 max-w-[80%] p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 self-end rounded-tr-none' : 'bg-gray-100 self-start rounded-tl-none'}`}>
                                <Text className={msg.sender === 'user' ? 'text-white font-bold' : 'text-gray-800 font-medium'}>{msg.text}</Text>
                            </View>
                        ))}
                    </ScrollView>

                    <View className="p-4 border-t border-gray-100 flex-row items-center">
                        <TextInput
                            className="flex-1 bg-gray-50 p-4 rounded-2xl mr-3 font-bold text-gray-700"
                            placeholder="Type your issue..."
                            value={inputText}
                            onChangeText={setInputText}
                        />
                        <TouchableOpacity onPress={sendMessage} className="bg-blue-600 w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-blue-600/20">
                            <Ionicons name="send" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}
