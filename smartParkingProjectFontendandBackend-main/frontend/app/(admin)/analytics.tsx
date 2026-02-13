import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import OccupancyDonutChart from '../../components/admin/OccupancyDonutChart';
import ParkingDurationChart from '../../components/admin/ParkingDurationChart';
import BASE_URL from '../../constants/api';

/* ================= TOKEN HELPER (WEB SAFE) ================= */
const getToken = async () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token'); // ✅ Expo Web
  }
  return null;
};

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<any>({
    revenue: {
      total: 0,
      platformFees: 0,
      providerEarnings: 0,
    },
    userGrowth: {
      drivers: { total: 0, newThisWeek: 0 },
      providers: { total: 0, newThisWeek: 0 },
    },
    occupancy: {
      totalSlots: 0,
      occupiedSlots: 0,
      availableSlots: 0,
      occupancyPercentage: 0,
    },
    topProviders: [],
    bookingTrend: [],
  });

  const [durationData, setDurationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ANALYTICS ================= */
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const token = await getToken();

        if (!token) {
          console.log('❌ No token found');
          setLoading(false);
          return;
        }

        /* ===== MAIN ANALYTICS ===== */
        const analyticsRes = await fetch(
          `${BASE_URL}/api/admin/analytics`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!analyticsRes.ok) {
          console.log('❌ Analytics error:', analyticsRes.status);
          setLoading(false);
          return;
        }

        const analyticsJson = await analyticsRes.json();
        setAnalytics(analyticsJson);

        /* ===== PARKING DURATION ===== */
        const durationRes = await fetch(
          `${BASE_URL}/api/admin/analytics/parking-duration`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (durationRes.ok) {
          const durationJson = await durationRes.json();

          const colors = [
            '#00B894',
            '#6C5CE7',
            '#0984E3',
            '#FDCB6E',
            '#FF7675',
          ];

          setDurationData(
            (durationJson?.buckets || []).map((b: any, i: number) => ({
              label: b.label,
              count: b.count,
              color: colors[i % colors.length],
            }))
          );
        }
      } catch (err) {
        console.error('❌ Analytics fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const totalUsers =
    (analytics?.userGrowth?.drivers?.total ?? 0) +
    (analytics?.userGrowth?.providers?.total ?? 0);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-400 font-bold">
          Loading analytics…
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* ===== HEADER ===== */}
      <View className="bg-slate-600 px-6 pt-16 pb-6">
        <Text className="text-gray-300 text-xs font-bold uppercase tracking-wide">
          Detailed
        </Text>
        <Text className="text-white text-3xl font-black">
          Analytics Dashboard
        </Text>
        <Text className="text-gray-300 text-sm mt-1">
          Comprehensive performance insights
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ===== REVENUE ===== */}
        <View className="px-6 mt-6">
          <Text className="font-bold text-xl mb-4">
            Revenue Overview
          </Text>

          <View className="bg-white rounded-3xl p-6 border border-gray-100">
            <Text className="text-4xl font-black mb-4">
              ₹{analytics.revenue.total.toLocaleString()}
            </Text>

            <View className="gap-3 border-t border-gray-100 pt-4">
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Platform Fees</Text>
                <Text className="font-bold">
                  ₹{analytics.revenue.platformFees.toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Provider Earnings</Text>
                <Text className="font-bold">
                  ₹{analytics.revenue.providerEarnings.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ===== OCCUPANCY ===== */}
        <View className="px-6 mt-6">
          <OccupancyDonutChart data={analytics.occupancy} />
        </View>

        {/* ===== PARKING DURATION ===== */}
        <View className="px-6 mt-6">
          {durationData.length > 0 && (
            <ParkingDurationChart data={durationData} />
          )}
        </View>

        {/* ===== USER GROWTH ===== */}
        <View className="px-6 mt-6">
          <Text className="font-bold text-xl mb-4">
            User Growth
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-2xl p-5 border border-gray-100">
              <Ionicons name="people" size={24} color="#0984E3" />
              <Text className="text-gray-400 text-xs font-bold mt-2">
                Total Users
              </Text>
              <Text className="text-3xl font-black">
                {totalUsers}
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-5 border border-gray-100">
              <Ionicons name="car-sport" size={24} color="#00B894" />
              <Text className="text-gray-400 text-xs font-bold mt-2">
                Drivers
              </Text>
              <Text className="text-3xl font-black">
                {analytics.userGrowth.drivers.total}
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-5 border border-gray-100">
              <Ionicons name="business" size={24} color="#6C5CE7" />
              <Text className="text-gray-400 text-xs font-bold mt-2">
                Providers
              </Text>
              <Text className="text-3xl font-black">
                {analytics.userGrowth.providers.total}
              </Text>
            </View>
          </View>
        </View>

        {/* ===== TOP PROVIDERS ===== */}
        <View className="px-6 mt-6 mb-10">
          <Text className="font-bold text-xl mb-4">
            Top Providers
          </Text>

          {analytics.topProviders.map((p: any, i: number) => (
            <View
              key={p.id}
              className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
            >
              <Text className="font-black">
                #{i + 1} {p.name}
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                Active for {p.activeSinceDays} days
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
