import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function AnalyticsDashboard() {
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

    // Revenue Data
    const revenueData = {
        week: {
            total: 840000,
            platformFees: 210000,
            providerEarnings: 630000,
            growth: 12,
            avgDaily: 120000
        },
        month: {
            total: 3600000,
            platformFees: 900000,
            providerEarnings: 2700000,
            growth: 18,
            avgDaily: 120000
        },
        year: {
            total: 42000000,
            platformFees: 10500000,
            providerEarnings: 31500000,
            growth: 25,
            avgDaily: 115000
        }
    };

    // Booking Statistics
    const bookingStats = {
        week: [
            { day: 'Mon', bookings: 280, revenue: 112000 },
            { day: 'Tue', bookings: 320, revenue: 128000 },
            { day: 'Wed', bookings: 298, revenue: 119200 },
            { day: 'Thu', bookings: 356, revenue: 142400 },
            { day: 'Fri', bookings: 420, revenue: 168000 },
            { day: 'Sat', bookings: 485, revenue: 194000 },
            { day: 'Sun', bookings: 390, revenue: 156000 },
        ],
        month: Array.from({ length: 30 }, (_, i) => ({
            day: `${i + 1}`,
            bookings: Math.floor(Math.random() * 200) + 300,
            revenue: Math.floor(Math.random() * 80000) + 120000
        })),
        year: Array.from({ length: 12 }, (_, i) => ({
            day: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
            bookings: Math.floor(Math.random() * 5000) + 8000,
            revenue: Math.floor(Math.random() * 1000000) + 3000000
        }))
    };

    // Top Performing Providers
    const topProviders = [
        { id: '1', name: 'Grand Mall Parking', revenue: 485000, bookings: 2150, rating: 4.8, growth: 15 },
        { id: '2', name: 'Airport Premium Lot', revenue: 420000, bookings: 1890, rating: 4.9, growth: 22 },
        { id: '3', name: 'City Center Plaza', revenue: 380000, bookings: 1680, rating: 4.7, growth: 10 },
        { id: '4', name: 'Tech Park Parking', revenue: 320000, bookings: 1420, rating: 4.6, growth: 8 },
        { id: '5', name: 'Seaside Parking Hub', revenue: 295000, bookings: 1310, rating: 4.5, growth: 12 },
    ];

    // User Growth
    const userGrowth = {
        drivers: {
            total: 1847,
            newThisWeek: 124,
            activeRate: 78,
            growth: 7.2
        },
        providers: {
            total: 142,
            newThisWeek: 8,
            activeRate: 94,
            growth: 6.0
        }
    };

    // Peak Hours Distribution
    const peakHoursDetailed = [
        { hour: '6-7 AM', bookings: 45, percentage: 12 },
        { hour: '7-8 AM', bookings: 98, percentage: 26 },
        { hour: '8-9 AM', bookings: 156, percentage: 42 },
        { hour: '9-10 AM', bookings: 124, percentage: 33 },
        { hour: '10-11 AM', bookings: 89, percentage: 24 },
        { hour: '11-12 PM', bookings: 78, percentage: 21 },
        { hour: '12-1 PM', bookings: 102, percentage: 27 },
        { hour: '1-2 PM', bookings: 118, percentage: 31 },
        { hour: '2-3 PM', bookings: 95, percentage: 25 },
        { hour: '3-4 PM', bookings: 87, percentage: 23 },
        { hour: '4-5 PM', bookings: 112, percentage: 30 },
        { hour: '5-6 PM', bookings: 145, percentage: 39 },
        { hour: '6-7 PM', bookings: 178, percentage: 48 },
        { hour: '7-8 PM', bookings: 142, percentage: 38 },
        { hour: '8-9 PM', bookings: 98, percentage: 26 },
    ];

    // Payment Methods
    const paymentMethods = [
        { name: 'Wallet', percentage: 45, amount: 378000, color: '#00B894' },
        { name: 'UPI', percentage: 35, amount: 294000, color: '#6C5CE7' },
        { name: 'Card', percentage: 15, amount: 126000, color: '#0984E3' },
        { name: 'Cash', percentage: 5, amount: 42000, color: '#636E72' },
    ];

    // Vehicle Type Distribution
    const vehicleTypes = [
        { type: 'Sedan', count: 742, percentage: 40 },
        { type: 'SUV', count: 556, percentage: 30 },
        { type: 'Hatchback', count: 370, percentage: 20 },
        { type: 'EV', count: 179, percentage: 10 },
    ];

    const currentData = revenueData[timeRange];
    const currentBookings = bookingStats[timeRange];

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)}K`;
        }
        return `₹${amount}`;
    };

    const renderRevenueOverview = () => (
        <View className="px-6 mt-6">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-dark-900 font-bold text-xl">Revenue Overview</Text>
                <View className="flex-row bg-white rounded-xl border border-gray-100 p-1">
                    {(['week', 'month', 'year'] as const).map((range) => (
                        <TouchableOpacity
                            key={range}
                            onPress={() => setTimeRange(range)}
                            className={`px-3 py-1.5 rounded-lg ${timeRange === range ? 'bg-slate-600' : ''}`}
                        >
                            <Text className={`text-xs font-bold uppercase ${timeRange === range ? 'text-white' : 'text-gray-500'}`}>
                                {range}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="bg-white rounded-3xl p-6 shadow-sm shadow-gray-200 border border-gray-100 mb-4">
                <View className="flex-row items-end mb-6">
                    <Text className="text-dark-900 text-4xl font-black">{formatCurrency(currentData.total)}</Text>
                    <View className="flex-row items-center ml-3 mb-1">
                        <Ionicons name="trending-up" size={16} color="#00B894" />
                        <Text className="text-teal-500 text-sm font-bold ml-1">+{currentData.growth}%</Text>
                    </View>
                </View>

                <View className="border-t border-gray-100 pt-4 gap-3">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <View className="w-3 h-3 bg-teal-500 rounded-full mr-2" />
                            <Text className="text-gray-500 text-sm">Platform Fees</Text>
                        </View>
                        <Text className="text-dark-900 text-base font-bold">{formatCurrency(currentData.platformFees)}</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <View className="w-3 h-3 bg-indigo-500 rounded-full mr-2" />
                            <Text className="text-gray-500 text-sm">Provider Earnings</Text>
                        </View>
                        <Text className="text-dark-900 text-base font-bold">{formatCurrency(currentData.providerEarnings)}</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <Text className="text-gray-500 text-sm">Avg. Daily Revenue</Text>
                        <Text className="text-teal-600 text-base font-bold">{formatCurrency(currentData.avgDaily)}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderBookingTrend = () => {
        const maxBookings = Math.max(...currentBookings.map(d => d.bookings));
        const displayData = timeRange === 'week' ? currentBookings : currentBookings.slice(0, timeRange === 'month' ? 15 : 12);

        return (
            <View className="px-6 mt-4">
                <Text className="text-dark-900 font-bold text-xl mb-4">Booking Trend</Text>
                <View className="bg-white rounded-3xl p-5 shadow-sm shadow-gray-200 border border-gray-100">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row items-end h-40 mb-4">
                            {displayData.map((item, index) => {
                                const heightPercentage = (item.bookings / maxBookings) * 100;
                                return (
                                    <Animated.View
                                        key={index}
                                        entering={FadeInDown.delay(index * 50).springify()}
                                        className="items-center mx-1"
                                    >
                                        <Text className="text-[10px] font-bold text-slate-600 mb-2">{item.bookings}</Text>
                                        <View
                                            className="w-6 rounded-t-lg"
                                            style={{
                                                height: `${Math.max(heightPercentage, 10)}%`,
                                                backgroundColor: index === displayData.length - 1 ? '#2D3436' : '#B2BEC3'
                                            }}
                                        />
                                        <Text className="text-[9px] font-bold text-gray-400 mt-2 uppercase">{item.day}</Text>
                                    </Animated.View>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    };

    const renderTopProviders = () => (
        <View className="px-6 mt-6">
            <Text className="text-dark-900 font-bold text-xl mb-4">Top Performing Providers</Text>
            <View className="gap-3">
                {topProviders.map((provider, index) => (
                    <Animated.View
                        key={provider.id}
                        entering={FadeInRight.delay(index * 100).springify()}
                        className="bg-white rounded-2xl p-4 shadow-sm shadow-gray-200 border border-gray-100"
                    >
                        <View className="flex-row items-center mb-3">
                            <View className="w-10 h-10 bg-indigo-100 rounded-xl justify-center items-center mr-3">
                                <Text className="text-indigo-600 font-black text-lg">#{index + 1}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-dark-900 font-bold text-base">{provider.name}</Text>
                                <View className="flex-row items-center gap-2 mt-1">
                                    <View className="flex-row items-center">
                                        <Ionicons name="star" size={12} color="#FDCB6E" />
                                        <Text className="text-gray-600 text-xs ml-1">{provider.rating}</Text>
                                    </View>
                                    <Text className="text-gray-400 text-xs">•</Text>
                                    <Text className="text-gray-600 text-xs">{provider.bookings} bookings</Text>
                                </View>
                            </View>
                        </View>
                        <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
                            <View>
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">Revenue</Text>
                                <Text className="text-teal-600 text-lg font-black">{formatCurrency(provider.revenue)}</Text>
                            </View>
                            <View className="bg-green-50 px-3 py-1.5 rounded-xl">
                                <Text className="text-green-600 text-xs font-bold">+{provider.growth}%</Text>
                            </View>
                        </View>
                    </Animated.View>
                ))}
            </View>
        </View>
    );

    const renderUserGrowth = () => (
        <View className="px-6 mt-6">
            <Text className="text-dark-900 font-bold text-xl mb-4">User Growth</Text>
            <View className="flex-row gap-3">
                <View className="flex-1 bg-white rounded-2xl p-5 shadow-sm shadow-gray-200 border border-gray-100">
                    <View className="w-12 h-12 bg-teal-100 rounded-2xl justify-center items-center mb-3">
                        <Ionicons name="car-sport" size={24} color="#00B894" />
                    </View>
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wide mb-2">Drivers</Text>
                    <Text className="text-dark-900 text-3xl font-black mb-3">{userGrowth.drivers.total.toLocaleString()}</Text>
                    <View className="gap-2 border-t border-gray-100 pt-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-500 text-xs">New this week</Text>
                            <Text className="text-teal-600 text-xs font-bold">+{userGrowth.drivers.newThisWeek}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-500 text-xs">Active rate</Text>
                            <Text className="text-dark-900 text-xs font-bold">{userGrowth.drivers.activeRate}%</Text>
                        </View>
                    </View>
                </View>

                <View className="flex-1 bg-white rounded-2xl p-5 shadow-sm shadow-gray-200 border border-gray-100">
                    <View className="w-12 h-12 bg-indigo-100 rounded-2xl justify-center items-center mb-3">
                        <Ionicons name="business" size={24} color="#6C5CE7" />
                    </View>
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wide mb-2">Providers</Text>
                    <Text className="text-dark-900 text-3xl font-black mb-3">{userGrowth.providers.total}</Text>
                    <View className="gap-2 border-t border-gray-100 pt-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-500 text-xs">New this week</Text>
                            <Text className="text-indigo-600 text-xs font-bold">+{userGrowth.providers.newThisWeek}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-500 text-xs">Active rate</Text>
                            <Text className="text-dark-900 text-xs font-bold">{userGrowth.providers.activeRate}%</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderPeakHours = () => {
        const maxBookings = Math.max(...peakHoursDetailed.map(h => h.bookings));

        return (
            <View className="px-6 mt-6">
                <Text className="text-dark-900 font-bold text-xl mb-4">Peak Hours Analysis</Text>
                <View className="bg-white rounded-2xl p-4 shadow-sm shadow-gray-200 border border-gray-100">
                    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                        {peakHoursDetailed.map((hour, index) => {
                            const widthPercentage = (hour.bookings / maxBookings) * 100;
                            return (
                                <Animated.View
                                    key={index}
                                    entering={FadeInRight.delay(index * 30).springify()}
                                    className="mb-3"
                                >
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-dark-900 text-xs font-bold w-20">{hour.hour}</Text>
                                        <Text className="text-gray-500 text-xs">{hour.bookings} bookings</Text>
                                    </View>
                                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <View
                                            className="h-full bg-slate-600 rounded-full"
                                            style={{ width: `${widthPercentage}%` }}
                                        />
                                    </View>
                                </Animated.View>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        );
    };

    const renderPaymentMethods = () => (
        <View className="px-6 mt-6">
            <Text className="text-dark-900 font-bold text-xl mb-4">Payment Methods</Text>
            <View className="bg-white rounded-2xl p-5 shadow-sm shadow-gray-200 border border-gray-100">
                {paymentMethods.map((method, index) => (
                    <Animated.View
                        key={index}
                        entering={FadeInDown.delay(index * 100).springify()}
                        className="mb-4"
                    >
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-row items-center">
                                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: method.color }} />
                                <Text className="text-dark-900 text-sm font-bold">{method.name}</Text>
                            </View>
                            <Text className="text-gray-500 text-sm">{method.percentage}%</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mr-3">
                                <View
                                    className="h-full rounded-full"
                                    style={{ width: `${method.percentage}%`, backgroundColor: method.color }}
                                />
                            </View>
                            <Text className="text-dark-900 text-sm font-bold">{formatCurrency(method.amount)}</Text>
                        </View>
                    </Animated.View>
                ))}
            </View>
        </View>
    );

    const renderVehicleTypes = () => (
        <View className="px-6 mt-6 mb-8">
            <Text className="text-dark-900 font-bold text-xl mb-4">Vehicle Distribution</Text>
            <View className="bg-white rounded-2xl p-5 shadow-sm shadow-gray-200 border border-gray-100">
                {vehicleTypes.map((vehicle, index) => (
                    <Animated.View
                        key={index}
                        entering={FadeInRight.delay(index * 100).springify()}
                        className="flex-row justify-between items-center mb-4"
                    >
                        <View className="flex-1">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-dark-900 text-sm font-bold">{vehicle.type}</Text>
                                <Text className="text-gray-500 text-sm">{vehicle.count} vehicles</Text>
                            </View>
                            <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <View
                                    className="h-full bg-teal-500 rounded-full"
                                    style={{ width: `${vehicle.percentage}%` }}
                                />
                            </View>
                        </View>
                        <Text className="text-teal-600 text-lg font-black ml-4 w-12 text-right">{vehicle.percentage}%</Text>
                    </Animated.View>
                ))}
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-slate-600 px-6 pt-16 pb-6">
                <Text className="text-gray-300 text-xs font-bold uppercase tracking-wide">Detailed</Text>
                <Text className="text-white text-3xl font-black">Analytics Dashboard</Text>
                <Text className="text-gray-300 text-sm mt-1">Comprehensive performance insights</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {renderRevenueOverview()}
                {renderBookingTrend()}
                {renderTopProviders()}
                {renderUserGrowth()}
                {renderPeakHours()}
                {renderPaymentMethods()}
                {renderVehicleTypes()}
            </ScrollView>
        </View>
    );
}
