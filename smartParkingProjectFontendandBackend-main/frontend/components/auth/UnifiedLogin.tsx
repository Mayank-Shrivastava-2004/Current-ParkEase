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
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import BASE_URL from '../../constants/api';
import { Link, type Href } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ================= TYPES ================= */

type Role = 'DRIVER' | 'PROVIDER' | 'ADMIN';

type RoleConfig = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  themeColor: string;
  dashboard: string;
  forgot: string;
  register: string;
};

interface UnifiedLoginProps {
  role: Role;
}

/* ================= COMPONENT ================= */

export default function UnifiedLogin({ role }: UnifiedLoginProps) {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /* ================= ROUTE CONFIG ================= */

  const config: Record<Role, RoleConfig> = {
    DRIVER: {
      title: 'Welcome Back',
      subtitle: 'Log in to find parking spots',
      icon: 'car-sport',
      themeColor: '#00B894',
      dashboard: '../dashboard',
      forgot: './forgot-password',
      register: './register',
    },
    PROVIDER: {
      title: 'Partner Login',
      subtitle: 'Manage your parking assets',
      icon: 'business',
      themeColor: '#6C5CE7',
      dashboard: '../dashboard',
      forgot: './forgot-password',
      register: './register',
    },
    ADMIN: {
      title: 'Admin Console',
      subtitle: 'Secure system gateway',
      icon: 'shield-checkmark',
      themeColor: '#2D3436',
      dashboard: '../dashboard',
      forgot: './forgot-password',
      register: './register',
    },
  };

  const current = config[role];

  /* ================= LOGIN HANDLER ================= */

  const handleLogin = async () => {
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter email and password');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data = null;

try {
  data = await response.json();
} catch {
  data = null;
}

if (!response.ok) {
  setErrorMessage(data?.message || 'Login failed');
  return;
}


      if (!response.ok) {
        setErrorMessage(data.message || 'Invalid credentials');
        return;
      }

      /* ================= CRITICAL FIX ================= */

      // ✅ Store token EXACTLY as backend expects
      localStorage.setItem('token', data.token);
localStorage.setItem('role', data.role);

// ALSO store for React Native compatibility
await AsyncStorage.setItem('token', data.token);
await AsyncStorage.setItem('role', data.role);


      // ❗ Prevent non-admin accessing admin
      if (role === 'ADMIN' && data.role !== 'ADMIN') {
        setErrorMessage('Access denied: Not an admin account');
        return;
      }

      setEmail('');
      setPassword('');

      // ✅ Replace prevents back navigation to login
      router.replace(current.dashboard as Href);

    } catch (err) {
      console.error(err);
      setErrorMessage('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#fff' }}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 32, paddingTop: 64 }}>

          {/* HEADER */}
          <Animated.View
            entering={FadeInUp.duration(600)}
            style={{ alignItems: 'center', marginBottom: 32 }}
          >
            <Ionicons
              name={current.icon}
              size={48}
              color={current.themeColor}
            />
            <Text style={{ fontSize: 28, fontWeight: '900', marginTop: 16 }}>
              {current.title}
            </Text>
            <Text style={{ color: '#6B7280', marginTop: 6 }}>
              {current.subtitle}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600)}>

            {/* ERROR */}
            {errorMessage !== '' && (
              <View
                style={{
                  backgroundColor: '#FEE2E2',
                  padding: 12,
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: '#B91C1C', textAlign: 'center' }}>
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* EMAIL */}
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                backgroundColor: '#F9FAFB',
                borderRadius: 16,
                padding: 14,
                marginBottom: 16,
                fontWeight: '700',
              }}
            />

            {/* PASSWORD */}
            <View
              style={{
                backgroundColor: '#F9FAFB',
                borderRadius: 16,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={{ flex: 1, fontWeight: '700' }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {/* FORGOT PASSWORD */}
            <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
              <Link href={current.forgot as any} asChild>
                <TouchableOpacity>
                  <Text style={{ color: current.themeColor, fontWeight: '700' }}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* LOGIN */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={{
                backgroundColor: current.themeColor,
                padding: 16,
                borderRadius: 20,
                alignItems: 'center',
                marginTop: 20,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>
                  LOG IN
                </Text>
              )}
            </TouchableOpacity>

            {/* REGISTER */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
              <Text style={{ color: '#6B7280' }}>
                Don’t have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push(current.register as Href)}>
                <Text style={{ color: current.themeColor, fontWeight: '800' }}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
