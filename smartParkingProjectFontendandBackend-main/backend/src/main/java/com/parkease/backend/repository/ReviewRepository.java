package com.parkease.backend.repository;

import com.parkease.backend.entity.Review;
import com.parkease.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProviderOrderByCreatedAtDesc(User provider);
}
