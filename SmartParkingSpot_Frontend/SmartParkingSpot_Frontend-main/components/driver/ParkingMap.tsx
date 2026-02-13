import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ParkingSlot {
    id: string;
    name: string;
    location: string;
    price: number;
    available: boolean;
    distance: string;
    rating: number;
    type: 'car' | 'bike' | 'truck';
}

interface ParkingMapProps {
    slots: ParkingSlot[];
    onMarkerPress: (slot: ParkingSlot) => void;
}

export default function ParkingMap({ slots, onMarkerPress }: ParkingMapProps) {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#e0f2f1', '#b2dfdb']}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="map" size={48} color="#00695c" />
                    </View>
                    <Text style={styles.title}>Map View Placeholder</Text>
                    <Text style={styles.subtitle}>
                        Map functionality is currently disabled for optimization.
                        Please use the List View for bookings.
                    </Text>

                    {/* Simulated "Mock" Map Interaction - Optional List of available slots as buttons */}
                    <View style={styles.mockList}>
                        <Text style={styles.mockTitle}>Available Spots nearby:</Text>
                        {slots.slice(0, 3).map((slot) => (
                            <TouchableOpacity
                                key={slot.id}
                                style={styles.slotButton}
                                onPress={() => onMarkerPress(slot)}
                            >
                                <Ionicons name="car" size={16} color="white" />
                                <Text style={styles.slotText}>{slot.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 400,
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        marginTop: 16,
        marginBottom: 16,
    },
    gradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        padding: 20,
        borderRadius: 50,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#004d40',
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center',
        color: '#00695c',
        marginBottom: 20,
        fontSize: 12,
    },
    mockList: {
        width: '100%',
        alignItems: 'center',
        gap: 10,
    },
    mockTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#00796b',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    slotButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00B894',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
        width: 200,
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    slotText: {
        color: 'white',
        fontWeight: 'bold',
    }
});
