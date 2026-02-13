import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, PanResponder, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import UnifiedHeader from '../../components/UnifiedHeader';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';
import Reanimated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Mock Data for Charging Stations
const CHARGING_STATIONS = [
    { id: 1, name: "City Mall Grid", price: 40, dist: "0.5km", type: "Ultra Fast", coords: { x: 120, y: 150 }, status: 'available', totalSlots: 20, availableSlots: 7 },
    { id: 2, name: "Central Hyperport", price: 60, dist: "1.2km", type: "Super Sonic", coords: { x: 280, y: 280 }, status: 'busy', totalSlots: 8, availableSlots: 2 },
    { id: 3, name: "Metro Station Hub", price: 20, dist: "2.5km", type: "Standard", coords: { x: 80, y: 450 }, status: 'available', totalSlots: 15, availableSlots: 12 },
    { id: 4, name: "Green Valley Port", price: 35, dist: "3.1km", type: "Fast", coords: { x: 200, y: 550 }, status: 'full', totalSlots: 5, availableSlots: 0 },
    { id: 5, name: "Tech Park Station", price: 50, dist: "1.8km", type: "Ultra", coords: { x: 320, y: 100 }, status: 'available', totalSlots: 12, availableSlots: 5 },
];

export default function FindParkingScreen() {
    const router = useRouter();
    const [selectedSpot, setSelectedSpot] = useState<any>(null);
    const [userLocation, setUserLocation] = useState({ x: width / 2, y: height / 2 });
    const [zoom, setZoom] = useState(1);

    // Simple animated value for pulsing effect or movement (RN Animated)
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        // Pulsing animation for user marker
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
            ])
        ).start();
    }, []);

    const handleSpotPress = (spot: any) => {
        setSelectedSpot(spot);
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.2, 2.5));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.2, 0.5));
    };

    const handleNavigate = () => {
        if (!selectedSpot) return;

        // Navigation Simulation
        let i = 0;
        const startX = userLocation.x;
        const startY = userLocation.y;
        const endX = selectedSpot.coords.x;
        const endY = selectedSpot.coords.y;
        const steps = 100;

        const interval = setInterval(() => {
            i++;
            const newX = startX + (endX - startX) * (i / steps);
            const newY = startY + (endY - startY) * (i / steps);
            setUserLocation({ x: newX, y: newY });

            if (i >= steps) {
                clearInterval(interval);
            }
        }, 30);
    };

    return (
        <View className="flex-1 bg-gray-100">
            <StatusBar style="dark" />

            {/* Overlay Header */}
            <View className="absolute top-0 left-0 right-0 z-10">
                <UnifiedHeader
                    title="Charging Map"
                    subtitle="NETWORK ADVISORY"
                    role="driver"
                    gradientColors={['rgba(15, 23, 42, 0.95)', 'rgba(30, 41, 59, 0.95)']}
                    onMenuPress={() => router.back()}
                    userName="Driver"
                    showBackButton={true}
                    compact={true}
                />
            </View>

            {/* INTERACTIVE MAP SIMULATION */}
            <View className="flex-1 bg-[#F1F5F9] relative overflow-hidden">
                <Animated.View
                    style={{
                        flex: 1,
                        transform: [{ scale: zoom }]
                    }}
                >
                    <Svg height="100%" width="100%" viewBox={`0 0 ${width} ${height}`}>
                        {/* Background Grid/Blocks */}
                        <Rect x="0" y="0" width={width} height={height} fill="#F8FAFC" />

                        {/* Roads - Vertical */}
                        <Line x1={100} y1={0} x2={100} y2={height} stroke="white" strokeWidth="40" />
                        <Line x1={250} y1={0} x2={250} y2={height} stroke="white" strokeWidth="40" />

                        {/* Roads - Horizontal */}
                        <Line x1={0} y1={200} x2={width} y2={200} stroke="white" strokeWidth="40" />
                        <Line x1={0} y1={500} x2={width} y2={500} stroke="white" strokeWidth="40" />

                        {/* Route Line if spot selected */}
                        {selectedSpot && (
                            <Line
                                x1={userLocation.x}
                                y1={userLocation.y}
                                x2={selectedSpot.coords.x}
                                y2={selectedSpot.coords.y}
                                stroke="#10B981"
                                strokeWidth="4"
                                strokeDasharray="10, 5"
                            />
                        )}
                    </Svg>

                    {/* Charging Pins */}
                    {CHARGING_STATIONS.map((spot) => (
                        <TouchableOpacity
                            key={spot.id}
                            onPress={() => handleSpotPress(spot)}
                            style={{
                                position: 'absolute',
                                left: spot.coords.x - 24,
                                top: spot.coords.y - 48,
                                alignItems: 'center',
                                transform: [{ scale: 1 / zoom }] // Keep pins same size
                            }}
                        >
                            <View className={`p-2.5 rounded-2xl shadow-xl border-2 border-white ${spot.status === 'available' ? 'bg-emerald-500' :
                                spot.status === 'busy' ? 'bg-amber-500' : 'bg-rose-500'
                                }`}>
                                <Ionicons name="flash" size={24} color="white" />
                            </View>
                            <View className="bg-white px-3 py-1 rounded-full shadow-sm mt-2 border border-slate-100">
                                <Text className="text-[9px] font-black uppercase tracking-widest text-slate-800">{spot.availableSlots}/{spot.totalSlots}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* User Location Marker */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            left: userLocation.x - 20,
                            top: userLocation.y - 20,
                            transform: [{ scale: pulseAnim }, { scale: 1 / zoom }],
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <View className="w-10 h-10 bg-blue-500/20 rounded-full border border-blue-400 items-center justify-center">
                            <View className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
                        </View>
                    </Animated.View>
                </Animated.View>

                {/* ZOOM CONTROLS */}
                <View className="absolute bottom-60 right-6 gap-3">
                    <TouchableOpacity
                        className="w-14 h-14 bg-white rounded-[24px] items-center justify-center shadow-2xl border border-slate-100"
                        onPress={handleZoomIn}
                    >
                        <Ionicons name="add" size={28} color="#0F172A" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-14 h-14 bg-white rounded-[24px] items-center justify-center shadow-2xl border border-slate-100"
                        onPress={handleZoomOut}
                    >
                        <Ionicons name="remove" size={28} color="#0F172A" />
                    </TouchableOpacity>
                </View>

                {/* Simulated GPS Button */}
                <TouchableOpacity
                    className="absolute bottom-40 right-6 w-14 h-14 bg-white rounded-[24px] items-center justify-center shadow-2xl border border-slate-100"
                    onPress={() => {
                        setUserLocation({ x: width / 2, y: height / 2 });
                        setZoom(1);
                    }}
                >
                    <Ionicons name="locate" size={28} color="#0F172A" />
                </TouchableOpacity>
            </View>

            {/* BOTTOM SHEET - STATION DETAILS */}
            {selectedSpot && (
                <Reanimated.View
                    entering={FadeInDown.duration(300)}
                    className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[48px] p-10 shadow-2xl border-t border-slate-100"
                >
                    <View className="flex-row justify-between items-start mb-8">
                        <View className="flex-1">
                            <View className="bg-slate-100 self-start px-4 py-1.5 rounded-full mb-3">
                                <Text className="text-slate-500 font-black text-[9px] uppercase tracking-widest">{selectedSpot.type} Infrastructure</Text>
                            </View>
                            <Text className="text-3xl font-black text-slate-900 tracking-tighter">{selectedSpot.name}</Text>
                            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">
                                {selectedSpot.dist} AWAY • HIGH VOLTAGE SYSTEM
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedSpot(null)}>
                            <View className="bg-slate-50 w-12 h-12 rounded-2xl items-center justify-center">
                                <Ionicons name="close" size={24} color="#94A3B8" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row gap-4 mb-10">
                        <View className="flex-1 bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 items-center">
                            <Text className="text-emerald-600 font-black text-2xl">{selectedSpot.availableSlots}</Text>
                            <Text className="text-emerald-500/60 font-black text-[9px] uppercase tracking-widest mt-1">Available</Text>
                        </View>
                        <View className="flex-1 bg-slate-50 p-6 rounded-[32px] border border-slate-100 items-center">
                            <Text className="text-slate-600 font-black text-2xl">{selectedSpot.totalSlots - selectedSpot.availableSlots}</Text>
                            <Text className="text-slate-500/60 font-black text-[9px] uppercase tracking-widest mt-1">Occupied</Text>
                        </View>
                        <View className="flex-1 bg-blue-50 p-6 rounded-[32px] border border-blue-100 items-center">
                            <Text className="text-blue-600 font-black text-2xl">₹{selectedSpot.price}</Text>
                            <Text className="text-blue-500/60 font-black text-[9px] uppercase tracking-widest mt-1">Per Hour</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleNavigate}
                        className="bg-slate-900 h-16 rounded-[28px] shadow-2xl shadow-slate-900/20 flex-row items-center justify-center mb-3"
                    >
                        <Ionicons name="navigate-circle" size={24} color="white" />
                        <Text className="text-white font-black ml-2 uppercase tracking-widest text-xs">Begin Pathfinding</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push({
                            pathname: '/(driver)/book-charging',
                            params: {
                                id: selectedSpot.id,
                                name: selectedSpot.name,
                                price: selectedSpot.price,
                                type: selectedSpot.type,
                                location: selectedSpot.dist
                            }
                        } as any)}
                        className="bg-emerald-500 h-16 rounded-[28px] shadow-2xl shadow-emerald-500/20 flex-row items-center justify-center mb-4"
                    >
                        <Ionicons name="calendar" size={24} color="white" />
                        <Text className="text-white font-black ml-2 uppercase tracking-widest text-xs">Book Charging Slot</Text>
                    </TouchableOpacity>
                </Reanimated.View>
            )}
        </View>
    );
}
