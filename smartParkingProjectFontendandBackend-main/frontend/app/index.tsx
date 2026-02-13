import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function RoleSelectionScreen() {
  const router = useRouter();

  const panels = [
    {
      title: 'Admin Console',
      description: 'System control center',
      route: '/(admin)',
      icon: 'shield-checkmark',
      colors: ['#2D3436', '#636E72'], // Corporate Slate
      iconColor: '#74B9FF',
      shadow: 'shadow-gray-400',
    },
    {
      title: 'Driver App',
      description: 'Book spots & navigate',
      route: '/(driver)',
      icon: 'car-sport',
      colors: ['#00B894', '#55EFC4'], // Energetic Teal
      iconColor: '#FFFFFF',
      shadow: 'shadow-teal-200',
    },
    {
      title: 'Provider Portal',
      description: 'Manage assets & revenue',
      route: '/(provider)',
      icon: 'business',
      colors: ['#6C5CE7', '#a29bfe'], // Premium Indigo
      iconColor: '#FFFFFF',
      shadow: 'shadow-indigo-200',
    },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Abstract Background Shapes */}
      <View className="absolute top-0 left-0 w-full h-[60%] bg-gray-50 -z-10 rounded-b-[60px] transform scale-x-110" />
      <View className="absolute -top-20 -right-20 w-64 h-64 bg-teal-50 rounded-full opacity-50 blur-3xl" />
      <View className="absolute top-40 -left-20 w-72 h-72 bg-indigo-50 rounded-full opacity-50 blur-3xl" />

      <View className="flex-1 px-6 pt-24">
        <Animated.View entering={FadeInUp.delay(200).duration(1000)} className="items-center mb-12">
          <View className="w-20 h-20 bg-dark-900 rounded-2xl justify-center items-center mb-6 shadow-xl shadow-gray-300 transform rotate-3">
            <Ionicons name="layers" size={36} color="#00B894" />
          </View>
          <Text className="text-4xl font-black text-dark-900 tracking-tight">ParkEase</Text>
          <Text className="text-teal-600 mt-1 text-lg font-bold tracking-wide">Smart Parking Solution</Text>
          <Text className="text-gray-400 mt-4 text-center max-w-md leading-6">
            Find the perfect spot, manage your parking assets, or oversee the entire operation—all in one place.
          </Text>
          <Text className="text-gray-300 mt-8 text-xs font-bold uppercase tracking-[4px]">Select Workspace</Text>
        </Animated.View>

        <View className="flex-row flex-wrap gap-5 justify-center">
          {panels.map((panel, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(400 + (index * 200)).duration(800)}
              className="w-full md:w-[30%]"
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push(panel.route as any)}
                className={`shadow-lg ${panel.shadow} h-full`}
              >
                <LinearGradient
                  colors={panel.colors as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-6 rounded-2xl flex-row items-center relative overflow-hidden h-32 md:h-48 md:flex-col md:items-start md:justify-center"
                >
                  {/* Subtle noise/texture overlay circle */}
                  <View className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />

                  <View className="w-14 h-14 bg-white/20 rounded-xl justify-center items-center backdrop-blur-md border border-white/10 shrink-0">
                    <Ionicons name={panel.icon as any} size={26} color={panel.iconColor} />
                  </View>

                  <View className="ml-5 flex-1 md:ml-0 md:mt-4">
                    <Text className="text-white text-lg font-bold">{panel.title}</Text>
                    <Text className="text-white/70 text-xs font-medium mt-1 uppercase tracking-wide">{panel.description}</Text>
                  </View>

                  <Ionicons name="chevron-forward" size={24} color="white" className="opacity-80 md:absolute md:right-4 md:top-4" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      <View className="items-center pb-8">
        <Text className="text-gray-300 text-[10px] font-bold tracking-[4px] uppercase">Professional Edition</Text>
      </View>
    </View>
  );
}
