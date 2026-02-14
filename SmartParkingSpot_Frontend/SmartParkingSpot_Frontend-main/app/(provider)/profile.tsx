import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import BASE_URL from '../../constants/api';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import axios from 'axios';

const API = BASE_URL;

export default function ProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [profile, setProfile] = useState<any>({
        name: 'Provider',
        email: '',
        phone: '',
        address: '',
        role: 'PROVIDER',
        joinedDate: '-',
        aadharNumber: '-',
        permitNumber: '-',
        bankName: '-',
        accountNumber: '-',
        ifscCode: '-',
    });
    const [editedProfile, setEditedProfile] = useState<any>({});

    const providerGradient: readonly [string, string, ...string[]] = ['#8B5CF6', '#6D28D9'];

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await axios.get(`${API}/api/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 200) {
                setProfile(res.data);
                setEditedProfile(res.data);
            }
        } catch (err) {
            console.error('Profile load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await axios.put(`${API}/api/profile`, editedProfile, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            if (res.status === 200) {
                setProfile(editedProfile);
                setEditMode(false);
                Alert.alert('Protocol Success', 'Provider identity and financial records updated.');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to update provider records');
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="mt-4 text-purple-600 font-bold uppercase tracking-widest text-xs">Syncing Identity...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <UnifiedHeader
                title="Hub Controller"
                subtitle="Identity & Finance"
                role="provider"
                gradientColors={providerGradient}
                onMenuPress={() => { }}
                userName={profile.name}
                showBackButton={true}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* PROFILE HERO */}
                <View className="px-6 -mt-12">
                    <Animated.View entering={ZoomIn} className="bg-white rounded-[60px] p-12 shadow-2xl shadow-indigo-900/10 border border-white items-center">
                        <View className="w-40 h-40 bg-purple-50 rounded-[50px] items-center justify-center mb-8 relative border border-purple-100 shadow-inner">
                            <Text className="text-7xl font-black text-purple-600">
                                {profile.name.charAt(0).toUpperCase()}
                            </Text>
                            <View className="absolute -bottom-2 -right-2 w-14 h-14 bg-emerald-500 rounded-[22px] items-center justify-center border-4 border-white shadow-xl">
                                <Ionicons name="shield-checkmark" size={32} color="white" />
                            </View>
                        </View>
                        <Text className="text-4xl font-black text-gray-900 tracking-tighter">{profile.name}</Text>
                        <View className="bg-gray-50 px-6 py-2 rounded-full mt-4 border border-gray-100">
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px]">{profile.role} • Verified Partner</Text>
                        </View>
                    </Animated.View>
                </View>

                {/* BASIC INFO */}
                <View className="px-7 mt-16">
                    <View className="flex-row items-center justify-between mb-10 px-4">
                        <Text className="font-black text-3xl text-gray-900 tracking-tighter">Core Identity</Text>
                        {!editMode ? (
                            <TouchableOpacity onPress={() => setEditMode(true)} className="bg-purple-100 px-6 py-2.5 rounded-full">
                                <Text className="text-purple-700 font-black text-[10px] uppercase tracking-widest">Edit Profile</Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="flex-row gap-4">
                                <TouchableOpacity onPress={() => setEditMode(false)} className="bg-gray-100 px-6 py-2.5 rounded-full">
                                    <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Abort</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={saveProfile} className="bg-emerald-600 px-6 py-2.5 rounded-full shadow-lg shadow-emerald-600/30">
                                    <Text className="text-white font-black text-[10px] uppercase tracking-widest">Commit</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <Animated.View entering={FadeInUp.delay(200)} className="bg-white rounded-[50px] p-10 border border-white shadow-sm mb-12">
                        {[
                            { label: 'Full Legal Name', key: 'name', icon: 'person-outline' },
                            { label: 'Digital Address (Email)', key: 'email', icon: 'mail-outline' },
                            { label: 'Mobile Terminal', key: 'phone', icon: 'phone-portrait-outline' },
                            { label: 'Physical Location', key: 'address', icon: 'location-outline' },
                        ].map((field, i) => (
                            <View key={field.key} className={i !== 0 ? 'mt-10' : ''}>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[4px] mb-4 ml-4">{field.label}</Text>
                                <View className={`bg-gray-50 rounded-3xl p-6 border ${field.key === 'email' ? 'border-gray-50' : 'border-gray-100'}`}>
                                    <View className="flex-row items-center">
                                        <Ionicons name={field.icon as any} size={20} color="#94A3B8" className="mr-4" />
                                        {editMode && field.key !== 'email' ? (
                                            <TextInput
                                                className="flex-1 font-black text-xl text-gray-900"
                                                value={editedProfile[field.key]}
                                                onChangeText={(val) => setEditedProfile({ ...editedProfile, [field.key]: val })}
                                            />
                                        ) : (
                                            <Text className="font-black text-xl text-gray-900">{profile[field.key]}</Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </Animated.View>

                    {/* SETTLEMENT DETAILS */}
                    <Text className="font-black text-3xl text-gray-900 tracking-tighter mb-10 px-4">Settlement Credentials</Text>
                    <Animated.View entering={FadeInUp.delay(400)} className="bg-gray-900 rounded-[60px] p-12 shadow-2xl shadow-gray-900/40 border border-gray-800">
                        {[
                            { label: 'Financial Institution', key: 'bankName', icon: 'business-outline' },
                            { label: 'Settlement Account', key: 'accountNumber', icon: 'card-outline' },
                            { label: 'Institutional Code', key: 'ifscCode', icon: 'finger-print-outline' },
                        ].map((field, i) => (
                            <View key={field.key} className={i !== 0 ? 'mt-10' : ''}>
                                <Text className="text-white/30 text-[9px] font-black uppercase tracking-[4px] mb-4 ml-4">{field.label}</Text>
                                <View className="bg-white/5 rounded-3xl p-6 border border-white/5 shadow-inner">
                                    <View className="flex-row items-center">
                                        <Ionicons name={field.icon as any} size={20} color="rgba(255,255,255,0.2)" className="mr-4" />
                                        {editMode ? (
                                            <TextInput
                                                className="flex-1 font-black text-xl text-white"
                                                value={editedProfile[field.key]}
                                                onChangeText={(val) => setEditedProfile({ ...editedProfile, [field.key]: val })}
                                                placeholderTextColor="rgba(255,255,255,0.2)"
                                            />
                                        ) : (
                                            <Text className="font-black text-xl text-white">{profile[field.key] || 'Not Configured'}</Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </Animated.View>
                </View>
            </ScrollView>
        </View>
    );
}
