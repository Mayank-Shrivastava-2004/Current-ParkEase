import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import UnifiedManagement from '../shared/UnifiedManagement';

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
    assignedTo?: string;
    resolution?: string;
}

export default function DisputeManagement() {
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const disputes: Dispute[] = [
        {
            id: 'D001',
            title: 'Refund Request - Incorrect Charge',
            type: 'refund',
            status: 'open',
            priority: 'high',
            reportedBy: { name: 'Arjun Mehta', type: 'driver', id: 'DR8472' },
            description: 'I was charged ₹150 for 2 hours of parking, but I only parked for 1 hour. The parking provider did not update the exit time correctly.',
            amount: 75,
            location: 'City Center Plaza',
            reportedDate: '10 mins ago',
            lastUpdated: '10 mins ago'
        },
        {
            id: 'D002',
            title: 'Slot Was Occupied - Booking Issue',
            type: 'complaint',
            status: 'in_progress',
            priority: 'urgent',
            reportedBy: { name: 'Priya Sharma', type: 'driver', id: 'DR5621' },
            description: 'Booked slot A-15 but when I arrived, the slot was already occupied. Provider was unresponsive to my calls.',
            location: 'Grand Mall Parking',
            reportedDate: '1 hour ago',
            lastUpdated: '30 mins ago',
            assignedTo: 'Admin Team Lead'
        },
    ];

    const filteredDisputes = disputes.filter(dispute => {
        const matchesStatus = filterStatus === 'all' || dispute.status === filterStatus;
        const matchesSearch = dispute.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dispute.reportedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return '#FF7675';
            case 'high': return '#FAB1A0';
            case 'medium': return '#FFEAA7';
            default: return '#DFE6E9';
        }
    };

    const renderCard = (dispute: Dispute) => (
        <TouchableOpacity
            onPress={() => setSelectedDispute(dispute)}
            className="bg-white rounded-[32px] p-6 mb-4 border border-gray-50 shadow-sm"
        >
            <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                        <View style={{ backgroundColor: getPriorityColor(dispute.priority) }} className="w-1.5 h-6 rounded-full" />
                        <Text className="text-gray-900 font-black text-lg" numberOfLines={1}>{dispute.title}</Text>
                    </View>
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">#{dispute.id} • {dispute.type}</Text>
                </View>
                {dispute.amount && <Text className="text-red-500 font-black text-lg">₹{dispute.amount}</Text>}
            </View>
            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <Ionicons name="person-outline" size={14} color="#9CA3AF" />
                    <Text className="text-gray-500 font-bold text-xs ml-1">{dispute.reportedBy.name}</Text>
                </View>
                <Text className="text-gray-400 font-bold text-[10px] uppercase">{dispute.reportedDate}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderDetails = (dispute: Dispute) => (
        <View>
            <View className="bg-red-50/50 rounded-[32px] p-6 mb-8 border border-red-50">
                <Text className="text-red-600 font-black text-xs uppercase tracking-widest mb-4">Dispute Description</Text>
                <Text className="text-gray-700 text-sm leading-6 font-medium">{dispute.description}</Text>
            </View>

            <View className="bg-gray-50 rounded-[32px] p-6 mb-8 border border-gray-100">
                <Text className="text-gray-900 font-black text-lg mb-4">Report Details</Text>
                <View className="gap-4">
                    <View className="flex-row justify-between">
                        <Text className="text-gray-400 font-bold">Priority</Text>
                        <Text className="text-red-500 font-black uppercase text-xs">{dispute.priority}</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-gray-400 font-bold">Status</Text>
                        <Text className="text-gray-900 font-black uppercase text-xs">{dispute.status.replace('_', ' ')}</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-gray-400 font-bold">Reported By</Text>
                        <Text className="text-gray-900 font-black">{dispute.reportedBy.name} ({dispute.reportedBy.type})</Text>
                    </View>
                    {dispute.location && (
                        <View className="flex-row justify-between">
                            <Text className="text-gray-400 font-bold">Location</Text>
                            <Text className="text-gray-900 font-black">{dispute.location}</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    const renderActions = (dispute: Dispute) => (
        <View className="flex-row gap-4">
            <TouchableOpacity
                onPress={() => Alert.alert("Resolved", "Dispute marked as resolved.")}
                className="flex-1 bg-green-500 py-5 rounded-3xl items-center"
            >
                <Text className="text-white font-black uppercase">Mark as Resolved</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => Alert.alert("Escalated", "Dispute escalated to senior management.")}
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
