import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface DonutChartProps {
    data: { label: string; value: number; color: string }[];
    size?: number;
    strokeWidth?: number;
    title?: string;
    centerLabel?: string;
    dark?: boolean;
}

export default function DonutChart({
    data,
    size = 160,
    strokeWidth = 25,
    title,
    centerLabel = 'Total',
    dark = false,
}: DonutChartProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = data.reduce((sum, item) => sum + item.value, 0);

    let currentAngle = -90; // Start from top

    return (
        <View className="items-center">
            {title && (
                <Text className={`text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>{title}</Text>
            )}
            <View className={`${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-3xl p-6 border items-center shadow-sm`}>
                <Svg width={size} height={size}>
                    <G rotation={0} origin={`${size / 2}, ${size / 2}`}>
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const strokeDashoffset = circumference - (circumference * percentage) / 100;
                            const rotation = currentAngle;
                            currentAngle += (percentage / 100) * 360;

                            return (
                                <Circle
                                    key={index}
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    stroke={item.color}
                                    strokeWidth={strokeWidth}
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="butt" // "round" causes overlap issues in small segments
                                    rotation={rotation}
                                    origin={`${size / 2}, ${size / 2}`}
                                />
                            );
                        })}
                    </G>
                </Svg>

                {/* Center text */}
                <View className="absolute" style={{ top: size / 2 + 24, alignItems: 'center' }}>
                    <Text className={`text-3xl font-black ${dark ? 'text-white' : 'text-gray-900'}`}>{total}</Text>
                    <Text className="text-gray-500 text-[9px] font-black uppercase tracking-widest">{centerLabel}</Text>
                </View>

                {/* Legend */}
                <View className="mt-8 w-full px-4">
                    {data.map((item, index) => (
                        <View key={index} className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View
                                    className="w-3 h-3 rounded-full mr-4"
                                    style={{ backgroundColor: item.color }}
                                />
                                <Text className={`font-black text-sm ${dark ? 'text-slate-300' : 'text-gray-800'}`}>{item.label}</Text>
                            </View>
                            <Text className={`font-black text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>{item.value}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}
