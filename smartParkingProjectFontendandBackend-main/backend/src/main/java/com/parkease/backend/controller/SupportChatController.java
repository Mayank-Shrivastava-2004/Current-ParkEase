package com.parkease.backend.controller;

import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/support")
@CrossOrigin
public class SupportChatController {

    @GetMapping("/messages")
    public ResponseEntity<?> getMessages(Authentication auth) {
        List<Map<String, Object>> messages = new ArrayList<>();

        // Mock conversation
        Map<String, Object> msg = new HashMap<>();
        msg.put("id", 1);
        msg.put("sender", "bot");
        msg.put("text", "Welcome to Asset Support. How can we assist with your parking slots today?");
        msg.put("time", java.time.LocalTime.now().format(java.time.format.DateTimeFormatter.ofPattern("hh:mm a")));
        msg.put("isRead", true);
        messages.add(msg);

        return ResponseEntity.ok(messages);
    }

    @PostMapping("/messages")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> payload, Authentication auth) {
        String userText = payload.getOrDefault("text", "").toLowerCase();
        String botReply = "I am an automated assistant. Please contact admin for urgent issues.";

        if (userText.contains("earning") || userText.contains("money") || userText.contains("revenue")) {
            botReply = "You can view your detailed earnings and request payouts in the 'Earnings' tab.";
        } else if (userText.contains("withdraw") || userText.contains("payout")) {
            botReply = "To withdraw funds, go to the Earnings section and click on the 'Withdraw' button.";
        } else if (userText.contains("provider") || userText.contains("owner") || userText.contains("lot")
                || userText.contains("space")) {
            botReply = "I have initiated a request to the parking provider. They will be notified via their dashboard immediately. You can also see their contact details in your booking receipt.";
        } else if (userText.contains("hello") || userText.contains("hi") || userText.contains("hey")) {
            botReply = "Hello! I am your Smart Deck Assistant. I can help you find parking, manage your wallet, or connect you with a parking provider.";
        } else if (userText.contains("ev") || userText.contains("charge") || userText.contains("electric")) {
            botReply = "EV Station stats are available in the 'EV Charging' tab of your dashboard.";
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("reply", botReply);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/tickets")
    public ResponseEntity<?> getTickets(Authentication auth) {
        List<Map<String, Object>> tickets = new ArrayList<>();

        String[] subjects = { "Slot Issue", "Payment Problem", "Account Access", "Feature Request" };
        String[] statuses = { "open", "in-progress", "resolved", "open" };
        String[] priorities = { "high", "medium", "low", "medium" };

        for (int i = 0; i < subjects.length; i++) {
            Map<String, Object> ticket = new HashMap<>();
            ticket.put("id", "TKT" + (1000 + i));
            ticket.put("subject", subjects[i]);
            ticket.put("status", statuses[i]);
            ticket.put("priority", priorities[i]);
            ticket.put("date", "2024-02-0" + (i + 1));
            tickets.add(ticket);
        }

        return ResponseEntity.ok(tickets);
    }
}
