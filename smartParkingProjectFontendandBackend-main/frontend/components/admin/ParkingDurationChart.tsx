import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface DurationData {
    label: string;
    count: number;
    color: string;
}

interface Props {
    data?: DurationData[];
    maxHeight?: number;
}

export default function ParkingDurationChart({
    data = [],
    maxHeight = 180
}: Props) {

    if (data.length === 0) {
        return (
            <View className="bg-white rounded-3xl p-6 border border-gray-100">
                <Text className="text-gray-400 font-bold text-center">
                    No parking duration data
                </Text>
            </View>
        );
    }

    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-gray-200 border border-gray-100">
            <Text className="font-bold text-xl mb-6">Parking Duration</Text>

            <View style={{ height: maxHeight }} className="flex-row items-end">
                {data.map((item, index) => {
                    const heightPercentage = (item.count / maxCount) * 100;

                    return (
                        <Animated.View
                            key={index}
                            entering={FadeInDown.delay(index * 100).springify()}
                            className="flex-1 items-center mx-1"
                        >
                            <Text className="text-xs font-bold mb-2">
                                {item.count}
                            </Text>

                            <View
                                style={{
                                    height: `${Math.max(heightPercentage, 5)}%`,
                                    backgroundColor: item.color
                                }}
                                className="w-full rounded-t-lg"
                            />

                            <Text className="text-[9px] text-gray-500 mt-2 text-center">
                                {item.label}
                            </Text>
                        </Animated.View>
                    );
                })}
            </View>
        </View>
    );
}
