import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import UnifiedManagement from '../shared/UnifiedManagement';

interface Provider {
    id: string;
    name: string;
    ownerName: string;
    email: string;
    phone: string;
    location: string;
    address: string;
    totalSlots: number;
    occupiedSlots: number;
    evChargers: number;
    pricePerHour: number;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    appliedDate: string;
    uptime: string;
    documents: {
        businessLicense: boolean;
        propertyProof: boolean;
        idProof: boolean;
    };
    photos: string[];
    rating: number;
    complaints: number;
    revenue: number;
}

export default function ProviderManagement() {
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'suspended'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [providers, setProviders] = useState<Provider[]>([
        {
            id: '1',
            name: 'City Plaza Parking',
            ownerName: 'Rajesh Kumar',
            email: 'rajesh@cityplaza.com',
            phone: '+91 98765 43210',
            location: 'Sector 62, Noida',
            address: 'City Plaza Mall, Noida, UP',
            totalSlots: 50,
            occupiedSlots: 32,
            evChargers: 5,
            pricePerHour: 40,
            status: 'pending',
            appliedDate: '02 Feb 2026',
            uptime: '99.8%',
            documents: { businessLicense: true, propertyProof: true, idProof: true },
            photos: ['p1', 'p2'],
            rating: 4.8,
            complaints: 0,
            revenue: 12500
        },
        {
            id: '2',
            name: 'Metro Square Lot',
            ownerName: 'Suresh Singh',
            email: 'suresh@metro.com',
            phone: '+91 98765 43211',
            location: 'Gurgaon PH-3',
            address: 'Metro Square, Gurgaon, HR',
            totalSlots: 100,
            occupiedSlots: 85,
            evChargers: 12,
            pricePerHour: 60,
            status: 'approved',
            appliedDate: '15 Jan 2026',
            uptime: '99.5%',
            documents: { businessLicense: true, propertyProof: true, idProof: true },
            photos: ['p1', 'p2', 'p3'],
            rating: 4.5,
            complaints: 2,
            revenue: 85600
        },
    ]);

    const filteredProviders = providers.filter(provider => {
        const matchesStatus = filterStatus === 'all' || provider.status === filterStatus;
        const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            provider.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const updateStatus = (id: string, newStatus: Provider['status']) => {
        setProviders(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        setSelectedProvider(null);
    };

    const renderCard = (provider: Provider) => (
        <TouchableOpacity
            onPress={() => setSelectedProvider(provider)}
            className="bg-white rounded-[32px] p-6 mb-4 border border-gray-50 flex-row justify-between items-center shadow-sm"
        >
            <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-gray-900 font-black text-lg">{provider.name}</Text>
                    <View className={`w-2 h-2 rounded-full ${provider.status === 'approved' ? 'bg-green-500' : 'bg-amber-400'}`} />
                </View>
                <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">{provider.ownerName} • {provider.location}</Text>
            </View>
            <View className="items-end">
                <Text className="text-indigo-600 font-black text-lg">₹{(provider.revenue / 1000).toFixed(1)}k</Text>
                <Text className="text-gray-400 font-bold text-[8px] uppercase">Revenue</Text>
            </View>
        </TouchableOpacity>
    );

    const renderDetails = (provider: Provider) => (
        <View>
            <View className="flex-row flex-wrap justify-between gap-4 mb-8">
                {[
                    { label: 'Occupancy', value: `${provider.occupiedSlots}/${provider.totalSlots}`, icon: 'car-outline' },
                    { label: 'Uptime', value: provider.uptime, icon: 'pulse-outline' },
                    { label: 'Revenue', value: `₹${provider.revenue}`, icon: 'cash-outline' },
                    { label: 'Complaints', value: provider.complaints.toString(), icon: 'alert-circle-outline', color: provider.complaints > 0 ? 'text-red-500' : 'text-green-500' }
                ].map((stat, i) => (
                    <View key={i} className="bg-gray-50/50 w-[47%] p-5 rounded-3xl border border-gray-50">
                        <Ionicons name={stat.icon as any} size={20} color="#6C5CE7" />
                        <Text className="text-gray-400 font-bold text-[8px] uppercase tracking-widest mt-4">{stat.label}</Text>
                        <Text className={`text-gray-900 font-black text-xl mt-1 ${stat.color || ''}`}>{stat.value}</Text>
                    </View>
                ))}
            </View>

            <Text className="text-gray-900 font-black text-lg mb-4">Contact & Location</Text>
            <View className="bg-indigo-50/30 rounded-[32px] p-6 mb-8 border border-indigo-50">
                <View className="flex-row items-center mb-4">
                    <Ionicons name="mail-outline" size={18} color="#6C5CE7" />
                    <Text className="text-gray-700 font-bold ml-3">{provider.email}</Text>
                </View>
                <View className="flex-row items-center mb-4">
                    <Ionicons name="call-outline" size={18} color="#6C5CE7" />
                    <Text className="text-gray-700 font-bold ml-3">{provider.phone}</Text>
                </View>
                <View className="flex-row items-center">
                    <Ionicons name="location-outline" size={18} color="#6C5CE7" />
                    <Text className="text-gray-700 font-bold ml-3">{provider.address}</Text>
                </View>
            </View>

            <Text className="text-gray-900 font-black text-lg mb-4">Documents</Text>
            <View className="bg-gray-50 rounded-[32px] p-6 border border-gray-100 mb-8">
                {['Business License', 'Property ownership', 'Owner ID Proof'].map((doc, i) => (
                    <View key={i} className={`flex-row justify-between items-center py-3 ${i !== 2 ? 'border-b border-gray-50' : ''}`}>
                        <Text className="text-gray-600 font-bold">{doc}</Text>
                        <Ionicons name="checkmark-circle" size={20} color="#00B894" />
                    </View>
                ))}
            </View>
        </View>
    );

    const renderActions = (provider: Provider) => (
        <View className="flex-row gap-4">
            {provider.status === 'pending' ? (
                <>
                    <TouchableOpacity
                        onPress={() => updateStatus(provider.id, 'approved')}
                        className="flex-1 bg-green-500 py-5 rounded-3xl items-center"
                    >
                        <Text className="text-white font-black uppercase">Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => updateStatus(provider.id, 'rejected')}
                        className="flex-1 bg-red-500 py-5 rounded-3xl items-center"
                    >
                        <Text className="text-white font-black uppercase">Reject</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <TouchableOpacity
                        onPress={() => updateStatus(provider.id, provider.status === 'suspended' ? 'approved' : 'suspended')}
                        className={`flex-1 ${provider.status === 'suspended' ? 'bg-green-500' : 'bg-slate-900'} py-5 rounded-3xl items-center`}
                    >
                        <Text className="text-white font-black uppercase">
                            {provider.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                        </Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );

    return (
        <UnifiedManagement
            title="Provider Hub"
            role="providers"
            stats={[
                { label: 'Total', value: providers.length, color: '#6C5CE7', bg: '#F3E8FF' },
                { label: 'Active', value: providers.filter(p => p.status === 'approved').length, color: '#00B894', bg: '#E8F6F3' },
                { label: 'Pending', value: providers.filter(p => p.status === 'pending').length, color: '#FF7675', bg: '#FFE8E8' },
            ]}
            items={filteredProviders}
            filterTabs={[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'approved', label: 'Approved' },
                { id: 'suspended', label: 'Suspended' },
            ]}
            activeFilter={filterStatus}
            onFilterChange={(id) => setFilterStatus(id as any)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            renderCard={renderCard}
            selectedItem={selectedProvider}
            onSelectItem={setSelectedProvider}
            renderDetails={renderDetails}
            renderActions={renderActions}
        />
    );
}
