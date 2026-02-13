import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import UnifiedManagement from '../shared/UnifiedManagement';

import BASE_URL from '../../constants/api';

const API = `${BASE_URL}/api/admin/drivers`;

interface Driver {
    id: string;
    name: string;
    email: string;
    phone: string;
    vehicleNumber: string;
    vehicleType: string;
    status: 'active' | 'suspended';
    joinedDate: string;
    totalBookings: number;
    walletBalance: number;
    rating: number;
    lastActive: string;
}

export default function DriverManagement() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch(API, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(setDrivers);
    }, []);

    const filteredDrivers = drivers.filter(d =>
        (filterStatus === 'all' || d.status === filterStatus) &&
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const action = (id: string, type: 'suspend' | 'reactivate') =>
        fetch(`${API}/${id}/${type}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }).then(() => {
            setDrivers(d =>
                d.map(dr =>
                    dr.id === id
                        ? { ...dr, status: type === 'suspend' ? 'suspended' : 'active' }
                        : dr
                )
            );
            setSelectedDriver(null);
        });

    const renderCard = (driver: Driver) => (
        <TouchableOpacity
            onPress={() => setSelectedDriver(driver)}
            className="bg-white rounded-[32px] p-6 mb-4 border border-gray-50 flex-row justify-between items-center shadow-sm"
        >
            <View className="flex-1">
                <Text className="text-gray-900 font-black text-lg">{driver.name}</Text>
                <Text className="text-gray-400 font-bold text-[10px] uppercase">
                    {driver.vehicleNumber} • {driver.vehicleType}
                </Text>
            </View>
            <View className="items-end">
                <Text className="text-teal-600 font-black text-lg">₹{driver.walletBalance}</Text>
                <Text className="text-gray-400 font-bold text-[8px] uppercase">Balance</Text>
            </View>
        </TouchableOpacity>
    );

    const renderDetails = (driver: Driver) => (
        <View>
            <Text className="text-gray-900 font-black text-lg mb-4">Account</Text>
            <Text>Email: {driver.email}</Text>
            <Text>Phone: {driver.phone}</Text>
            <Text>Joined: {new Date(driver.joinedDate).toDateString()}</Text>
        </View>
    );

    const renderActions = (driver: Driver) => (
        <View className="flex-row gap-4">
            <TouchableOpacity
                onPress={() =>
                    action(driver.id, driver.status === 'suspended' ? 'reactivate' : 'suspend')
                }
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
