import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import BASE_URL from '../../constants/api';

const { width } = Dimensions.get('window');
const API = BASE_URL;

interface ParkingSlot {
  id: string;
  code: string;
  isOccupied: boolean;
  earnings: number;
  hours: number;
}

export default function ProviderDashboardScreen() {
  const router = useRouter();

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  const [approved, setApproved] = useState<boolean | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    occupancyRate: 0,
    weeklyGrowth: 0,
  });

  /* ================= LOAD DASHBOARD ================= */
  useEffect(() => {
    if (!token) return;

    const loadDashboard = async () => {
      try {
        const res = await fetch(`${API}/api/provider/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 403) {
          setApproved(false);
          return;
        }

        const data = await res.json();
        setApproved(true);
        setSummary(data.summary);
        setIsOnline(data.online);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load dashboard');
      }
    };

    const loadSlots = async () => {
      const res = await fetch(`${API}/api/provider/slots`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSlots(data);
    };

    loadDashboard();
    loadSlots();
  }, [token]);

  /* ================= ONLINE TOGGLE ================= */
  const toggleOnline = async (value: boolean) => {
    setIsOnline(value);

    try {
      await fetch(`${API}/api/provider/status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ online: value }),
      });
    } catch {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  /* ================= BLOCK IF NOT APPROVED ================= */
  if (approved === false) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <Ionicons name="time-outline" size={64} color="#9CA3AF" />
        <Text className="text-xl font-black mt-6 text-center">
          Approval Pending
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          Your account is under review. Please wait for admin approval.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-gray-200 px-6 py-3 rounded-xl"
        >
          <Text className="font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (approved === null) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading dashboard…</Text>
      </View>
    );
  }

  /* ================= HEADER ================= */
  const renderHeader = () => (
    <LinearGradient
      colors={['#6C5CE7', '#a29bfe']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="pt-16 pb-12 px-6 rounded-b-[40px]"
    >
      <View className="flex-row justify-between items-start mb-8">
        <View>
          <Text className="text-indigo-100 font-bold tracking-widest text-[10px] uppercase mb-1">
            Provider Console
          </Text>
          <Text className="text-white text-3xl font-black">
            My Parking Lot
          </Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.push('/history')}
            className="bg-white/20 p-2 rounded-xl mr-3"
          >
            <Ionicons name="time" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white/20 p-2 rounded-xl"
          >
            <Ionicons name="power" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-white rounded-3xl p-6 flex-row justify-between items-center -mb-20">
        <View className="flex-1 border-r border-gray-100 pr-4">
          <Text className="text-gray-400 text-[10px] font-bold uppercase mb-2">
            Total Revenue
          </Text>
          <Text className="text-3xl font-black">
            ₹ {summary.totalRevenue}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="trending-up" size={14} color="#00B894" />
            <Text className="text-teal-500 text-xs font-bold ml-1">
              +{summary.weeklyGrowth}% this week
            </Text>
          </View>
        </View>

        <View className="pl-4 items-center">
          <Text className="text-gray-400 text-[10px] font-bold uppercase mb-2">
            Occupancy
          </Text>
          <View className="w-16 h-16 rounded-full border-4 border-indigo-100 justify-center items-center">
            <Text className="text-indigo-600 font-black text-lg">
              {summary.occupancyRate}%
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  /* ================= SLOT CARD ================= */
  const renderSlotItem = ({ item, index }: { item: ParkingSlot; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={{ width: (width - 48) / 2 }}
      className={`bg-white rounded-2xl p-4 mb-4 border ${index % 2 === 0 ? 'mr-4' : ''}`}
    >
      <View className="flex-row justify-between items-center mb-4">
        <View className={`w-10 h-10 rounded-xl justify-center items-center ${item.isOccupied ? 'bg-red-50' : 'bg-green-50'}`}>
          <Text className={`font-black text-sm ${item.isOccupied ? 'text-red-500' : 'text-green-500'}`}>
            {item.code}
          </Text>
        </View>
        <View className={`w-2 h-2 rounded-full ${item.isOccupied ? 'bg-red-500' : 'bg-green-500'}`} />
      </View>

      <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">
        {item.isOccupied ? 'Occupied' : 'Vacant'}
      </Text>

      {item.isOccupied ? (
        <>
          <Text className="text-dark-900 font-bold text-lg">
            ₹ {item.earnings}
          </Text>
          <Text className="text-xs text-indigo-500 font-bold">
            {item.hours} hrs active
          </Text>
        </>
      ) : (
        <Text className="text-gray-300 font-bold text-lg">---</Text>
      )}
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-provider-bg">
      <StatusBar barStyle="light-content" />
      {renderHeader()}

      <View className="flex-1 px-6 pt-24">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-dark-900 font-bold text-lg">
            Slot Status
          </Text>

          <View className="flex-row items-center bg-white px-4 py-2 rounded-full border">
            <Text className="text-xs font-bold text-gray-500 mr-2 uppercase">
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={toggleOnline}
              trackColor={{ false: '#fab1a0', true: '#a29bfe' }}
              thumbColor={isOnline ? '#6C5CE7' : '#f1f2f6'}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        </View>

        <FlatList
          data={slots}
          renderItem={renderSlotItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>
    </View>
  );
}
