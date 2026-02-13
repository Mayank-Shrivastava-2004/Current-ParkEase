package com.parkease.backend.dto;

import java.time.LocalDateTime;

public class AdminDisputeResponse {

    public Long id;
    public String title;
    public String type;      // refund | complaint | technical | payment
    public String status;    // open | in_progress | resolved | closed
    public String priority;  // low | medium | high | urgent

    public String reportedByName;
    public String reportedByType; // driver | provider
    public Long reportedById;

    public String description;
    public Double amount;
    public String location;

    public LocalDateTime reportedDate;
    public LocalDateTime lastUpdated;
}
