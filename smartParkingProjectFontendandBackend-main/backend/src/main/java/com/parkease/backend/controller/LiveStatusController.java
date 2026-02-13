package com.parkease.backend.controller;

import com.parkease.backend.dto.LiveStatusResponse;
import com.parkease.backend.service.LiveStatusService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/provider/live-status")
@CrossOrigin
public class LiveStatusController {

    private final LiveStatusService service;

    public LiveStatusController(LiveStatusService service) {
        this.service = service;
    }

    @GetMapping
    public LiveStatusResponse getLiveStatus(Authentication auth) {
        return service.getLiveStatus(auth.getName());
    }
}
