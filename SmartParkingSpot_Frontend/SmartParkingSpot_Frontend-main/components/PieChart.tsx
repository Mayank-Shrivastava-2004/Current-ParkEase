import React from 'react';
import { View, Text } from 'react-native';

interface DataPoint {
    label: string;
    value: number;
    color: string;
}

interface PieChartProps {
    data: DataPoint[];
    size?: number;
    title?: string;
}

export default function PieChart({ data, size = 200, title }: PieChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -90;

    const createArc = (percentage: number, color: string) => {
        const angle = (percentage / 100) * 360;
        const endAngle = currentAngle + angle;

        // Simple visual representation using colored boxes
        const width = (percentage / 100) * size;

        currentAngle = endAngle;

        return { width, color };
    };

    return (
        <View className="bg-white rounded-2xl p-5 border border-gray-100">
            {title && <Text className="font-black text-lg mb-4">{title}</Text>}

            {/* Circular representation */}
            <View className="items-center mb-4">
                <View
                    className="rounded-full overflow-hidden"
                    style={{ width: size, height: size }}
                >
                    <View className="flex-row flex-wrap">
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const arc = createArc(percentage, item.color);
                            return (
                                <View
                                    key={index}
                                    style={{
                                        width: arc.width,
                                        height: size / data.length,
                                        backgroundColor: item.color,
                                    }}
                                />
                            );
                        })}
                    </View>
                </View>
            </View>

            {/* Legend */}
            <View>
                {data.map((item, index) => {
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    return (
                        <View key={index} className="flex-row items-center justify-between mb-2">
                            <View className="flex-row items-center flex-1">
                                <View
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: item.color }}
                                />
                                <Text className="text-gray-600 font-semibold text-sm">{item.label}</Text>
                            </View>
                            <Text className="text-gray-900 font-black">{percentage}%</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
