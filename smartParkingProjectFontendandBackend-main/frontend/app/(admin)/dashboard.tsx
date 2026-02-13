import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import NotificationBell from '../../components/admin/NotificationBell'; // ✅ ADD THIS
import BASE_URL from '../../constants/api';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);

  /* ===== FETCH ADMIN ANALYTICS ===== */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('token')
            : null;

        if (!token) return;

        const res = await fetch(
          `${BASE_URL}/api/admin/analytics`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!res.ok) return;

        const text = await res.text();
        if (!text) return;

        setAnalytics(JSON.parse(text));
      } catch (err) {
        console.error(err);
      }
    };

    loadDashboard();
  }, []);

  if (!analytics?.userGrowth) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading dashboard…</Text>
      </View>
    );
  }

  const totalUsers =
    (analytics.userGrowth?.drivers?.total ?? 0) +
    (analytics.userGrowth?.providers?.total ?? 0);

  const weeklyGrowth =
    (analytics.userGrowth?.drivers?.newThisWeek ?? 0) +
    (analytics.userGrowth?.providers?.newThisWeek ?? 0);

  return (
    <View className="flex-1 bg-admin-bg">
      <StatusBar barStyle="light-content" />

      {/* ===== HEADER ===== */}
      <LinearGradient
        colors={['#2D3436', '#636E72']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="pt-16 pb-6 px-6"
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-300 font-bold text-lg uppercase tracking-widest">
              Administrator
            </Text>
            <Text className="text-white text-3xl font-black">
              System Overview
            </Text>
          </View>

          {/* 🔔 WORKING NOTIFICATION BELL */}
          <NotificationBell />
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 -mt-4 bg-gray-50 rounded-t-[30px] px-6 pt-8"
        showsVerticalScrollIndicator={false}
      >
        {/* ===== KEY METRICS ===== */}
        <Text className="text-dark-900 font-bold text-lg mb-4">
          Key Metrics
        </Text>

        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 gap-4">
            <View className="bg-white p-5 rounded-3xl border border-gray-100">
              <View className="w-10 h-10 bg-gray-200 rounded-full justify-center items-center mb-3">
                <Ionicons name="people" size={20} color="#2D3436" />
              </View>
              <Text className="text-gray-400 text-[10px] font-bold uppercase">
                Total Users
              </Text>
              <Text className="text-2xl font-black mt-1">
                {totalUsers}
              </Text>
            </View>

            <View className="bg-white p-5 rounded-3xl border border-gray-100">
              <View className="w-10 h-10 bg-emerald-100 rounded-full justify-center items-center mb-3">
                <Ionicons name="wallet" size={20} color="#00B894" />
              </View>
              <Text className="text-gray-400 text-[10px] font-bold uppercase">
                Revenue
              </Text>
              <Text className="text-2xl font-black mt-1">
                ₹{analytics.revenue.total.toLocaleString()}
              </Text>
            </View>
          </View>

          <View className="flex-1 bg-dark-800 rounded-3xl p-5 justify-between">
            <View>
              <View className="w-12 h-12 bg-white/10 rounded-2xl justify-center items-center border border-white/10">
                <Ionicons name="pie-chart" size={24} color="white" />
              </View>
              <Text className="text-white text-lg font-bold mt-4">
                Growth
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                +{weeklyGrowth} new users this week
              </Text>
            </View>

            <Link href="../analytics" asChild>
              <TouchableOpacity className="bg-white/10 py-3 rounded-xl items-center mt-4 border border-white/10">
                <Text className="text-white font-bold text-[10px] uppercase">
                  View Analytics
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* ===== QUICK ACTIONS ===== */}
        <View className="flex-row gap-4 mb-4">
          <TouchableOpacity
            onPress={() => router.push('/providers')}
            className="flex-1 bg-indigo-600 rounded-2xl p-4"
          >
            <Ionicons name="business" size={24} color="white" className="mb-2" />
            <Text className="text-white font-black uppercase text-[10px]">
              Providers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/drivers')}
            className="flex-1 bg-emerald-600 rounded-2xl p-4"
          >
            <Ionicons name="car-sport" size={24} color="white" className="mb-2" />
            <Text className="text-white font-black uppercase text-[10px]">
              Drivers
            </Text>
          </TouchableOpacity>
        </View>

        {/* ===== PROVIDER APPROVAL CTA (BACKUP) ===== */}
        {/* <TouchableOpacity
          onPress={() => router.push('/providers')}
          className="bg-indigo-600 rounded-2xl p-4 mb-8"
        >
          <Text className="text-white font-black text-center uppercase">
            Review Provider Approvals
          </Text>
        </TouchableOpacity> */}

        {/* ===== LOGOUT ===== */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center justify-center py-4 mb-8 opacity-50"
        >
          <Ionicons name="log-out-outline" size={20} color="#2D3436" />
          <Text className="ml-2 font-bold uppercase text-xs">
            Logout Session
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
