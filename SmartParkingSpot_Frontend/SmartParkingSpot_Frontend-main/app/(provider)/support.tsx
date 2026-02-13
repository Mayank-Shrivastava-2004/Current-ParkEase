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
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import BASE_URL from '../../constants/api';

const API = BASE_URL;

export default function SupportChatScreen() {
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [userName, setUserName] = useState('Provider');
    const [messages, setMessages] = useState<any[]>([
        { id: 1, sender: 'bot', text: 'Welcome to Asset Support. How can we assist with your parking slots today?', time: '09:00 AM' },
        { id: 2, sender: 'user', text: 'I need to update the pricing for Slot A-102.', time: '09:02 AM' },
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    const providerGradient: readonly [string, string, ...string[]] = ['#F59E0B', '#D97706'];

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', route: '/(provider)/dashboard' },
        { icon: 'business', label: 'My Spaces', route: '/(provider)/spaces' },
        { icon: 'bar-chart', label: 'Earnings', route: '/(provider)/earnings' },
        { icon: 'car', label: 'Live Traffic', route: '/(provider)/traffic' },
        { icon: 'time', label: 'History', route: '/(provider)/history' },
        { icon: 'flash', label: 'EV Station', route: '/(provider)/ev-station' },
        { icon: 'person-circle', label: 'Account Profile', route: '/(provider)/profile' },
        { icon: 'settings', label: 'Settings', route: '/(provider)/settings' },
        { icon: 'headset', label: 'Support', route: '/(provider)/support' },
    ];

    useEffect(() => {
        const loadInitial = async () => {
            // Load Theme
            const settingsStr = await AsyncStorage.getItem('admin_settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                setIsDark(settings.darkMode ?? false);
            }

            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);
            await loadMessages();
        };
        loadInitial();
    }, []);

    const loadMessages = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/support/messages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) setMessages(data);
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
        try {
            const token = await AsyncStorage.getItem('token');
            const tempMsg = {
                id: Date.now(),
                sender: 'user',
                text: newMessage,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, tempMsg]);
            setNewMessage('');

            const res = await fetch(`${API}/api/support/messages`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: newMessage }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.reply) {
                    const botMsg = {
                        id: Date.now() + 1,
                        sender: 'bot',
                        text: data.reply,
                        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    };
                    setMessages(prev => [...prev, botMsg]);
                }
            }

            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        } catch (err) {
            console.error('Send failed:', err);
        } finally {
            setSending(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text className="mt-4 text-amber-600 font-bold uppercase tracking-widest text-xs">Opening Concierge...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}
        >
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Concierge"
                subtitle="Technical Support"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => setSidebarOpen(true)}
                userName={userName}
                showBackButton={true}
            />

            <UnifiedSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userName={userName}
                userRole="Parking Provider"
                userStatus="Priority Lane Active"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={providerGradient}
                dark={isDark}
            />

            <View className="flex-1 mt-4">
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1 px-5 py-6"
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    <View className="items-center mb-8">
                        <View className={`${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-100 border-amber-200'} px-4 py-2 rounded-full border`}>
                            <Text className="text-amber-700 text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</Text>
                        </View>
                    </View>

                    {messages.map((msg, index) => (
                        <View
                            key={index}
                            className={`mb-6 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <View
                                className={`max-w-[85%] rounded-[30px] p-6 shadow-sm ${msg.sender === 'user'
                                    ? 'bg-amber-600 rounded-tr-none'
                                    : (isDark ? 'bg-slate-900 border-slate-800 rounded-tl-none border' : 'bg-white border-gray-100 rounded-tl-none border')
                                    }`}
                            >
                                <Text
                                    className={`font-bold text-base leading-6 ${msg.sender === 'user' ? 'text-white' : (isDark ? 'text-white' : 'text-gray-900')
                                        }`}
                                >
                                    {msg.text}
                                </Text>
                                <Text
                                    className={`text-[9px] font-black mt-3 uppercase tracking-widest ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-400'
                                        }`}
                                >
                                    {msg.time}
                                </Text>
                            </View>
                        </View>
                    ))}
                    <View className="h-10" />
                </ScrollView>

                {/* INPUT */}
                <View className={`px-6 py-6 ${isDark ? 'bg-slate-900 border-t border-slate-800' : 'bg-white border-t border-gray-100'}`}>
                    <View className="flex-row items-center gap-4">
                        <View className={`flex-1 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'} rounded-[24px] px-6 py-4 flex-row items-center border`}>
                            <TextInput
                                value={newMessage}
                                onChangeText={setNewMessage}
                                placeholder="Message support team..."
                                placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
                                className={`flex-1 font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                                multiline
                                maxLength={500}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={!newMessage.trim() || sending}
                            className={`w-14 h-14 rounded-2xl items-center justify-center shadow-lg ${newMessage.trim() ? 'bg-amber-600 shadow-amber-600/30' : 'bg-gray-200'
                                }`}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Ionicons
                                    name="send"
                                    size={24}
                                    color={newMessage.trim() ? 'white' : '#94A3B8'}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                    <View className="h-4" />
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
