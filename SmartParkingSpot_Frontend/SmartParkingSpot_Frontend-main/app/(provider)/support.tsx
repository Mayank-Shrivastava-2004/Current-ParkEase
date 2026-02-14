import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UnifiedHeader from '../../components/UnifiedHeader';
import BASE_URL from '../../constants/api';
import axios from 'axios';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

const API = BASE_URL;

export default function SupportChatScreen() {
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Provider');
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    const providerGradient: readonly [string, string, ...string[]] = ['#8B5CF6', '#6D28D9'];

    useEffect(() => {
        const loadInitial = async () => {
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);
            await loadMessages();
        };
        loadInitial();

        const interval = setInterval(loadMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    const loadMessages = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await axios.get(`${API}/api/support/messages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 200) {
                setMessages(res.data);
            }
        } catch (err) {
            console.error('Messages load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || sending) return;

        setSending(true);
        const text = newMessage;
        setNewMessage('');

        try {
            const token = await AsyncStorage.getItem('token');

            // Optimistic update
            const tempMsg = {
                id: Date.now(),
                sender: 'me',
                text: text,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, tempMsg]);

            await axios.post(`${API}/api/support/messages`, { text: text }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            await loadMessages();
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        } catch (err) {
            console.error('Send failed:', err);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="mt-4 text-purple-600 font-bold uppercase tracking-widest text-xs">Opening Hub Support...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-gray-50"
        >
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <UnifiedHeader
                title="Business Support"
                subtitle="Direct Admin Access"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => { }}
                userName={userName}
                showBackButton={true}
            />

            <View className="flex-1">
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1"
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    <Animated.View entering={ZoomIn} className="items-center my-12">
                        <View className="w-24 h-24 bg-white rounded-[40px] items-center justify-center mb-8 shadow-sm border border-purple-50">
                            <Ionicons name="headset" size={40} color="#8B5CF6" />
                        </View>
                        <Text className="text-gray-900 font-black text-3xl tracking-tighter">Concierge Active</Text>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[4px] mt-3">Verified System Admin Path</Text>

                        <View className="bg-emerald-50 px-6 py-2.5 rounded-full border border-emerald-100 mt-8 shadow-sm">
                            <Text className="text-emerald-600 text-[9px] font-black uppercase tracking-widest">End-to-End Encrypted Tunnel</Text>
                        </View>
                    </Animated.View>

                    {messages.map((msg, index) => (
                        <Animated.View
                            entering={FadeInUp.delay(50)}
                            key={index}
                            className={`mb-8 ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                        >
                            <View
                                className={`max-w-[85%] rounded-[40px] p-8 shadow-2xl shadow-indigo-900/5 ${msg.sender === 'me'
                                    ? 'bg-purple-600 rounded-tr-none shadow-purple-600/20'
                                    : 'bg-white border-white rounded-tl-none border shadow-sm'
                                    }`}
                            >
                                <Text
                                    className={`font-black text-lg leading-7 tracking-tight ${msg.sender === 'me' ? 'text-white' : 'text-gray-900'}`}
                                >
                                    {msg.text}
                                </Text>
                                <View className="flex-row items-center mt-5">
                                    <Ionicons
                                        name={msg.sender === 'me' ? "checkmark-done" : "time-outline"}
                                        size={12}
                                        color={msg.sender === 'me' ? "rgba(255,255,255,0.4)" : "#94A3B8"}
                                        className="mr-2"
                                    />
                                    <Text
                                        className={`text-[9px] font-black uppercase tracking-widest ${msg.sender === 'me' ? 'text-white/40' : 'text-gray-400'}`}
                                    >
                                        {msg.time || 'JUST NOW'}
                                    </Text>
                                </View>
                            </View>
                        </Animated.View>
                    ))}
                    <View className="h-10" />
                </ScrollView>

                {/* PREMIUM INPUT GROUP */}
                <View className="px-8 pb-14 pt-8 bg-white border-t border-gray-50 shadow-2xl shadow-black rounded-t-[50px]">
                    <View className="flex-row items-center gap-6">
                        <View className="flex-1 bg-gray-50 rounded-[35px] px-8 py-6 border border-gray-100 flex-row items-center shadow-inner">
                            <TextInput
                                value={newMessage}
                                onChangeText={setNewMessage}
                                placeholder="Message admin team..."
                                placeholderTextColor="#94A3B8"
                                className="flex-1 font-black text-gray-900 text-lg"
                                multiline
                                maxLength={500}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={!newMessage.trim() || sending}
                            activeOpacity={0.9}
                            className={`w-16 h-16 rounded-[28px] items-center justify-center shadow-2xl transition-all ${newMessage.trim() ? 'bg-purple-600 shadow-purple-600/40' : 'bg-gray-100'}`}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Ionicons
                                    name="send"
                                    size={32}
                                    color={newMessage.trim() ? 'white' : '#94A3B8'}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
