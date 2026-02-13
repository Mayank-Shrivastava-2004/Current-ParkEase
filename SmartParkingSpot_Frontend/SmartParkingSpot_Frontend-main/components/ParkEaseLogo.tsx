import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing
} from 'react-native-reanimated';

interface ParkEaseLogoProps {
    size?: number;
    showText?: boolean;
    dark?: boolean;
}

const ParkEaseLogo = ({ size = 100, showText = false, dark = true }: ParkEaseLogoProps) => {
    const glowValue = useSharedValue(0.4);

    useEffect(() => {
        glowValue.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowValue.value,
        shadowOpacity: glowValue.value,
    }));

    return (
        <View className="items-center">
            <View style={{ width: size, height: size }} className="relative">
                {/* OUTER GLOW LAYER */}
                <Animated.View
                    style={[glowStyle, { width: size, height: size }]}
                    className={`absolute inset-0 ${dark ? 'bg-blue-500/20' : 'bg-blue-600/10'} rounded-[30%] blur-xl`}
                />

                {/* LOGO CONTAINER */}
                <View className={`w-full h-full ${dark ? 'bg-slate-950' : 'bg-white'} rounded-[28px] justify-center items-center shadow-2xl border-2 ${dark ? 'border-blue-500/30' : 'border-blue-100'} overflow-hidden`}>
                    <LinearGradient
                        colors={dark ? ['rgba(59, 130, 246, 0.15)', 'transparent'] : ['rgba(59, 130, 246, 0.05)', 'transparent']}
                        className="absolute inset-0"
                    />

                    <View className="relative scale-110">
                        {/* THE STYLIZED 'P' */}
                        <Text
                            style={{ fontSize: Math.round(size * 0.6) }}
                            className={`${dark ? 'text-white' : 'text-slate-900'} font-black tracking-tighter italic`}
                        >
                            P
                        </Text>

                        {/* INTEGRATED CAR ICON */}
                        <View className={`absolute -right-2 -top-1 ${dark ? 'bg-slate-950' : 'bg-white'} p-1 rounded-full border ${dark ? 'border-blue-400/50' : 'border-blue-200'} shadow-lg`}>
                            <Ionicons name="car-sport" size={Math.round(size * 0.24)} color="#3B82F6" />
                        </View>

                        {/* GLOW DECORATIONS */}
                        <View className="absolute -left-1 bottom-1 w-6 h-[2px] bg-blue-500 rounded-full shadow-lg shadow-blue-500" />
                    </View>
                </View>
            </View>

            {showText && (
                <View className="mt-8 items-center">
                    <Text className={`${dark ? 'text-white' : 'text-slate-900'} text-3xl font-black tracking-[4px] uppercase`}>ParkEase</Text>
                    <View className="h-[2px] bg-blue-500 w-20 mt-3 rounded-full shadow-lg shadow-blue-500/50" />
                    <Text className="text-blue-500 mt-5 text-[9px] font-black uppercase tracking-[6px]">Smart Parking Solutions</Text>
                </View>
            )}
        </View>
    );
};

export default ParkEaseLogo;
