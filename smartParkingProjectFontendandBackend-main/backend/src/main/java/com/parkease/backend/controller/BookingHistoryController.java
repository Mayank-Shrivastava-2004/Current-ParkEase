package com.parkease.backend.controller;

import com.parkease.backend.dto.BookingHistoryResponse;
import com.parkease.backend.service.BookingHistoryService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/provider/bookings")
@CrossOrigin
public class BookingHistoryController {

    private final BookingHistoryService service;

    public BookingHistoryController(BookingHistoryService service) {
        this.service = service;
    }

    @GetMapping("/history")
    public List<BookingHistoryResponse> history(Authentication auth) {
        return service.getHistory(auth.getName());
    }
}
