package com.parkease.backend.controller;

import com.parkease.backend.entity.Review;
import com.parkease.backend.entity.User;
import com.parkease.backend.repository.ReviewRepository;
import com.parkease.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public ReviewController(ReviewRepository reviewRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/provider/reviews")
    public ResponseEntity<?> getProviderReviews(Authentication auth) {
        String email = auth.getName();
        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        List<Review> reviewsList = reviewRepository.findByProviderOrderByCreatedAtDesc(provider);

        // Calculate Summary
        double totalRating = 0;
        int count5 = 0, count4 = 0, count3 = 0, count2 = 0, count1 = 0;

        List<Map<String, Object>> reviewsData = new ArrayList<>();
        for (Review r : reviewsList) {
            totalRating += r.getRating();
            if (r.getRating() == 5)
                count5++;
            else if (r.getRating() == 4)
                count4++;
            else if (r.getRating() == 3)
                count3++;
            else if (r.getRating() == 2)
                count2++;
            else if (r.getRating() == 1)
                count1++;

            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("rating", r.getRating());
            map.put("comment", r.getComment());
            map.put("customer", r.getDriver().getFullName());
            map.put("date", r.getCreatedAt().toLocalDate().toString());
            reviewsData.add(map);
        }

        double avg = reviewsList.isEmpty() ? 0 : Math.round((totalRating / reviewsList.size()) * 10.0) / 10.0;

        Map<String, Object> summary = new HashMap<>();
        summary.put("averageRating", avg);
        summary.put("totalReviews", reviewsList.size());
        summary.put("fiveStars", count5);
        summary.put("fourStars", count4);
        summary.put("threeStars", count3);
        summary.put("twoStars", count2);
        summary.put("oneStars", count1);

        Map<String, Object> response = new HashMap<>();
        response.put("summary", summary);
        response.put("reviews", reviewsData);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/reviews")
    public ResponseEntity<?> submitReview(@RequestBody Map<String, Object> payload, Authentication auth) {
        String driverEmail = auth.getName();
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // For testing, we might need a providerId.
        // If not provided, we can find the first provider or handle it.
        // Usually, a driver reviews a provider after a booking.

        Long providerId = Long.parseLong(payload.get("providerId").toString());
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        int rating = Integer.parseInt(payload.get("rating").toString());
        String comment = (String) payload.get("comment");

        Review review = new Review();
        review.setDriver(driver);
        review.setProvider(provider);
        review.setRating(rating);
        review.setComment(comment);
        review.setCreatedAt(LocalDateTime.now());

        reviewRepository.save(review);

        return ResponseEntity.ok(Map.of("message", "Review submitted successfully"));
    }
}
