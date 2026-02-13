package com.parkease.backend.service;

import com.parkease.backend.entity.Booking;
import com.parkease.backend.entity.Payment;
import com.parkease.backend.enumtype.PaymentStatus;
import com.parkease.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final com.parkease.backend.repository.WalletTransactionRepository walletTransactionRepository;
    private final com.parkease.backend.repository.UserRepository userRepository;

    public PaymentService(PaymentRepository paymentRepository,
            com.parkease.backend.repository.WalletTransactionRepository walletTransactionRepository,
            com.parkease.backend.repository.UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.userRepository = userRepository;
    }

    public Payment createPayment(
            Booking booking,
            double totalAmount,
            double platformFee,
            String method) {

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setTotalAmount(totalAmount);
        payment.setPlatformFee(platformFee);
        payment.setProviderEarning(totalAmount - platformFee);
        payment.setPaymentMethod(method);
        payment.setStatus(PaymentStatus.PAID);

        Payment savedPayment = paymentRepository.save(payment);

        // Record for Provider (Graph update)
        com.parkease.backend.entity.User provider = booking.getParkingSlot().getParkingLot().getProvider();
        
        // Update Provider Balance
        double currentProviderBalance = provider.getWalletBalance() != null ? provider.getWalletBalance() : 0.0;
        provider.setWalletBalance(currentProviderBalance + payment.getProviderEarning());
        userRepository.save(provider);
        
        com.parkease.backend.entity.WalletTransaction providerTx = new com.parkease.backend.entity.WalletTransaction(
                provider, payment.getProviderEarning(), "CREDIT", "Earnings from Booking #" + booking.getId());
        walletTransactionRepository.save(providerTx);

        // Record for Driver (Spending)
        com.parkease.backend.entity.User driver = booking.getDriver();
        
        // Update Driver Balance
        double currentDriverBalance = driver.getWalletBalance() != null ? driver.getWalletBalance() : 0.0;
        driver.setWalletBalance(currentDriverBalance - payment.getTotalAmount());
        userRepository.save(driver);
        
        com.parkease.backend.entity.WalletTransaction driverTx = new com.parkease.backend.entity.WalletTransaction(
                driver, payment.getTotalAmount(), "DEBIT", "Payment for Booking #" + booking.getId());
        walletTransactionRepository.save(driverTx);

        return savedPayment;
    }
}
