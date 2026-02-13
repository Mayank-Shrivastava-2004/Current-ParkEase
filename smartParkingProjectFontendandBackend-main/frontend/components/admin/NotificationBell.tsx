import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';

interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
  type?: 'PROVIDER_PENDING' | 'INFO';
}

import BASE_URL from '../../constants/api';

const API = BASE_URL;

export default function NotificationBell() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  /* ================= FETCH NOTIFICATIONS ================= */
  const loadNotifications = () => {
    if (!token) return;

    fetch(`${API}/api/admin/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load notifications');
        return res.json();
      })
      .then(setNotifications)
      .catch(console.error);
  };

  useEffect(() => {
    loadNotifications();
  }, [token]);

  /* ================= HANDLE CLICK ================= */
  const handleNotificationClick = async (n: Notification) => {
    try {
      // mark as read
      await fetch(`${API}/api/admin/notifications/${n.id}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setVisible(false);
      loadNotifications();

      // navigate if provider approval related
      if (n.type === 'PROVIDER_PENDING') {
        router.push('/providers');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* 🔔 BELL ICON */}
      <View
        style={{
          zIndex: 999,
          position: 'relative',
          pointerEvents: 'box-none',
        }}
      >
        <Pressable
          onPress={() => setVisible(true)}
          style={{ padding: 6 }}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color="white"
          />

          {unreadCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#EF4444',
              }}
            />
          )}
        </Pressable>
      </View>

      {/* 🔔 MODAL */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setVisible(false)}
        >
          <Pressable
            onPress={() => { }}
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: '70%',
            }}
          >
            <Text className="text-xl font-black mb-4">
              Notifications
            </Text>

            {notifications.length === 0 && (
              <Text className="text-gray-400">
                No notifications
              </Text>
            )}

            {notifications.map((n) => (
              <TouchableOpacity
                key={n.id}
                onPress={() => handleNotificationClick(n)}
                className={`border-b border-gray-100 py-4 ${!n.read ? 'bg-indigo-50/40' : ''
                  }`}
              >
                <Text className="font-bold">{n.message}</Text>
                <Text className="text-xs text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setVisible(false)}
              className="mt-6 bg-gray-100 py-3 rounded-xl items-center"
            >
              <Text className="font-bold">Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
