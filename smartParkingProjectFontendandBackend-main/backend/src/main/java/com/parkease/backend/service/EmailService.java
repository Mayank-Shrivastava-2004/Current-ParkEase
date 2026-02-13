package com.parkease.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        System.out.println("DEBUG: Sending OTP " + otp + " to " + toEmail);
        /*
         * SimpleMailMessage message = new SimpleMailMessage();
         * message.setTo(toEmail);
         * message.setSubject("ParkEase - Password Reset OTP");
         * message.setText(
         * "Hello,\n\n" +
         * "Your OTP for resetting your ParkEase account password is:\n\n" +
         * otp + "\n\n" +
         * "This OTP is valid for 10 minutes.\n\n" +
         * "If you did not request this, please ignore this email.\n\n" +
         * "Regards,\n" +
         * "ParkEase Team"
         * );
         * 
         * mailSender.send(message);
         */
    }
}
