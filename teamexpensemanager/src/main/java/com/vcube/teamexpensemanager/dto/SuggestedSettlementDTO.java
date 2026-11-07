package com.vcube.teamexpensemanager.dto;

import java.math.BigDecimal;

public record SuggestedSettlementDTO(
        Long payerId,
        String payerName,
        Long payeeId,
        String payeeName,
        BigDecimal amount
) {
}
