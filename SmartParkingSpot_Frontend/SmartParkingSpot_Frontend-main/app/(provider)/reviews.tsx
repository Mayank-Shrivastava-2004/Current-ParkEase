import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';
import BASE_URL from '../../constants/api';

const API = BASE_URL;

export default function ProviderReviewsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Provider');
    const [isDark, setIsDark] = useState(false);
    const [data, setData] = useState<any>({
        summary: {
            averageRating: 0,
            totalReviews: 0,
            fiveStars: 0,
            fourStars: 0,
            threeStars: 0,
            twoStars: 0,
            oneStars: 0,
        },
        reviews: [],
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);

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

    const loadReviews = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/provider/reviews`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error('Reviews load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initialize = async () => {
            try {
                // Load Theme
                const settingsStr = await AsyncStorage.getItem('admin_settings');
                if (settingsStr) {
                    const settings = JSON.parse(settingsStr);
                    setIsDark(settings.darkMode ?? false);
                }

                const name = await AsyncStorage.getItem('userName');
                if (name) setUserName(name);

                const userStr = await AsyncStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setUserId(user.id);
                }

                await loadReviews();
            } catch (err) {
                console.error('Initial load failed:', err);
                setLoading(false);
            }
        };
        initialize();
    }, []);

    const submitFeedback = async () => {
        if (!newComment.trim()) {
            Alert.alert('Hold on', 'Please share some thoughts in your feedback.');
            return;
        }

        setSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('token');
            // For testing, the provider is reviewing themselves or a peer
            const res = await fetch(`${API}/api/reviews`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    providerId: userId, // Reviewing self for test
                    rating: newRating,
                    comment: newComment.trim(),
                }),
            });

            if (res.ok) {
                setModalVisible(false);
                setNewComment('');
                setNewRating(5);
                Alert.alert('Thank You', 'Your feedback has been successfully submitted and indexed.');
                loadReviews(); // Refresh list
            } else {
                Alert.alert('Error', 'We could not process your feedback at this time.');
            }
        } catch (err) {
            Alert.alert('System Error', 'Connection to feedback server failed.');
        } finally {
            setSubmitting(false);
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
                <Text className="mt-4 text-amber-600 font-bold uppercase tracking-widest text-xs">Loading Reviews...</Text>
            </View>
        );
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <Ionicons
                key={index}
                name={index < rating ? 'star' : 'star-outline'}
                size={16}
                color="#FBBF24"
            />
        ));
    };

    const ratingData = [
        { stars: 5, count: data.summary.fiveStars },
        { stars: 4, count: data.summary.fourStars },
        { stars: 3, count: data.summary.threeStars },
        { stars: 2, count: data.summary.twoStars },
        { stars: 1, count: data.summary.oneStars },
    ];

    const maxCount = Math.max(...ratingData.map(r => r.count), 1);

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Reviews"
                subtitle="Customer Feedback"
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
                userStatus="Feedback Synced"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={providerGradient}
                dark={isDark}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* HERO RATING CARD */}
                <View className="px-5 mt-6">
                    <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-50 shadow-amber-900/10'} rounded-[40px] p-8 shadow-2xl border items-center`}>
                        <Text className={`text-6xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{data.summary.averageRating}</Text>
                        <View className="flex-row my-4">
                            {renderStars(Math.round(data.summary.averageRating))}
                        </View>
                        <Text className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                            Based on {data.summary.totalReviews} total reviews
                        </Text>

                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            className="mt-8 bg-amber-500 px-10 py-4 rounded-2xl shadow-lg shadow-amber-500/30"
                        >
                            <Text className="text-white font-black uppercase tracking-widest text-[10px]">Provide Feedback</Text>
                        </TouchableOpacity>

                        {/* RATING DISTRIBUTION */}
                        <View className="w-full mt-10">
                            {ratingData.map((item, index) => {
                                const percentage = (item.count / maxCount) * 100;
                                return (
                                    <View key={index} className="flex-row items-center mb-4">
                                        <Text className={`font-black w-10 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{item.stars} ★</Text>
                                        <View className={`flex-1 ${isDark ? 'bg-slate-800' : 'bg-gray-100'} rounded-full h-2 mx-4 overflow-hidden`}>
                                            <View
                                                className="bg-amber-500 h-full rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </View>
                                        <Text className={`font-black w-12 text-right ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{item.count}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>

                {/* REVIEWS LIST */}
                <View className="px-5 mt-10">
                    <Text className={`font-black text-2xl tracking-tight mb-8 px-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Feedback</Text>
                    {data.reviews.map((review: any, index: number) => (
                        <View key={index} className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-gray-100 shadow-sm'} rounded-[32px] p-6 mb-5 border shadow-sm`}>
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center flex-1">
                                    <View className={`w-14 h-14 ${isDark ? 'bg-slate-800' : 'bg-amber-50'} rounded-2xl items-center justify-center mr-4`}>
                                        <Text className="text-amber-500 font-black text-xl">
                                            {review.customer.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`font-black text-lg tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{review.customer}</Text>
                                        <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">{review.date}</Text>
                                    </View>
                                </View>
                                <View className="flex-row">
                                    {renderStars(review.rating)}
                                </View>
                            </View>

                            <View className={`h-[1px] w-full mb-4 ${isDark ? 'bg-slate-800' : 'bg-gray-50'}`} />

                            <Text className={`font-medium leading-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{review.comment}</Text>
                        </View>
                    ))}

                    {data.reviews.length === 0 && (
                        <View className="items-center justify-center py-20">
                            <Ionicons name="chatbubbles-outline" size={64} color={isDark ? '#1E293B' : '#E2E8F0'} />
                            <Text className="text-gray-400 font-black uppercase tracking-widest text-xs mt-4">No reviews yet</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* FEEDBACK MODAL */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View className="flex-1 bg-black/60 justify-end">
                    <Animated.View entering={FadeInUp} className={`${isDark ? 'bg-slate-900' : 'bg-white'} rounded-t-[50px] p-8 pb-12`}>
                        <View className={`w-16 h-1.5 rounded-full self-center mb-10 ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`} />

                        <Text className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Feedback</Text>
                        <Text className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-8">Share your experience</Text>

                        <View className="mb-8 items-center">
                            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">Rating</Text>
                            <View className="flex-row gap-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity key={star} onPress={() => setNewRating(star)}>
                                        <Ionicons
                                            name={star <= newRating ? 'star' : 'star-outline'}
                                            size={40}
                                            color="#FBBF24"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="mb-10">
                            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3 ml-2">Comment</Text>
                            <TextInput
                                placeholder="Describe your experience..."
                                placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
                                value={newComment}
                                onChangeText={setNewComment}
                                multiline
                                numberOfLines={4}
                                className={`${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'} rounded-2xl p-5 font-bold border h-32 textAlignVertical-top`}
                            />
                        </View>

                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className={`flex-1 py-5 rounded-2xl items-center ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}
                            >
                                <Text className={`font-black uppercase tracking-widest text-xs ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={submitFeedback}
                                disabled={submitting}
                                className="flex-[2] bg-amber-500 py-5 rounded-2xl items-center shadow-lg shadow-amber-500/30"
                            >
                                {submitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-black uppercase tracking-widest text-xs">Submit Review</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
