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
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UnifiedHeader from '../../components/UnifiedHeader';
import BASE_URL from '../../constants/api';
import axios from 'axios';

const API = BASE_URL;

export default function ProviderReviewsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Provider');
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

    const loadReviews = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await axios.get(`${API}/api/provider/reviews`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 200) {
                setData(res.data);
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
            const res = await axios.post(`${API}/api/reviews`, {
                providerId: userId,
                rating: newRating,
                comment: newComment.trim(),
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (res.status === 200 || res.status === 201) {
                setModalVisible(false);
                setNewComment('');
                setNewRating(5);
                Alert.alert('Thank You', 'Your feedback has been successfully submitted and indexed.');
                loadReviews();
            }
        } catch (err) {
            Alert.alert('System Error', 'Connection to feedback server failed.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text className="mt-4 text-amber-600 font-bold uppercase tracking-widest text-xs">Aggregating Feedback...</Text>
            </View>
        );
    }

    const renderStars = (rating: number, size = 16) => {
        return (
            <View className="flex-row">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Ionicons
                        key={index}
                        name={index < rating ? 'star' : 'star-outline'}
                        size={size}
                        color="#FBBF24"
                        style={{ marginRight: 2 }}
                    />
                ))}
            </View>
        );
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
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <UnifiedHeader
                title="Reviews"
                subtitle="Customer Feedback"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => { }}
                userName={userName}
                showBackButton={true}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* HERO RATING CARD */}
                <View className="px-6 -mt-12">
                    <Animated.View entering={ZoomIn} className="bg-white rounded-[60px] p-12 shadow-2xl shadow-amber-900/10 border border-white items-center">
                        <Text className="text-7xl font-black text-gray-900 tracking-tighter">{data.summary.averageRating}</Text>
                        <View className="my-6">
                            {renderStars(Math.round(data.summary.averageRating), 32)}
                        </View>
                        <Text className="text-gray-400 font-black uppercase tracking-[3px] text-[10px]">
                            Based on {data.summary.totalReviews} Protocol Interactions
                        </Text>

                        {/* RATING DISTRIBUTION */}
                        <View className="w-full mt-12 bg-gray-50/50 p-8 rounded-[40px] border border-gray-50">
                            {ratingData.map((item, index) => {
                                const percentage = (item.count / maxCount) * 100;
                                return (
                                    <View key={index} className="flex-row items-center mb-5">
                                        <Text className="font-black w-10 text-gray-400 text-[10px]">{item.stars} ★</Text>
                                        <View className="flex-1 bg-gray-200 rounded-full h-2 mx-4 overflow-hidden border border-gray-100 shadow-inner">
                                            <View
                                                className="bg-amber-400 h-full rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </View>
                                        <Text className="font-black w-10 text-right text-gray-900 text-[10px] tracking-tighter">{item.count}</Text>
                                    </View>
                                );
                            })}
                        </View>

                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            activeOpacity={0.9}
                            className="mt-10 bg-gray-900 px-12 py-5 rounded-[28px] shadow-xl shadow-gray-900/30 border border-gray-800"
                        >
                            <Text className="text-white font-black uppercase tracking-[3px] text-[10px]">Provide Feedback</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* REVIEWS LIST */}
                <View className="px-8 mt-16">
                    <Text className="font-black text-3xl tracking-tighter mb-10 text-gray-900 px-2">Institutional Feed</Text>
                    {data.reviews.map((review: any, index: number) => (
                        <Animated.View key={index} entering={FadeInUp.delay(index * 100)}>
                            <View className="bg-white rounded-[45px] p-8 mb-8 border border-white shadow-sm">
                                <View className="flex-row items-center justify-between mb-6">
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-16 h-16 bg-amber-50 rounded-[24px] items-center justify-center mr-6 border border-amber-100/50">
                                            <Text className="text-amber-600 font-black text-2xl">
                                                {review.customer.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="font-black text-xl tracking-tight text-gray-900">{review.customer}</Text>
                                            <Text className="text-gray-400 text-[9px] font-black uppercase tracking-[3px] mt-1">{review.date}</Text>
                                        </View>
                                    </View>
                                    <View className="bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                                        {renderStars(review.rating, 14)}
                                    </View>
                                </View>

                                <View className="h-[1.5px] w-full mb-6 bg-gray-50/50" />

                                <Text className="font-medium text-lg leading-7 tracking-tight text-gray-600 px-2">{review.comment}</Text>
                            </View>
                        </Animated.View>
                    ))}

                    {data.reviews.length === 0 && (
                        <Animated.View entering={ZoomIn} className="items-center justify-center py-20 px-12">
                            <View className="w-32 h-32 bg-white rounded-[60px] items-center justify-center mb-10 shadow-sm border border-gray-50">
                                <Ionicons name="chatbubbles-outline" size={56} color="#E2E8F0" />
                            </View>
                            <Text className="text-gray-400 font-black uppercase tracking-[4px] text-xs text-center leading-relaxed">No customer records detected in the feedback archive</Text>
                        </Animated.View>
                    )}
                </View>
            </ScrollView>

            {/* FEEDBACK MODAL */}
            <Modal visible={modalVisible} transparent animationType="slide" statusBarTranslucent>
                <View className="flex-1 bg-black/80 justify-end">
                    <TouchableOpacity activeOpacity={1} className="flex-1" onPress={() => setModalVisible(false)} />
                    <Animated.View entering={FadeInUp} className="bg-white rounded-t-[70px] p-12 pb-20 shadow-2xl">
                        <View className="w-20 h-1.5 rounded-full self-center mb-12 bg-gray-100" />

                        <Text className="text-5xl font-black mb-3 text-gray-900 tracking-tighter">Feedback</Text>
                        <Text className="text-gray-400 font-black uppercase tracking-[3px] text-[11px] mb-12">Submit Peer Performance Record</Text>

                        <View className="mb-10 items-center">
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[4px] mb-6">Integrity Rating</Text>
                            <View className="flex-row gap-5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity key={star} onPress={() => setNewRating(star)} activeOpacity={0.7}>
                                        <Ionicons
                                            name={star <= newRating ? 'star' : 'star-outline'}
                                            size={44}
                                            color="#FBBF24"
                                            className="shadow-lg"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="mb-12">
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[4px] mb-4 ml-6">Operational Notes</Text>
                            <View className="bg-gray-50 rounded-[40px] p-8 border border-gray-100 shadow-inner">
                                <TextInput
                                    placeholder="Describe your experience..."
                                    placeholderTextColor="#94A3B8"
                                    value={newComment}
                                    onChangeText={setNewComment}
                                    multiline
                                    numberOfLines={4}
                                    className="font-black text-xl text-gray-900 min-h-[120px]"
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>

                        <View className="flex-row gap-6">
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="flex-1 py-8 rounded-[35px] items-center bg-gray-50 border border-gray-100"
                            >
                                <Text className="font-black uppercase tracking-[4px] text-[11px] text-gray-400">Abort</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={submitFeedback}
                                disabled={submitting}
                                activeOpacity={0.9}
                                className="flex-[2] bg-amber-500 py-8 rounded-[35px] items-center shadow-2xl shadow-amber-500/40 border border-amber-400"
                            >
                                {submitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-black uppercase tracking-[4px] text-[11px]">Commit Review</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
