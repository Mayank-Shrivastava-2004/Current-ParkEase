import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import UnifiedManagement from '../shared/UnifiedManagement';

interface Driver {
    id: string;
    name: string;
    email: string;
    phone: string;
    vehicleNumber: string;
    vehicleType: string;
    status: 'active' | 'inactive' | 'suspended';
    joinedDate: string;
    totalBookings: number;
    activeBooking?: {
        location: string;
        slot: string;
        timeRemaining: string;
        amount: number;
    };
    walletBalance: number;
    rating: number;
    lastActive: string;
}

export default function DriverManagement() {
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [drivers, setDrivers] = useState<Driver[]>([
        {
            id: '1',
            name: 'Arjun Mehta',
            email: 'arjun@example.com',
            phone: '+91 98765 43210',
            vehicleNumber: 'MH 02 AB 1234',
            vehicleType: 'Sedan',
            status: 'active',
            joinedDate: '15 Jan 2026',
            totalBookings: 124,
            activeBooking: { location: 'City Center Plaza', slot: 'A-15', timeRemaining: '2h 15m', amount: 100 },
            walletBalance: 1250,
            rating: 4.8,
            lastActive: '5 mins ago'
        },
        {
            id: '2',
            name: 'Priya Sharma',
            email: 'priya@example.com',
            phone: '+91 98765 43211',
            vehicleNumber: 'DL 01 CD 5678',
            vehicleType: 'SUV',
            status: 'active',
            joinedDate: '10 Jan 2026',
            totalBookings: 89,
            walletBalance: 850,
            rating: 4.6,
            lastActive: '12 mins ago'
        },
    ]);

    const filteredDrivers = drivers.filter(driver => {
        const matchesStatus = filterStatus === 'all' || driver.status === filterStatus;
        const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            driver.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const updateStatus = (id: string, newStatus: Driver['status']) => {
        setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
        setSelectedDriver(null);
    };

    const renderCard = (driver: Driver) => (
        <TouchableOpacity
            onPress={() => setSelectedDriver(driver)}
            className="bg-white rounded-[32px] p-6 mb-4 border border-gray-50 flex-row justify-between items-center shadow-sm"
        >
            <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-gray-900 font-black text-lg">{driver.name}</Text>
                    <View className={`w-2 h-2 rounded-full ${driver.status === 'active' ? 'bg-teal-500' : 'bg-red-400'}`} />
                </View>
                <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">{driver.vehicleNumber} • {driver.vehicleType}</Text>
            </View>
            <View className="items-end">
                <Text className="text-teal-600 font-black text-lg">₹{driver.walletBalance}</Text>
                <Text className="text-gray-400 font-bold text-[8px] uppercase">Balance</Text>
            </View>
        </TouchableOpacity>
    );

    const renderDetails = (driver: Driver) => (
        <View>
            <View className="flex-row flex-wrap justify-between gap-4 mb-8">
                {[
                    { label: 'Rating', value: driver.rating, icon: 'star' },
                    { label: 'Total Trips', value: driver.totalBookings, icon: 'car-sport-outline' },
                    { label: 'Wallet', value: `₹${driver.walletBalance}`, icon: 'wallet-outline' },
                    { label: 'Joined', value: driver.joinedDate, icon: 'calendar-outline' }
                ].map((stat, i) => (
                    <View key={i} className="bg-gray-50/50 w-[47%] p-5 rounded-3xl border border-gray-50">
                        <Ionicons name={stat.icon as any} size={20} color="#00B894" />
                        <Text className="text-gray-400 font-bold text-[8px] uppercase tracking-widest mt-4">{stat.label}</Text>
                        <Text className="text-gray-900 font-black text-xl mt-1">{stat.value}</Text>
                    </View>
                ))}
            </View>

            {driver.activeBooking && (
                <View className="bg-teal-50/50 rounded-[32px] p-6 mb-8 border border-teal-100">
                    <Text className="text-teal-700 font-black text-xs uppercase tracking-widest mb-4">Active Booking</Text>
                    <Text className="text-gray-900 font-black text-lg">{driver.activeBooking.location}</Text>
                    <View className="flex-row justify-between mt-2">
                        <Text className="text-gray-500 font-bold">Slot: {driver.activeBooking.slot}</Text>
                        <Text className="text-teal-600 font-black">{driver.activeBooking.timeRemaining} Left</Text>
                    </View>
                </View>
            )}

            <Text className="text-gray-900 font-black text-lg mb-4">Account Details</Text>
            <View className="bg-gray-50 rounded-[32px] p-6 border border-gray-50 mb-8">
                <View className="flex-row justify-between py-3 border-b border-gray-100">
                    <Text className="text-gray-400 font-bold">Email</Text>
                    <Text className="text-gray-900 font-black">{driver.email}</Text>
                </View>
                <View className="flex-row justify-between py-3 border-b border-gray-100">
                    <Text className="text-gray-400 font-bold">Phone</Text>
                    <Text className="text-gray-900 font-black">{driver.phone}</Text>
                </View>
                <View className="flex-row justify-between py-3">
                    <Text className="text-gray-400 font-bold">Vehicle</Text>
                    <Text className="text-gray-900 font-black">{driver.vehicleNumber}</Text>
                </View>
            </View>
        </View>
    );

    const renderActions = (driver: Driver) => (
        <View className="flex-row gap-4">
            <TouchableOpacity
                onPress={() => updateStatus(driver.id, driver.status === 'suspended' ? 'active' : 'suspended')}
                className={`flex-1 ${driver.status === 'suspended' ? 'bg-teal-500' : 'bg-red-500'} py-5 rounded-3xl items-center`}
            >
                <Text className="text-white font-black uppercase">
                    {driver.status === 'suspended' ? 'Reactivate Driver' : 'Suspend Driver'}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => Alert.alert("Notification", "Push notification sent to driver.")}
                className="bg-gray-100 px-8 rounded-3xl items-center justify-center border border-gray-200"
            >
                <Ionicons name="notifications-outline" size={24} color="#1F2937" />
            </TouchableOpacity>
        </View>
    );

    return (
        <UnifiedManagement
            title="Driver Roster"
            role="drivers"
            stats={[
                { label: 'Total', value: drivers.length, color: '#00B894', bg: '#E8F6F3' },
                { label: 'Active', value: drivers.filter(d => d.status === 'active').length, color: '#00B894', bg: '#E8F6F3' },
                { label: 'Suspended', value: drivers.filter(d => d.status === 'suspended').length, color: '#FF7675', bg: '#FFE8E8' },
            ]}
            items={filteredDrivers}
            filterTabs={[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'suspended', label: 'Suspended' },
            ]}
            activeFilter={filterStatus}
            onFilterChange={(id) => setFilterStatus(id as any)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            renderCard={renderCard}
            selectedItem={selectedDriver}
            onSelectItem={setSelectedDriver}
            renderDetails={renderDetails}
            renderActions={renderActions}
        />
    );
}
