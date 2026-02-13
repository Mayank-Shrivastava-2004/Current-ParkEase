package com.parkease.backend.dto;

import java.util.List;

public class LiveStatusResponse {

    private Stats stats;
    private List<ActiveBookingResponse> bookings;

    public LiveStatusResponse(Stats stats, List<ActiveBookingResponse> bookings) {
        this.stats = stats;
        this.bookings = bookings;
    }

    public Stats getStats() {
        return stats;
    }

    public List<ActiveBookingResponse> getBookings() {
        return bookings;
    }

    public static class Stats {
        private int occupied;
        private int available;
        private int exiting;

        public Stats(int occupied, int available, int exiting) {
            this.occupied = occupied;
            this.available = available;
            this.exiting = exiting;
        }

        public int getOccupied() {
            return occupied;
        }

        public int getAvailable() {
            return available;
        }

        public int getExiting() {
            return exiting;
        }
    }
}
