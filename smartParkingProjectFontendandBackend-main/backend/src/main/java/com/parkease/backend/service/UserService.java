package com.parkease.backend.service;

import com.parkease.backend.entity.User;
import com.parkease.backend.enumtype.Role;
import com.parkease.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // ================= GET USER BY ID =================
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ================= GET USER BY EMAIL =================
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ================= GET ALL USERS =================
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ================= GET USERS BY ROLE =================
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    // ================= ENABLE / DISABLE USER =================
    public void setUserEnabled(Long userId, boolean enabled) {

        User user = getUserById(userId);
        user.setEnabled(enabled);
        userRepository.save(user);
    }

    // ================= APPROVE PROVIDER =================
    public void approveProvider(Long userId) {

        User user = getUserById(userId);

        if (user.getRole() != Role.PROVIDER) {
            throw new RuntimeException("User is not a provider");
        }

        user.setApproved(true);
        userRepository.save(user);
    }

    // ================= DELETE USER =================
    public void deleteUser(Long userId) {

        User user = getUserById(userId);
        userRepository.delete(user);
    }
}
