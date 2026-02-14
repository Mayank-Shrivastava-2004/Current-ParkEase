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
    Modal,
    Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedHeader from '../../components/UnifiedHeader';
import UnifiedSidebar from '../../components/UnifiedSidebar';

import BASE_URL from '../../constants/api';

const API = BASE_URL;

/* ===== AUDIT TRAILS MODAL ===== */
function AuditTrailsModal({ visible, onClose }: { visible: boolean, onClose: () => void }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            fetchLogs();
        }
    }, [visible]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/admin/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data.slice(0, 10)); // Current latest 10
            }
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 bg-black/60 justify-end">
                <View className="bg-white rounded-t-[40px] p-8 h-[70%]">
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-2xl font-black text-gray-900">Audit Trails</Text>
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">System Activity Logs</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator color="#4F46E5" />
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {logs.length === 0 ? (
                                <Text className="text-center text-gray-400 mt-10 font-bold uppercase tracking-widest text-[10px]">No activity recorded</Text>
                            ) : logs.map((log: any, i) => (
                                <View key={i} className="mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <View className="flex-row justify-between mb-1">
                                        <Text className="text-indigo-600 font-black text-[8px] uppercase">{log.type || 'SYSTEM'}</Text>
                                        <Text className="text-gray-400 text-[8px] font-bold">{new Date(log.createdAt).toLocaleString()}</Text>
                                    </View>
                                    <Text className="text-gray-900 font-semibold text-xs leading-relaxed">{log.message}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
}

export default function AdminProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [auditVisible, setAuditVisible] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [profile, setProfile] = useState<any>({
        name: 'System Analyst',
        email: 'Loading...',
        phone: 'Loading...',
        address: 'Loading...',
        role: 'ADMIN',
        supportHotline: '+91-XXXXXXXXXX'
    });
    const [editedProfile, setEditedProfile] = useState<any>({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    const adminGradient: readonly [string, string, ...string[]] = ['#4F46E5', '#312E81'];

    const menuItems = [
        { icon: 'grid', label: 'Dashboard', route: '/(admin)/dashboard' },
        { icon: 'people', label: 'Manage Drivers', route: '/(admin)/drivers' },
        { icon: 'business', label: 'Manage Providers', route: '/(admin)/providers' },
        { icon: 'alert-circle', label: 'Disputes', route: '/(admin)/disputes' },
        { icon: 'notifications', label: 'Notifications', route: '/(admin)/notifications' },
        { icon: 'bar-chart', label: 'Analytics', route: '/(admin)/analytics' },
        { icon: 'person-circle', label: 'Account Profile', route: '/(admin)/profile' },
        { icon: 'settings', label: 'Settings', route: '/(admin)/settings' },
    ];

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            // Load Theme
            const settingsStr = await AsyncStorage.getItem('admin_settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                setIsDark(settings.darkMode ?? false);
            }

            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API}/api/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setEditedProfile(data);
                if (data.name) {
                    await AsyncStorage.setItem('userName', data.name);
                }
                if (data.role) {
                    await AsyncStorage.setItem('userRole', data.role);
                }
            } else {
                const errorData = await res.text();
                Alert.alert('System Error', `Failed to synchronize data (Status: ${res.status}). ${errorData}`);
            }
        } catch (err) {
            console.error('Profile load failed:', err);
            Alert.alert('Connection Error', 'Could not establish a link to the backend server. Please check your network IP.');
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            // 1. Update Profile Details
            const res = await fetch(`${API}/api/admin/update-profile`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedProfile),
            });

            // 2. Handle Password Change if provided
            if (editedProfile.currentPassword && editedProfile.newPassword) {
                const passRes = await fetch(`${API}/api/profile/change-password`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        currentPassword: editedProfile.currentPassword,
                        newPassword: editedProfile.newPassword
                    }),
                });

                if (!passRes.ok) {
                    const error = await passRes.json();
                    Alert.alert('Security Alert', error.message || 'Failed to update password');
                    return;
                }
            }

            if (res.ok) {
                setProfile(editedProfile);
                setEditMode(false);
                if (editedProfile.name) {
                    await AsyncStorage.setItem('userName', editedProfile.name);
                }
                Alert.alert('Success', 'Profile synchronization complete.');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to update credentials');
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/' as any);
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-4 text-indigo-500 font-bold uppercase tracking-widest text-[8px]">Validating Integrity...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <StatusBar barStyle="light-content" />

            <UnifiedHeader
                title="Admin Identity"
                subtitle="Root Credentials"
                role="admin"
                gradientColors={adminGradient}
                onMenuPress={() => setSidebarOpen(true)}
                userName={profile.name}
                showBackButton={true}
            />

            <UnifiedSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userName={profile.name}
                userRole={profile.role}
                userStatus="Root Access Active"
                menuItems={menuItems}
                onLogout={handleLogout}
                gradientColors={adminGradient}
                dark={isDark}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* PROFILE HERO */}
                <View className="px-5 mt-6">
                    <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-indigo-50'} rounded-[40px] p-8 shadow-2xl shadow-black/5 border items-center`}>
                        <View className={`w-28 h-28 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'} rounded-[40px] items-center justify-center mb-6 relative overflow-hidden`}>
                            {profile.profileImage ? (
                                <Image
                                    source={{ uri: profile.profileImage }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <Text className="text-indigo-500 text-5xl font-black">
                                    {profile.name?.charAt(0).toUpperCase() || 'A'}
                                </Text>
                            )}
                            <TouchableOpacity
                                className="absolute -bottom-1 -right-1 w-9 h-9 bg-indigo-600 rounded-2xl items-center justify-center border-4 border-slate-900 shadow-lg"
                            >
                                <Ionicons name="shield-checkmark" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                        <Text className={`${isDark ? 'text-white' : 'text-gray-900'} text-3xl font-black tracking-tight`}>{profile.name}</Text>
                        <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[4px] mt-2">{profile.role || 'Super Admin'}</Text>
                    </View>
                </View>

                {/* FORM FIELDS */}
                <View className="px-5 mt-10">
                    <View className="flex-row items-center justify-between mb-6 px-2">
                        <Text className={`font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Security Access</Text>
                        {!editMode ? (
                            <TouchableOpacity onPress={() => setEditMode(true)}>
                                <Text className="text-indigo-500 font-black text-[10px] uppercase tracking-widest">Override</Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="flex-row gap-4">
                                <TouchableOpacity onPress={() => setEditMode(false)}>
                                    <Text className="text-gray-500 font-black text-[10px] uppercase tracking-widest">Abort</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={saveProfile}>
                                    <Text className="text-indigo-500 font-black text-[10px] uppercase tracking-widest">Commit</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {[
                        { label: 'Operational Name', value: editedProfile.name, key: 'name', icon: 'person' },
                        { label: 'Secure Email', value: editedProfile.email, key: 'email', icon: 'mail' },
                        { label: 'System Hotline', value: profile.supportHotline, key: 'phone', icon: 'call' },
                        { label: 'Command Station', value: editedProfile.address, key: 'address', icon: 'location' },
                        { label: 'Profile Image URL', value: editedProfile.profileImage, key: 'profileImage', icon: 'image' },
                    ].map((field, i) => (
                        <View key={i} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-[32px] p-6 mb-4 border shadow-sm flex-row items-center`}>
                            <View className={`w-12 h-12 ${isDark ? 'bg-slate-800' : 'bg-gray-50'} rounded-2xl items-center justify-center mr-5`}>
                                <Ionicons name={field.icon as any} size={20} color="#6366F1" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">{field.label}</Text>
                                {editMode && (field.key !== 'email') ? (
                                    <TextInput
                                        className={`${isDark ? 'text-white' : 'text-gray-900'} font-black text-base p-0`}
                                        value={field.value}
                                        onChangeText={(t) => setEditedProfile({ ...editedProfile, [field.key]: t })}
                                        placeholder={`Enter ${field.label}`}
                                        placeholderTextColor={isDark ? "#475569" : "#CBD5E1"}
                                    />
                                ) : (
                                    <Text className={`${isDark ? 'text-white' : 'text-gray-900'} font-black text-base`} numberOfLines={1}>{field.value || 'NOT_CONFIGURED'}</Text>
                                )}
                            </View>
                            {field.key === 'email' && (
                                <View className={`${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'} px-2 py-1 rounded-lg border`}>
                                    <Text className="text-emerald-500 text-[8px] font-black uppercase tracking-tighter">Verified</Text>
                                </View>
                            )}
                        </View>
                    ))}

                    {/* PASSWORD UPDATE SECTION */}
                    {editMode && (
                        <View className="mt-6 mb-10">
                            <Text className={`font-black text-lg mb-4 ml-2 ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>Security Credentials</Text>

                            <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-[32px] p-6 mb-4 border shadow-sm`}>
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">Current Password</Text>
                                <TextInput
                                    className={`${isDark ? 'text-white' : 'text-gray-900'} font-black text-base p-0`}
                                    placeholder="••••••••"
                                    placeholderTextColor={isDark ? "#475569" : "#CBD5E1"}
                                    secureTextEntry
                                    onChangeText={(t) => setEditedProfile({ ...editedProfile, currentPassword: t })}
                                />
                            </View>

                            <View className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-[32px] p-6 border shadow-sm`}>
                                <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">New Password</Text>
                                <TextInput
                                    className={`${isDark ? 'text-white' : 'text-gray-900'} font-black text-base p-0`}
                                    placeholder="••••••••"
                                    placeholderTextColor={isDark ? "#475569" : "#CBD5E1"}
                                    secureTextEntry
                                    onChangeText={(t) => setEditedProfile({ ...editedProfile, newPassword: t })}
                                />
                            </View>
                        </View>
                    )}
                </View>

                {/* SYSTEM LOGS ACTION */}
                <View className="px-5 mt-6">
                    <TouchableOpacity
                        onPress={() => setAuditVisible(true)}
                        className={`rounded-[35px] p-8 flex-row items-center justify-between shadow-2xl ${isDark ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-gray-900 shadow-black/20'}`}
                    >
                        <View>
                            <Text className="text-white text-xl font-black">Audit Trails</Text>
                            <Text className="text-white/60 text-xs mt-1 font-medium">System activities & event logs</Text>
                        </View>
                        <Ionicons name="shield" size={32} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className={`mt-6 py-6 rounded-[35px] border items-center justify-center ${isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}
                    >
                        <Text className="text-rose-500 font-black uppercase tracking-widest text-xs">Terminate Command Session</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <AuditTrailsModal visible={auditVisible} onClose={() => setAuditVisible(false)} />
        </View>
    );
}
