import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Dimensions,
  StyleSheet,
  ScrollView
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedStyle,
  withRepeat,
  withSequence
} from 'react-native-reanimated';
import ParkEaseLogo from '../components/ParkEaseLogo';

const { width, height } = Dimensions.get('window');

/* ================= AMBIENT ORB COMPONENT ================= */
const AmbientOrb = ({ color, size, top, left, delay = 0 }: { color: string, size: number, top: number, left: number, delay?: number }) => {
  const movement = useSharedValue(0);

  useEffect(() => {
    movement.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000 + delay, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4000 + delay, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: movement.value * 30 },
      { translateX: (1 - movement.value) * 20 },
      { scale: 0.8 + movement.value * 0.4 }
    ],
    opacity: 0.15 + movement.value * 0.1
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          top,
          left
        }
      ]}
    />
  );
};

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [isAppReady, setIsAppReady] = useState(false);
  const progress = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`
  }));

  useEffect(() => {
    progress.value = withTiming(100, { duration: 1200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    const timer = setTimeout(() => setIsAppReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const panels = [
    {
      title: 'Admin Console',
      subtitle: 'NEXUS-CORE CONTROL',
      description: 'Unified system governance & data integrity',
      route: '/(admin)',
      icon: 'shield-checkmark',
      colors: ['#0F172A', '#1E293B'],
      accent: '#3B82F6',
      badge: 'ROOT ACCESS'
    },
    {
      title: 'Driver Deck',
      subtitle: 'SMART MOBILITY',
      description: 'Precision navigation & asset scheduling',
      route: '/(driver)',
      icon: 'car-sport',
      colors: ['#022C22', '#065F46'],
      accent: '#10B981',
      badge: 'LIVE SYNC'
    },
    {
      title: 'Provider Hub',
      subtitle: 'ASSET SUITE',
      description: 'Monetize spaces & analyze revenue streams',
      route: '/(provider)',
      icon: 'business',
      colors: ['#2E1065', '#4C1D95'],
      accent: '#8B5CF6',
      badge: 'ENTERPRISE'
    },
  ];

  if (!isAppReady) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <StatusBar barStyle="light-content" />
        <AmbientOrb color="#3B82F6" size={200} top={height * 0.2} left={-50} />
        <AmbientOrb color="#8B5CF6" size={250} top={height * 0.6} left={width * 0.6} delay={1000} />

        <Animated.View entering={FadeInUp.duration(1500).springify()}>
          <ParkEaseLogo size={140} showText={true} />
        </Animated.View>

        <View className="absolute bottom-24 items-center w-full px-16">
          <View className="w-full h-[6px] bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <Animated.View
              style={progressStyle}
              className="h-full bg-blue-500"
            />
          </View>
          <Text className="text-slate-500 text-[8px] font-black mt-6 uppercase tracking-[8px]">initializing secure protocol</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />

      {/* BACKGROUND ELEMENTS (STATIC) */}
      <AmbientOrb color="#3B82F6" size={300} top={-50} left={-100} />
      <AmbientOrb color="#10B981" size={250} top={height * 0.4} left={width * 0.7} delay={500} />
      <AmbientOrb color="#8B5CF6" size={350} top={height * 0.8} left={-100} delay={1500} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-8 pt-16">
          <Animated.View entering={FadeInUp.duration(1000)} className="items-center mb-8">
            <ParkEaseLogo size={60} />
            <Text className="text-white text-4xl font-black tracking-tighter mt-6">ParkEase</Text>
            <View className="h-[2px] bg-blue-500/30 w-10 mt-3 rounded-full" />
            <Text className="text-blue-400 text-[9px] font-black uppercase tracking-[5px] mt-3">Select Workspace</Text>
          </Animated.View>

          <View className="gap-5">
            {panels.map((panel, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(500 + index * 150).duration(800)}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => router.push(panel.route as any)}
                  className="overflow-hidden rounded-[35px] shadow-2xl shadow-black/40"
                >
                  <View
                    className="p-6 relative border border-white/5"
                    style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.05)', 'transparent']}
                      className="absolute inset-0"
                    />

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View className="w-12 h-12 bg-white/5 rounded-2xl justify-center items-center border border-white/10 backdrop-blur-3xl shadow-xl">
                          <Ionicons name={panel.icon as any} size={22} color={panel.accent} />
                        </View>
                        <View className="ml-4 flex-1">
                          <Text className="text-blue-400/60 text-[8px] font-black uppercase tracking-[2px] mb-1">{panel.subtitle}</Text>
                          <Text className="text-white text-xl font-black tracking-tight">{panel.title}</Text>
                        </View>
                      </View>
                      <View className="bg-white/5 px-2 py-1 rounded-md border border-white/10">
                        <Text className="text-white/30 text-[7px] font-black tracking-widest uppercase">{panel.badge}</Text>
                      </View>
                    </View>

                    <Text className="text-white/40 text-[11px] font-medium mt-4 leading-4">{panel.description}</Text>

                    <View className="mt-5 flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                        <Text className="text-emerald-500/40 text-[9px] font-black uppercase tracking-widest">Protocol Active</Text>
                      </View>
                      <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center border border-white/10">
                        <Ionicons name="chevron-forward" size={18} color="white" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* FOOTER INSIDE SCROLL FOR BETTER SPACE MANAGEMENT */}
        <View className="items-center mt-12 pb-8">
          <View className="flex-row items-center mb-3">
            <View className="h-[1px] w-6 bg-white/5" />
            <Text className="mx-3 text-white/10 text-[8px] font-black tracking-[8px] uppercase">Nexus Protocol</Text>
            <View className="h-[1px] w-6 bg-white/5" />
          </View>
          <Text className="text-blue-500/30 text-[7px] font-black uppercase tracking-[4px]">Premium Enterprise v4.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
