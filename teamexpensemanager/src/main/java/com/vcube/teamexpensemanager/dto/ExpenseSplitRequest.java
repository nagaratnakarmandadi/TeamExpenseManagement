package com.vcube.teamexpensemanager.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ExpenseSplitRequest(
        @NotNull(message = "User ID is required for split")
        Long userId,

        @PositiveOrZero(message = "Allocated amount cannot be negative")
        BigDecimal allocatedAmount,

        @PositiveOrZero(message = "Percentage cannot be negative")
        BigDecimal percentage
) {
}
