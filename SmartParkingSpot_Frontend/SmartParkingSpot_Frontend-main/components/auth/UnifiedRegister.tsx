import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { register } from '../api/auth';
import ParkEaseLogo from '../ParkEaseLogo';

type Role = 'driver' | 'provider' | 'admin';

interface UnifiedRegisterProps {
    role: Role;
}

export default function UnifiedRegister({ role }: UnifiedRegisterProps) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [vehicleName, setVehicleName] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [vehicleType, setVehicleType] = useState('Car');

    // ===== PROVIDER SPECIFIC =====
    const [parkingAreaName, setParkingAreaName] = useState('');
    const [location, setLocation] = useState('');
    const [totalSlots, setTotalSlots] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [aadharNumber, setAadharNumber] = useState('');
    const [propertyPermitNumber, setPropertyPermitNumber] = useState('');

    const config = {
        driver: {
            title: 'Create Account',
            subtitle: 'Join the mobility revolution',
            icon: 'car-sport' as const,
            colors: ['#3B82F6', '#1D4ED8'],
            loginRoute: '/(driver)',
        },
        provider: {
            title: 'Partner Onboarding',
            subtitle: 'Scale your parking business',
            icon: 'business' as const,
            colors: ['#8B5CF6', '#6D28D9'],
            loginRoute: '/(provider)',
        },
        admin: {
            title: 'Admin Registration',
            subtitle: 'System administration access',
            icon: 'shield-checkmark' as const,
            colors: ['#1F2937', '#111827'],
            loginRoute: '/(admin)',
        },
    };

    const currentConfig = config[role];

    const handleRegister = async () => {
        if (!name || !email || !phone || !password || !confirmPassword) {
            Alert.alert('Incomplete', 'Please provide all required parameters.');
            return;
        }

        if (role === 'driver' && (!vehicleName || !vehicleNumber)) {
            Alert.alert('Incomplete', 'Please provide vehicle details.');
            return;
        }

        if (role === 'provider' && (!parkingAreaName || !location || !totalSlots || !ownerName || !aadharNumber || !propertyPermitNumber)) {
            Alert.alert('Incomplete', 'Please provide all parking hub and verification details.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Mismatch', 'Confirmation key does not match password.');
            return;
        }

        setIsLoading(true);
        console.log(`Attempting registration for ${email}...`);

        try {
            await register({
                fullName: name.trim(),
                email: email.trim(),
                phoneNumber: phone.trim(),
                password,
                confirmPassword,
                role: role.toUpperCase() as 'DRIVER' | 'PROVIDER' | 'ADMIN',
                vehicleName: role === 'driver' ? vehicleName : undefined,
                vehicleNumber: role === 'driver' ? vehicleNumber : undefined,
                vehicleType: role === 'driver' ? vehicleType : undefined,
                parkingAreaName: role === 'provider' ? parkingAreaName : undefined,
                location: role === 'provider' ? location : undefined,
                totalSlots: role === 'provider' ? (parseInt(totalSlots) || 0) : undefined,
                ownerName: role === 'provider' ? ownerName : undefined,
                aadharNumber: role === 'provider' ? aadharNumber : undefined,
                propertyPermitNumber: role === 'provider' ? propertyPermitNumber : undefined,
            });

            setIsLoading(false);
            console.log('Registration successful');

            const successMsg = (role === 'provider' || role === 'driver')
                ? `Onboarding initiated! Your ${role} account is now pending admin approval. You can access the portal once verified.`
                : 'Account successfully initialized. Proceeding to login.';

            Alert.alert('Success', successMsg, [
                { text: 'Understood', onPress: () => router.replace(currentConfig.loginRoute as any) }
            ]);
        } catch (error: any) {
            setIsLoading(false);
            console.error('Registration Error:', error);

            let errorMessage = 'Initialization failed. System error.';

            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Server connection timed out. Please check if the backend is running.';
            } else if (error.response) {
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'No response from server. Check your network or backend IP configuration.';
            } else {
                errorMessage = error.message || errorMessage;
            }

            Alert.alert('Error', errorMessage);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                {/* GRADIENT HEADER */}
                <LinearGradient
                    colors={currentConfig.colors as any}
                    className="h-72 justify-center items-center rounded-b-[60px] relative overflow-hidden shadow-2xl shadow-black/20"
                >
                    <Ionicons
                        name={currentConfig.icon}
                        size={250}
                        color="white"
                        style={{ position: 'absolute', right: -50, top: -50, opacity: 0.1 }}
                    />

                    <Animated.View entering={FadeInUp.duration(1000).springify()} className="items-center z-10">
                        <ParkEaseLogo size={80} dark={true} />
                        <Text className="text-3xl font-black text-white mt-6">{currentConfig.title}</Text>
                        <Text className="text-white/60 mt-2 text-[10px] font-black uppercase tracking-[4px]">{currentConfig.subtitle}</Text>
                    </Animated.View>
                </LinearGradient>

                {/* FORM LAYER */}
                <View className="px-8 -mt-10 mb-10">
                    <Animated.View
                        entering={FadeInDown.delay(200).duration(600)}
                        className="bg-white rounded-[45px] p-8 shadow-2xl shadow-black/5 border border-gray-100"
                    >
                        <View className="space-y-4">
                            <View className="mb-4">
                                <Text className="text-[10px] text-gray-400 font-black mb-2 uppercase tracking-widest ml-1">Full Name</Text>
                                <View className="bg-gray-50 flex-row items-center p-4 rounded-[20px] border border-gray-100">
                                    <Ionicons name="person" size={18} color="#94A3B8" />
                                    <TextInput
                                        placeholder="John Carter"
                                        placeholderTextColor="#94A3B8"
                                        value={name}
                                        onChangeText={setName}
                                        className="flex-1 ml-4 font-bold text-gray-900"
                                    />
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="text-[10px] text-gray-400 font-black mb-2 uppercase tracking-widest ml-1">Email Protocol</Text>
                                <View className="bg-gray-50 flex-row items-center p-4 rounded-[20px] border border-gray-100">
                                    <Ionicons name="mail" size={18} color="#94A3B8" />
                                    <TextInput
                                        placeholder="user@network.com"
                                        placeholderTextColor="#94A3B8"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        className="flex-1 ml-4 font-bold text-gray-900"
                                    />
                                </View>
                            </View>

                            {role === 'driver' && (
                                <>
                                    <View className="mb-4">
                                        <Text className="text-[10px] text-gray-400 font-black mb-2 uppercase tracking-widest ml-1">Vehicle Details</Text>
                                        <View className="bg-gray-50 flex-row items-center p-4 rounded-[20px] border border-gray-100 mb-3">
                                            <Ionicons name="car" size={18} color="#94A3B8" />
                                            <TextInput
                                                placeholder="Model (e.g. Tesla Model 3)"
                                                placeholderTextColor="#94A3B8"
                                                value={vehicleName}
                                                onChangeText={setVehicleName}
                                                className="flex-1 ml-4 font-bold text-gray-900"
                                            />
                                        </View>
                                        <View className="bg-gray-50 flex-row items-center p-4 rounded-[20px] border border-gray-100 mb-3">
                                            <Ionicons name="card" size={18} color="#94A3B8" />
                                            <TextInput
                                                placeholder="Plate No (e.g. MH 12 AB 1234)"
                                                placeholderTextColor="#94A3B8"
                                                value={vehicleNumber}
                                                onChangeText={setVehicleNumber}
                                                autoCapitalize="characters"
                                                className="flex-1 ml-4 font-bold text-gray-900"
                                            />
                                        </View>

                                        <View className="mb-2">
                                            <Text className="text-[10px] text-gray-400 font-black mb-2 uppercase tracking-widest ml-1">Vehicle Type</Text>
                                            <View className="flex-row justify-between">
                                                {['Car', 'Bike', 'Truck'].map((type) => (
                                                    <TouchableOpacity
                                                        key={type}
                                                        onPress={() => setVehicleType(type)}
                                                        className={`flex-1 py-3 items-center justify-center rounded-[18px] border mr-2 last:mr-0 ${vehicleType === type
                                                            ? 'bg-blue-600 border-blue-600'
                                                            : 'bg-gray-50 border-gray-100'
                                                            }`}
                                                    >
                                                        <Ionicons
                                                            name={type === 'Car' ? 'car' : type === 'Bike' ? 'bicycle' : 'bus'}
                                                            size={20}
                                                            color={vehicleType === type ? 'white' : '#94A3B8'}
                                                        />
                                                        <Text className={`text-[10px] font-black uppercase mt-1 ${vehicleType === type ? 'text-white' : 'text-gray-400'
                                                            }`}>
                                                            {type}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                </>
                            )}

                            {role === 'provider' && (
                                <>
                                    <View className="mb-4">
                                        <Text className="text-[10px] text-gray-400 font-black mb-2 uppercase tracking-widest ml-1">Parking Hub Details</Text>
                                        <View className="bg-gray-50 flex-row items-center p-4 rounded-[20px] border border-gray-100 mb-3">
                                            <Ionicons name="business" size={18} color="#94A3B8" />
                                            <TextInput
                                                placeholder="Area Name (e.g. Skyline Parking)"
                                                placeholderTextColor="#94A3B8"
                                                value={parkingAreaName}
                                                onChangeText={setParkingAreaName}
                                                className="flex-1 ml-4 font-bold text-gray-900"
                                            />
                                        </View>
                                        <View className="bg-gray-50 flex-row items-center p-4 rounded-[20px] border border-gray-100 mb-3">
                                            <Ionicons name="location" size={18} color="#94A3B8" />
                                            <TextInput
                                                placeholder="Physical Location"
                                                placeholderTextColor="#94A3B8"
                                                value={location}
                                                onChangeText={setLocation}
                                                className="flex-1 ml-4 font-bold text-gray-900"
                                            />
                                        </View>
                                        <View className="bg-gray-50 flex-row items-center p-4 rounded-[20px] border border-gray-100 mb-3">
                                            <Ionicons name="grid" size={18} color="#94A3B8" />
                                            <TextInput
                                                placeholder="Initial Total Slots Capacity"
                                                placeholderTextColor="#94A3B8"
                                                value={totalSlots}
                                                onChangeText={setTotalSlots}
                                                keyboardType="numeric"
                                                className="flex-1 ml-4 font-bold text-gray-900"
                                            />
                                        </View>

                                        <Text className="text-[10px] text-gray-400 font-black mb-2 mt-4 uppercase tracking-widest ml-1">Legal Verification</Text>
                                        <View className="bg-gray-50 flex-row items-center p-4 rounded-[20px] border border-gray-100 mb-3">
                                            <Ionicons name="person-circle" size={18} color="#94A3B8" />
                                            <TextInput
                                                placeholder="Legal Owner Name"
                                                placeholderTextColor="#94A3B8"
                                                value={ownerName}
                                                onChangeText={setOwnerName}
                                                className="flex-1 ml-4 font-bold text-gray-900"
                                            />
                                        </View>
                                        <View className="bg-gray-50 flex-row items-center p-4 rounded-[20px] border border-gray-100 mb-3">
                                            <Ionicons name="card" size={18} color="#94A3B8" />
                                            <TextInput
                                                placeholder="Aadhar Card Number (12 Digits)"
                                                placeholderTextColor="#94A3B8"
                                                value={aadharNumber}
                                                onChangeText={setAadharNumber}
                                                keyboardType="numeric"
                                                maxLength={12}
                                                className="flex-1 ml-4 font-bold text-gray-900"
                                            />
                                        </View>
                                        <TouchableOpacity className="bg-blue-50 p-4 rounded-[20px] border border-blue-100 mb-3 flex-row items-center justify-between">
                                            <View className="flex-row items-center">
                                                <Ionicons name="image" size={18} color="#3B82F6" />
                                                <Text className="ml-4 text-blue-600 font-bold">Upload Aadhar Image</Text>
                                            </View>
                                            <Ionicons name="cloud-upload" size={18} color="#3B82F6" />
                                        </TouchableOpacity>

                                        <View className="bg-gray-50 flex-row items-center p-4 rounded-[20px] border border-gray-100 mb-3">
                                            <Ionicons name="document-text" size={18} color="#94A3B8" />
                                            <TextInput
                                                placeholder="Property / Permit Number"
                                                placeholderTextColor="#94A3B8"
                                                value={propertyPermitNumber}
                                                onChangeText={setPropertyPermitNumber}
                                                className="flex-1 ml-4 font-bold text-gray-900"
                                            />
                                        </View>
                                        <TouchableOpacity className="bg-blue-50 p-4 rounded-[20px] border border-blue-100 mb-3 flex-row items-center justify-between">
                                            <View className="flex-row items-center">
                                                <Ionicons name="document-attach" size={18} color="#3B82F6" />
                                                <Text className="ml-4 text-blue-600 font-bold">Upload Property Permit</Text>
                                            </View>
                                            <Ionicons name="cloud-upload" size={18} color="#3B82F6" />
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}

                            <View className="mb-4">
                                <Text className="text-[10px] text-gray-400 font-black mb-2 uppercase tracking-widest ml-1">Phone Number</Text>
                                <View className="bg-gray-50 flex-row items-center p-4 rounded-[20px] border border-gray-100">
                                    <Ionicons name="call" size={18} color="#94A3B8" />
                                    <TextInput
                                        placeholder="1234567890"
                                        placeholderTextColor="#94A3B8"
                                        value={phone}
                                        onChangeText={setPhone}
                                        keyboardType="phone-pad"
                                        className="flex-1 ml-4 font-bold text-gray-900"
                                    />
                                </View>
                            </View>



                            <View className="mb-4">
                                <Text className="text-[10px] text-gray-400 font-black mb-2 uppercase tracking-widest ml-1">Key Password</Text>
                                <View className="bg-gray-50 flex-row items-center p-4 rounded-[20px] border border-gray-100">
                                    <Ionicons name="lock-closed" size={18} color="#94A3B8" />
                                    <TextInput
                                        placeholder="••••••••"
                                        placeholderTextColor="#94A3B8"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        className="flex-1 ml-4 font-bold text-gray-900"
                                    />
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="text-[10px] text-gray-400 font-black mb-2 uppercase tracking-widest ml-1">Confirm Key</Text>
                                <View className="bg-gray-50 flex-row items-center p-4 rounded-[20px] border border-gray-100">
                                    <Ionicons name="shield-checkmark" size={18} color="#94A3B8" />
                                    <TextInput
                                        placeholder="••••••••"
                                        placeholderTextColor="#94A3B8"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showPassword}
                                        className="flex-1 ml-4 font-bold text-gray-900"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleRegister}
                                disabled={isLoading}
                                className="mt-8 overflow-hidden rounded-[22px]"
                            >
                                <LinearGradient colors={currentConfig.colors as any} className="py-5 items-center">
                                    {isLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-black uppercase tracking-widest">Register Identity</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* ACTIONS */}
                    <View className="mt-8 items-center">
                        <View className="flex-row items-center">
                            <Text className="text-gray-400 font-bold text-xs">Existing identity? </Text>
                            <TouchableOpacity onPress={() => router.push(currentConfig.loginRoute as any)}>
                                <Text style={{ color: currentConfig.colors[0] }} className="font-black text-xs uppercase tracking-widest underline">Access Portal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

