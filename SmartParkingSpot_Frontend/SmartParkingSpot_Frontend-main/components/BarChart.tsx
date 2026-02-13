import React from 'react';
import { View, Text } from 'react-native';

interface ChartDataPoint {
    label: string;
    value: number;
}

interface BarChartProps {
    data: ChartDataPoint[];
    barColor: string;
    title: string;
    valuePrefix?: string;
    valueSuffix?: string;
    dark?: boolean;
}

export default function BarChart({
    data,
    barColor,
    title,
    valuePrefix = '',
    valueSuffix = '',
    dark = false,
}: BarChartProps) {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <View className={`${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-2xl p-5 border shadow-sm`}>
            <Text className={`font-black text-lg mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</Text>
            <View className="flex-row items-end justify-between h-40">
                {data.map((item, index) => {
                    const height = (item.value / maxValue) * 100;
                    return (
                        <View key={index} className="flex-1 items-center justify-end mx-1">
                            <Text className={`text-[10px] font-bold ${dark ? 'text-slate-400' : 'text-gray-400'} mb-2`}>
                                {valuePrefix}{item.value}{valueSuffix}
                            </Text>
                            <View
                                className={`w-full ${barColor} rounded-t-lg shadow-lg`}
                                style={{ height: `${height}%`, minHeight: 8 }}
                            />
                            <Text className={`text-[9px] font-bold ${dark ? 'text-slate-500' : 'text-gray-400'} mt-2`}>
                                {item.label}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
