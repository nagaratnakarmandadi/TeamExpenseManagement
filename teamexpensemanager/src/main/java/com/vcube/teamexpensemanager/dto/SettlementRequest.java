package com.vcube.teamexpensemanager.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SettlementRequest(
        @NotNull(message = "Event ID is required")
        Long eventId,

        @NotNull(message = "Payer ID is required")
        Long payerId,

        @NotNull(message = "Payee ID is required")
        Long payeeId,

        @NotNull(message = "Settlement amount is required")
        @Positive(message = "Settlement amount must be positive")
        BigDecimal amount,

        @NotBlank(message = "Payment method is required (e.g. CASH, UPI, BANK_TRANSFER)")
        String paymentMethod,

        String transactionRef,

        String notes
) {
}
