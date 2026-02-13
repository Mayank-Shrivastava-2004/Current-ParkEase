import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import UnifiedManagement from '../shared/UnifiedManagement';

import BASE_URL from '../../constants/api';

const API = `${BASE_URL}/api/admin/providers`;

interface Provider {
    id: string;
    name: string;
    ownerName: string;
    email: string;
    phone: string;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    appliedDate: string;

    totalSlots: number;
    occupiedSlots: number;
    evChargers: number;
    pricePerHour: number;
    uptime: string;
    rating: number;
    complaints: number;
    revenue: number;
}

export default function ProviderManagement() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'suspended'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch(API, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(setProviders);
    }, []);

    const filteredProviders = providers.filter(p =>
        (filterStatus === 'all' || p.status === filterStatus) &&
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const action = (id: string, type: string) =>
        fetch(`${API}/${id}/${type}`, {
            method: type === 'reject' ? 'DELETE' : 'PUT',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }).then(() =>
            setProviders(p => p.map(pr =>
                pr.id === id
                    ? { ...pr, status: type === 'approve' ? 'approved' : type === 'suspend' ? 'suspended' : 'approved' }
                    : pr
            ))
        );

    const renderCard = (provider: Provider) => (
        <TouchableOpacity
            onPress={() => setSelectedProvider(provider)}
            className="bg-white rounded-[32px] p-6 mb-4 border border-gray-50 flex-row justify-between items-center shadow-sm"
        >
            <View className="flex-1">
                <Text className="text-gray-900 font-black text-lg">{provider.name}</Text>
                <Text className="text-gray-400 font-bold text-[10px] uppercase">{provider.email}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderDetails = (p: Provider) => (
        <View>
            <Text className="text-gray-900 font-black text-lg mb-4">Contact</Text>
            <Text>{p.email}</Text>
            <Text>{p.phone}</Text>
        </View>
    );

    const renderActions = (p: Provider) => (
        <View className="flex-row gap-4">
            {p.status === 'pending' && (
                <>
                    <TouchableOpacity onPress={() => action(p.id, 'approve')} className="flex-1 bg-green-500 py-5 rounded-3xl items-center">
                        <Text className="text-white font-black uppercase">Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => action(p.id, 'reject')} className="flex-1 bg-red-500 py-5 rounded-3xl items-center">
                        <Text className="text-white font-black uppercase">Reject</Text>
                    </TouchableOpacity>
                </>
            )}
            {p.status === 'approved' && (
                <TouchableOpacity onPress={() => action(p.id, 'suspend')} className="flex-1 bg-slate-900 py-5 rounded-3xl items-center">
                    <Text className="text-white font-black uppercase">Suspend</Text>
                </TouchableOpacity>
            )}
            {p.status === 'suspended' && (
                <TouchableOpacity onPress={() => action(p.id, 'reactivate')} className="flex-1 bg-green-500 py-5 rounded-3xl items-center">
                    <Text className="text-white font-black uppercase">Reactivate</Text>
                </TouchableOpacity>
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
