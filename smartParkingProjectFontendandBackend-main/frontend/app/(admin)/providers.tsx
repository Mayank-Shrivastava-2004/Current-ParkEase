import React, { useEffect, useState } from 'react';
import BASE_URL from '../../constants/api';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Provider {
  id: number;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'suspended';
  parkingAreaName?: string;
  location?: string;
  totalSlots?: number;
}

const API = BASE_URL;

export default function ProvidersScreen() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  /* ================= FETCH PROVIDERS ================= */
  const loadProviders = async () => {
    try {
      const res = await fetch(`${API}/api/admin/providers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to load providers');
      }

      const data = await res.json();
      setProviders(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Unable to load providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  /* ================= ACTION HANDLER ================= */
  const action = (id: number, type: string) => {
    const actionLabel =
      type === 'approve'
        ? 'Approve'
        : type === 'reject'
          ? 'Reject'
          : type === 'suspend'
            ? 'Suspend'
            : 'Reactivate';

    Alert.alert(
      `${actionLabel} Provider`,
      `Are you sure you want to ${actionLabel.toLowerCase()} this provider?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabel,
          style: type === 'reject' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const res = await fetch(
                `${API}/api/admin/providers/${id}/${type}`,
                {
                  method: 'PUT',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (!res.ok) {
                throw new Error('Action failed');
              }

              Alert.alert(
                'Success',
                `Provider ${actionLabel.toLowerCase()}d successfully`
              );

              loadProviders(); // 🔄 refresh list
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Action failed. Try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading providers…</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-6 pt-24 pb-32">
      <Text className="text-3xl font-black mb-6">
        Provider Approvals
      </Text>

      {providers.length === 0 && (
        <Text className="text-gray-400">
          No providers found
        </Text>
      )}

      {providers.map((p) => (
        <View
          key={p.id}
          className="bg-white rounded-3xl p-6 mb-4 border border-gray-100"
        >
          <Text className="text-lg font-black">
            {p.ownerName}
          </Text>
          <Text className="text-gray-400 text-xs">
            {p.email}
          </Text>
          <Text className="text-gray-400 text-xs">
            {p.phone}
          </Text>

          <View className="mt-4 pt-4 border-t border-gray-50">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center mr-3">
                <Text className="text-indigo-600 text-[10px] font-bold">HUB</Text>
              </View>
              <View>
                <Text className="text-[10px] text-gray-400 uppercase font-bold">Parking Hub</Text>
                <Text className="text-sm font-bold text-gray-900">{p.parkingAreaName || 'Not Specified'}</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-green-50 items-center justify-center mr-3">
                <Text className="text-green-600 text-[10px] font-bold">LOC</Text>
              </View>
              <View>
                <Text className="text-[10px] text-gray-400 uppercase font-bold">Physical Location</Text>
                <Text className="text-sm font-bold text-gray-900">{p.location || 'Not Specified'}</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center mr-3">
                <Text className="text-orange-600 text-[10px] font-bold">SLOT</Text>
              </View>
              <View>
                <Text className="text-[10px] text-gray-400 uppercase font-bold">Total Capacity</Text>
                <Text className="text-sm font-bold text-gray-900">{p.totalSlots || 0} Slots Available</Text>
              </View>
            </View>
          </View>

          <View className="flex-row gap-3 mt-4">
            {p.status === 'pending' && (
              <>
                <TouchableOpacity
                  onPress={() => action(p.id, 'approve')}
                  className="bg-green-600 px-4 py-2 rounded-xl"
                >
                  <Text className="text-white font-bold">
                    Approve
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => action(p.id, 'reject')}
                  className="bg-red-500 px-4 py-2 rounded-xl"
                >
                  <Text className="text-white font-bold">
                    Reject
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {p.status === 'approved' && (
              <TouchableOpacity
                onPress={() => action(p.id, 'suspend')}
                className="bg-amber-500 px-4 py-2 rounded-xl"
              >
                <Text className="text-white font-bold">
                  Suspend
                </Text>
              </TouchableOpacity>
            )}

            {p.status === 'suspended' && (
              <TouchableOpacity
                onPress={() => action(p.id, 'reactivate')}
                className="bg-indigo-600 px-4 py-2 rounded-xl"
              >
                <Text className="text-white font-bold">
                  Reactivate
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
