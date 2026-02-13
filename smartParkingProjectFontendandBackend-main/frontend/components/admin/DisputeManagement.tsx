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

const API = `${BASE_URL}/api/admin/disputes`;

interface Dispute {
    id: string;
    title: string;
    type: 'refund' | 'complaint' | 'technical' | 'payment';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    reportedBy: {
        name: string;
        type: 'driver' | 'provider';
        id: string;
    };
    description: string;
    amount?: number;
    location?: string;
    reportedDate: string;
    lastUpdated: string;
}

export default function DisputeManagement() {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [filterStatus, setFilterStatus] =
        useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch(API, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(setDisputes);
    }, []);

    const filteredDisputes = disputes.filter(d =>
        (filterStatus === 'all' || d.status === filterStatus) &&
        d.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const action = (id: string, type: 'resolve' | 'escalate') =>
        fetch(`${API}/${id}/${type}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }).then(() => {
            Alert.alert(
                type === 'resolve' ? 'Resolved' : 'Escalated',
                `Dispute ${type === 'resolve' ? 'resolved' : 'escalated'} successfully`
            );
            setSelectedDispute(null);
        });

    const renderCard = (dispute: Dispute) => (
        <TouchableOpacity
            onPress={() => setSelectedDispute(dispute)}
            className="bg-white rounded-[32px] p-6 mb-4 border border-gray-50 shadow-sm"
        >
            <Text className="text-gray-900 font-black text-lg">{dispute.title}</Text>
            <Text className="text-gray-400 text-xs uppercase">
                #{dispute.id} • {dispute.type}
            </Text>
        </TouchableOpacity>
    );

    const renderDetails = (dispute: Dispute) => (
        <View>
            <Text className="text-gray-900 font-black text-lg mb-4">Description</Text>
            <Text className="text-gray-700">{dispute.description}</Text>
        </View>
    );

    const renderActions = (dispute: Dispute) => (
        <View className="flex-row gap-4">
            <TouchableOpacity
                onPress={() => action(dispute.id, 'resolve')}
                className="flex-1 bg-green-500 py-5 rounded-3xl items-center"
            >
                <Text className="text-white font-black uppercase">Mark as Resolved</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => action(dispute.id, 'escalate')}
                className="flex-1 bg-red-500 py-5 rounded-3xl items-center"
            >
                <Text className="text-white font-black uppercase">Escalate</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <UnifiedManagement
            title="Dispute Center"
            role="disputes"
            stats={[
                { label: 'Open', value: disputes.filter(d => d.status === 'open').length, color: '#FF7675', bg: '#FFE8E8' },
                { label: 'Pending', value: disputes.filter(d => d.status === 'in_progress').length, color: '#FAB1A0', bg: '#FFF5F0' },
                { label: 'Resolved', value: disputes.filter(d => d.status === 'resolved').length, color: '#00B894', bg: '#E8F6F3' },
            ]}
            items={filteredDisputes}
            filterTabs={[
                { id: 'all', label: 'All' },
                { id: 'open', label: 'Open' },
                { id: 'in_progress', label: 'Pending' },
                { id: 'resolved', label: 'Resolved' },
            ]}
            activeFilter={filterStatus}
            onFilterChange={(id) => setFilterStatus(id as any)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            renderCard={renderCard}
            selectedItem={selectedDispute}
            onSelectItem={setSelectedDispute}
            renderDetails={renderDetails}
            renderActions={renderActions}
        />
    );
}
