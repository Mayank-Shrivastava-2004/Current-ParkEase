import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';

interface DataPoint {
    label: string;
    value: number;
}

interface LineChartProps {
    data: DataPoint[];
    lineColor?: string;
    fillColor?: string;
    title?: string;
    height?: number;
    valuePrefix?: string;
    dark?: boolean;
}

export default function LineChart({
    data,
    lineColor = '#6366F1',
    fillColor = '#6366F1',
    title,
    height = 200,
    valuePrefix = '',
    dark = false,
}: LineChartProps) {
    const screenWidth = Dimensions.get('window').width - 80; // padding
    const chartHeight = height;
    const padding = 40;

    if (!data || data.length === 0) {
        return (
            <View className={`${dark ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-100'} rounded-2xl p-6 items-center justify-center border`} style={{ height }}>
                <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">No Data Available</Text>
            </View>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const valueRange = maxValue - minValue || 1;

    const pointSpacing = screenWidth / (data.length - 1 || 1);

    // Generate path for line
    const linePath = data.map((point, index) => {
        const x = index * pointSpacing;
        const y = chartHeight - padding - ((point.value - minValue) / valueRange) * (chartHeight - padding * 2);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    // Generate path for filled area
    const areaPath = `${linePath} L ${(data.length - 1) * pointSpacing} ${chartHeight - padding} L 0 ${chartHeight - padding} Z`;

    return (
        <View className="mt-4">
            {title && (
                <Text className={`text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>{title}</Text>
            )}
            <View className={`${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-2xl p-4 border`}>
                <Svg width={screenWidth} height={chartHeight}>
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => {
                        const y = padding + (i * (chartHeight - padding * 2) / 4);
                        return (
                            <Line
                                key={`grid-${i}`}
                                x1="0"
                                y1={y}
                                x2={screenWidth}
                                y2={y}
                                stroke={dark ? "#1E293B" : "#F1F5F9"}
                                strokeWidth="1"
                            />
                        );
                    })}

                    {/* Filled area */}
                    <Path
                        d={areaPath}
                        fill={fillColor}
                        fillOpacity={dark ? "0.2" : "0.1"}
                    />

                    {/* Line */}
                    <Path
                        d={linePath}
                        stroke={lineColor}
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Data points */}
                    {data.map((point, index) => {
                        const x = index * pointSpacing;
                        const y = chartHeight - padding - ((point.value - minValue) / valueRange) * (chartHeight - padding * 2);
                        return (
                            <Circle
                                key={`point-${index}`}
                                cx={x}
                                cy={y}
                                r="5"
                                fill={lineColor}
                                stroke={dark ? "#0F172A" : "white"}
                                strokeWidth="2"
                            />
                        );
                    })}

                    {/* Labels */}
                    {data.map((point, index) => {
                        const x = index * pointSpacing;
                        // Avoid crowding
                        const skipInterval = data.length > 8 ? Math.ceil(data.length / 5) : 1;
                        if (index % skipInterval !== 0 && index !== data.length - 1) return null;

                        return (
                            <SvgText
                                key={`label-${index}`}
                                x={x}
                                y={chartHeight - 10}
                                fontSize="10"
                                fill={dark ? "#64748B" : "#94A3B8"}
                                textAnchor="middle"
                                fontWeight="bold"
                            >
                                {point.label}
                            </SvgText>
                        );
                    })}
                </Svg>

                {/* Legend */}
                <View className="flex-row justify-between mt-4 px-2">
                    <View>
                        <Text className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Min</Text>
                        <Text className={`text-sm font-black ${dark ? 'text-white' : 'text-gray-900'}`}>{valuePrefix}{minValue.toLocaleString()}</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Avg</Text>
                        <Text className={`text-sm font-black ${dark ? 'text-white' : 'text-gray-900'}`}>
                            {valuePrefix}{Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length).toLocaleString()}
                        </Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Max</Text>
                        <Text className={`text-sm font-black ${dark ? 'text-white' : 'text-gray-900'}`}>{valuePrefix}{maxValue.toLocaleString()}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
