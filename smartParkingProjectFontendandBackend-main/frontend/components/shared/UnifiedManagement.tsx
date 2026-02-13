import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Stat {
    label: string;
    value: string | number;
    color: string;
    bg: string;
}

interface FilterTab {
    id: string;
    label: string;
}

interface UnifiedManagementProps<T> {
    title: string;
    role: 'drivers' | 'providers' | 'disputes' | 'analytics';
    stats: Stat[];
    items: T[];
    filterTabs: FilterTab[];
    activeFilter: string;
    onFilterChange: (id: string) => void;
    searchQuery: string;
    onSearchChange: (text: string) => void;
    renderCard: (item: T, index: number) => React.ReactNode;
    selectedItem: T | null;
    onSelectItem: (item: T | null) => void;
    renderDetails: (item: T) => React.ReactNode;
    renderActions?: (item: T) => React.ReactNode;
}

export default function UnifiedManagement<
    T extends { id: string; name?: string; title?: string }
>({
    title,
    role,
    stats,
    items,
    filterTabs,
    activeFilter,
    onFilterChange,
    searchQuery,
    onSearchChange,
    renderCard,
    selectedItem,
    onSelectItem,
    renderDetails,
    renderActions
}: UnifiedManagementProps<T>) {

    return (
        <View className="flex-1 bg-white">
            <FlatList<T>
                data={items}
                keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
    <>{renderCard(item, index)}</>
)}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                className="px-6"
                ListHeaderComponent={() => (
                    <View className="px-6 pt-6 bg-white">
                        <Text className="text-gray-900 font-black text-3xl mb-6">
                            {title}
                        </Text>

                        {/* Stats Overview */}
                        <View className="flex-row gap-3 mb-8">
                            {stats.map((stat, index) => (
                                <View
                                    key={index}
                                    style={{ backgroundColor: stat.bg }}
                                    className="flex-1 rounded-[32px] p-4 border border-white/20"
                                >
                                    <Text
                                        style={{ color: stat.color }}
                                        className="text-2xl font-black"
                                    >
                                        {stat.value}
                                    </Text>
                                    <Text
                                        style={{ color: stat.color }}
                                        className="text-[10px] font-bold uppercase tracking-widest mt-1"
                                    >
                                        {stat.label}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Search Bar */}
                        <View className="bg-gray-50 rounded-2xl px-5 py-4 flex-row items-center mb-6 border border-gray-100">
                            <Ionicons name="search" size={20} color="#9CA3AF" />
                            <TextInput
                                placeholder={`Search ${role}...`}
                                value={searchQuery}
                                onChangeText={onSearchChange}
                                className="flex-1 ml-3 text-gray-900 font-bold"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Filter Tabs */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="flex-row gap-2 mb-8"
                        >
                            {filterTabs.map((tab) => (
                                <TouchableOpacity
                                    key={tab.id}
                                    onPress={() => onFilterChange(tab.id)}
                                    className={`px-6 py-3 rounded-2xl border ${
                                        activeFilter === tab.id
                                            ? 'bg-slate-900 border-slate-900 shadow-lg shadow-slate-200'
                                            : 'bg-white border-gray-100'
                                    }`}
                                >
                                    <Text
                                        className={`font-black text-[10px] uppercase tracking-widest ${
                                            activeFilter === tab.id
                                                ? 'text-white'
                                                : 'text-gray-400'
                                        }`}
                                    >
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-4 ml-1">
                            {items.length} Records Found
                        </Text>
                    </View>
                )}
            />

            {/* Details Modal */}
            <Modal visible={!!selectedItem} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <Animated.View
                        entering={FadeInUp}
                        className="bg-white rounded-t-[48px] h-[92%]"
                    >
                        {selectedItem && (
                            <View className="flex-1">
                                {/* Modal Header */}
                                <View className="p-8 pb-4 flex-row justify-between items-center border-b border-gray-50">
                                    <View>
                                        <Text className="text-[10px] text-gray-400 font-black uppercase tracking-[3px] mb-1">
                                            Detailed View
                                        </Text>
                                        <Text className="text-2xl font-black text-gray-900">
                                            {selectedItem.name || selectedItem.title}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => onSelectItem(null)}
                                        className="w-12 h-12 bg-gray-50 rounded-2xl justify-center items-center"
                                    >
                                        <Ionicons name="close" size={24} color="#1F2937" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    className="px-8 pt-6"
                                >
                                    {renderDetails(selectedItem)}
                                    <View className="h-20" />
                                </ScrollView>

                                {/* Action Buttons */}
                                {renderActions && (
                                    <View className="bg-white px-8 py-6 border-t border-gray-50 shadow-2xl">
                                        {renderActions(selectedItem)}
                                    </View>
                                )}
                            </View>
                        )}
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
