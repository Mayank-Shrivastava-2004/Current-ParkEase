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
  View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import BASE_URL from '../../constants/api';

/* ================= TYPES ================= */

type Role = 'ADMIN' | 'DRIVER' | 'PROVIDER';

interface UnifiedForgotPasswordProps {
  role: Role;
}

/* ================= COMPONENT ================= */

export default function UnifiedForgotPassword({ role }: UnifiedForgotPasswordProps) {
  const router = useRouter();

  const [step, setStep] = useState<'EMAIL' | 'OTP' | 'RESET'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /* ================= CONFIG ================= */

  const config: Record<Role, { themeColor: string }> = {
    ADMIN: { themeColor: '#2D3436' },
    DRIVER: { themeColor: '#00B894' },
    PROVIDER: { themeColor: '#6C5CE7' },
  };

  const current = config[role];

  if (!current) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-600 font-bold">Invalid role</Text>
      </View>
    );
  }

  /* ================= HANDLERS ================= */

  const sendOtp = async () => {
    if (!email) {
      setErrorMessage('Please enter your registered email');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      setStep('OTP');
    } catch {
      setErrorMessage('Unable to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setErrorMessage('Enter the OTP sent to your email');
      return;
    }

    setErrorMessage('');
    setStep('RESET');
  };

  const resetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setErrorMessage('Fill all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);

      await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      // ✅ Go back to login cleanly
      router.replace('../index');
    } catch {
      setErrorMessage('Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-8 pt-16 pb-10">

          {/* HEADER */}
          <Animated.View entering={FadeInUp.duration(600)} className="mb-10">
            <TouchableOpacity
              onPress={() => router.replace('../index')}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mb-6"
            >
              <Ionicons name="arrow-back" size={22} />
            </TouchableOpacity>

            <Text className="text-3xl font-black text-gray-900">
              Forgot Password
            </Text>
            <Text className="text-gray-500 mt-2">
              {step === 'EMAIL' && 'Enter your registered email'}
              {step === 'OTP' && 'Enter the verification code'}
              {step === 'RESET' && 'Create a new password'}
            </Text>
          </Animated.View>

          {/* ERROR */}
          {errorMessage !== '' && (
            <View className="bg-red-100 border border-red-400 p-3 rounded-xl mb-4">
              <Text className="text-red-700 text-center font-semibold">
                {errorMessage}
              </Text>
            </View>
          )}

          {/* EMAIL STEP */}
          {step === 'EMAIL' && (
            <>
              <TextInput
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                className="bg-gray-50 rounded-xl px-5 py-4 mb-6 font-bold"
              />

              <TouchableOpacity
                onPress={sendOtp}
                style={{ backgroundColor: current.themeColor }}
                className="rounded-2xl py-4 items-center"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold">Send Code</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* OTP STEP */}
          {step === 'OTP' && (
            <>
              <TextInput
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                className="bg-gray-50 rounded-xl px-5 py-4 mb-6 font-bold"
              />

              <TouchableOpacity
                onPress={verifyOtp}
                style={{ backgroundColor: current.themeColor }}
                className="rounded-2xl py-4 items-center"
              >
                <Text className="text-white font-bold">Verify</Text>
              </TouchableOpacity>
            </>
          )}

          {/* RESET STEP */}
          {step === 'RESET' && (
            <>
              <TextInput
                placeholder="New password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                className="bg-gray-50 rounded-xl px-5 py-4 mb-4 font-bold"
              />

              <TextInput
                placeholder="Confirm password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                className="bg-gray-50 rounded-xl px-5 py-4 mb-6 font-bold"
              />

              <TouchableOpacity
                onPress={resetPassword}
                style={{ backgroundColor: current.themeColor }}
                className="rounded-2xl py-4 items-center"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold">
                    Reset Password
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
