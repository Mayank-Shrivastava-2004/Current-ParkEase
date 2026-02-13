import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface ChatbotModalProps {
    visible: boolean;
    onClose: () => void;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

export default function ChatbotModal({ visible, onClose }: ChatbotModalProps) {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Hi! I am ParkAI 🤖. How can I help you today?', sender: 'bot' },
    ]);
    const [inputText, setInputText] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');

        // Simulate Bot Response
        setTimeout(() => {
            let botResponse = "I'm still learning! Can you contact support for complex queries?";
            const lowerInput = userMsg.text.toLowerCase();

            if (lowerInput.includes('book') || lowerInput.includes('booking')) {
                botResponse = "To book a spot, simply tap on any parking slot marker on the map or list, select your vehicle and duration, and confirm!";
            } else if (lowerInput.includes('wallet') || lowerInput.includes('money') || lowerInput.includes('pay')) {
                botResponse = "You can top up your wallet in the Wallet tab. I can simulate a transaction for you if you want!";
            } else if (lowerInput.includes('cancel')) {
                botResponse = "To cancel a booking, go to 'My Bookings', select the active booking and tap 'Cancel'. (Note: Cancellation simulated)";
            } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                botResponse = "Hello there! Ready to park?";
            }

            const botMsg: Message = { id: (Date.now() + 1).toString(), text: botResponse, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 1000);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-slate-50">
                {/* Header */}
                <View className="bg-white px-6 py-4 border-b border-gray-100 flex-row justify-between items-center shadow-sm z-10">
                    <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 bg-teal-100 rounded-full justify-center items-center">
                            <Ionicons name="chatbubbles" size={20} color="#00B894" />
                        </View>
                        <View>
                            <Text className="font-bold text-lg text-dark-900">ParkEase Support</Text>
                            <Text className="text-xs text-green-600 font-bold">● Online</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                        <Ionicons name="close" size={24} color="#2D3436" />
                    </TouchableOpacity>
                </View>

                {/* Chat Area */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView
                        ref={scrollViewRef}
                        className="flex-1 px-4 py-4"
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        {messages.map((msg, index) => (
                            <Animated.View
                                key={msg.id}
                                entering={FadeInUp.delay(index * 50).springify()}
                                className={`mb-4 max-w-[80%] rounded-2xl p-4 ${msg.sender === 'user' ? 'bg-teal-500 self-end rounded-tr-none' : 'bg-white self-start rounded-tl-none border border-gray-100'}`}
                            >
                                <Text className={msg.sender === 'user' ? 'text-white font-medium' : 'text-dark-900 font-medium'}>
                                    {msg.text}
                                </Text>
                            </Animated.View>
                        ))}
                    </ScrollView>

                    {/* Input Area */}
                    <View className="p-4 bg-white border-t border-gray-100">
                        <View className="flex-row items-center bg-gray-50 rounded-full px-4 border border-gray-200">
                            <TextInput
                                className="flex-1 py-3 font-medium text-dark-900"
                                placeholder="Type a message..."
                                value={inputText}
                                onChangeText={setInputText}
                                onSubmitEditing={handleSend}
                            />
                            <TouchableOpacity
                                onPress={handleSend}
                                className={`p-2 rounded-full ${inputText.trim() ? 'bg-teal-500' : 'bg-gray-300'}`}
                                disabled={!inputText.trim()}
                            >
                                <Ionicons name="send" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}
