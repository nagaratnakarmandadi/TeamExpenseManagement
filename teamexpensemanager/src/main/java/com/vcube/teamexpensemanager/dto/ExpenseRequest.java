package com.vcube.teamexpensemanager.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.vcube.teamexpensemanager.entity.SplitType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ExpenseRequest(
        @NotBlank(message = "Description is required")
        String description,

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be greater than zero")
        BigDecimal amount,

        @NotBlank(message = "Category is required")
        String category,

        @NotNull(message = "Expense date is required")
        LocalDate expenseDate,

        @NotNull(message = "Event ID is required")
        Long eventId,

        @NotNull(message = "User ID is required")
        Long userId,

        SplitType splitType,

        List<ExpenseSplitRequest> splits
) {
}
