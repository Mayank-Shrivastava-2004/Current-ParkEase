package com.parkease.backend.dto;

import java.util.List;

public class ParkingDurationResponse {

    public List<Bucket> buckets;

    public static class Bucket {
        public String label;
        public long count;
    }
}
