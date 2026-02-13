import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import BASE_URL from '../../constants/api';

type Role = 'DRIVER' | 'PROVIDER' | 'ADMIN';

interface UnifiedRegisterProps {
    role: Role;
}

export default function UnifiedRegister({ role }: UnifiedRegisterProps) {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        parkingAreaName: '',
        location: '',
        totalSlots: '', // Added totalSlots
        vehicleName: '',
        vehicleNumber: '',
        vehicleType: 'Car',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // ✅ UI messages
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const config = {
        DRIVER: {
            title: 'Join ParkEase',
            themeColor: '#00B894',
            loginRoute: '/(driver)',
        },
        PROVIDER: {
            title: 'Partner Network',
            themeColor: '#6C5CE7',
            loginRoute: '/(provider)',
        },
        ADMIN: {
            title: 'Admin Access',
            themeColor: '#2D3436',
            loginRoute: '/(admin)',
        },
    };

    const currentConfig = config[role];

    // ================= REGISTER HANDLER =================
    const handleRegister = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword ||
            !formData.phone
        ) {
            setErrorMessage('Please fill in all required fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        if (role === 'PROVIDER' && !formData.location) {
            setErrorMessage('Location is required for providers');
            return;
        }

        if (role === 'DRIVER' && (!formData.vehicleName || !formData.vehicleNumber)) {
            setErrorMessage('Vehicle details are required for drivers');
            return;
        }

        const payload = {
            fullName: formData.name,
            email: formData.email,
            phoneNumber: formData.phone,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            role: role,
            parkingAreaName: formData.parkingAreaName,
            location: formData.location,
            totalSlots: role === 'PROVIDER' ? parseInt(formData.totalSlots) || 0 : undefined,
            vehicleName: role === 'DRIVER' ? formData.vehicleName : undefined,
            vehicleNumber: role === 'DRIVER' ? formData.vehicleNumber : undefined,
            vehicleType: role === 'DRIVER' ? formData.vehicleType : undefined,
        };

        try {
            setIsLoading(true);

            const response = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            let data: any = {};
            try {
                data = await response.json();
            } catch { }

            if (!response.ok) {
                setErrorMessage(data?.message || 'Registration failed');
                return;
            }


            setSuccessMessage('Registered successfully. Redirecting to login...');

            setTimeout(() => {
                router.push(currentConfig.loginRoute as any);
            }, 1500);

        } catch (error: any) {
            setErrorMessage('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ================= INPUT RENDERER =================
    const renderInput = (
        label: string,
        icon: any,
        value: string,
        key: string,
        isSecure = false,
        keyboardType = 'default',
        showPassState = false,
        setShowPassState?: (val: boolean) => void
    ) => (
        <View className="bg-gray-50 rounded-2xl px-5 py-3 border border-gray-100 mb-4">
            <Text className="text-[10px] text-gray-500 font-bold mb-1 uppercase">
                {label}
            </Text>
            <View className="flex-row items-center">
                <Ionicons name={icon} size={20} color="#9CA3AF" />
                <TextInput
                    className="flex-1 ml-3 text-base text-gray-900 font-bold"
                    value={value}
                    onChangeText={(text) =>
                        setFormData({ ...formData, [key]: text })
                    }
                    secureTextEntry={isSecure && !showPassState}
                    keyboardType={keyboardType as any}
                    autoCapitalize="none"
                />
                {isSecure && setShowPassState && (
                    <TouchableOpacity
                        onPress={() => setShowPassState(!showPassState)}
                    >
                        <Ionicons
                            name={showPassState ? 'eye' : 'eye-off'}
                            size={20}
                            color="#9CA3AF"
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="px-6 pt-16 pb-8">
                    <Animated.View entering={FadeInUp.duration(800)}>
                        <Text className="text-3xl font-black text-gray-900 mb-6">
                            {currentConfig.title}
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(200).duration(800)}>

                        {/* 🔴 ERROR MESSAGE */}
                        {errorMessage !== '' && (
                            <View className="bg-red-100 border border-red-400 p-3 rounded-xl mb-4">
                                <Text className="text-red-700 font-semibold text-center">
                                    {errorMessage}
                                </Text>
                            </View>
                        )}

                        {/* 🟢 SUCCESS MESSAGE */}
                        {successMessage !== '' && (
                            <View className="bg-green-100 border border-green-400 p-3 rounded-xl mb-4">
                                <Text className="text-green-700 font-semibold text-center">
                                    {successMessage}
                                </Text>
                            </View>
                        )}

                        {renderInput('Full Name', 'person-outline', formData.name, 'name')}

                        {role === 'DRIVER' && (
                            <>
                                {renderInput(
                                    'Vehicle Model',
                                    'car-outline',
                                    formData.vehicleName,
                                    'vehicleName'
                                )}
                                {renderInput(
                                    'License Plate Number',
                                    'card-outline',
                                    formData.vehicleNumber,
                                    'vehicleNumber'
                                )}

                                <View className="mb-4">
                                    <Text className="text-[10px] text-gray-500 font-bold mb-2 uppercase">
                                        Vehicle Type
                                    </Text>
                                    <View className="flex-row justify-between">
                                        {['Car', 'Bike', 'Truck'].map((type) => (
                                            <TouchableOpacity
                                                key={type}
                                                onPress={() => setFormData({ ...formData, vehicleType: type })}
                                                className={`flex-1 py-3 items-center justify-center rounded-2xl border mr-2 last:mr-0 ${formData.vehicleType === type
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : 'bg-gray-50 border-gray-100'
                                                    }`}
                                            >
                                                <Ionicons
                                                    name={type === 'Car' ? 'car' : type === 'Bike' ? 'bicycle' : 'bus'}
                                                    size={20}
                                                    color={formData.vehicleType === type ? 'white' : '#9CA3AF'}
                                                />
                                                <Text className={`text-[10px] font-bold uppercase mt-1 ${formData.vehicleType === type ? 'text-white' : 'text-gray-500'
                                                    }`}>
                                                    {type}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </>
                        )}

                        {role === 'PROVIDER' && (
                            <>
                                {renderInput(
                                    'Parking Area Name',
                                    'business-outline',
                                    formData.parkingAreaName,
                                    'parkingAreaName'
                                )}
                                {renderInput(
                                    'Location',
                                    'location-outline',
                                    formData.location,
                                    'location'
                                )}
                                {renderInput(
                                    'Total Slots',
                                    'grid-outline',
                                    formData.totalSlots || '',
                                    'totalSlots',
                                    false,
                                    'numeric'
                                )}
                            </>
                        )}

                        {renderInput(
                            'Email Address',
                            'mail-outline',
                            formData.email,
                            'email',
                            false,
                            'email-address'
                        )}

                        {renderInput(
                            'Phone Number',
                            'call-outline',
                            formData.phone,
                            'phone',
                            false,
                            'phone-pad'
                        )}

                        {renderInput(
                            'Password',
                            'lock-closed-outline',
                            formData.password,
                            'password',
                            true,
                            'default',
                            showPassword,
                            setShowPassword
                        )}

                        {renderInput(
                            'Confirm Password',
                            'shield-checkmark-outline',
                            formData.confirmPassword,
                            'confirmPassword',
                            true,
                            'default',
                            showConfirmPassword,
                            setShowConfirmPassword
                        )}

                        <TouchableOpacity
                            style={{ backgroundColor: currentConfig.themeColor }}
                            className="rounded-2xl py-4 items-center mt-6"
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-lg font-bold">
                                    Create Account
                                </Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
