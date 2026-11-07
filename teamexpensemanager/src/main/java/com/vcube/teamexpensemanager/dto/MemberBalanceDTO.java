package com.vcube.teamexpensemanager.dto;

import java.math.BigDecimal;

public record MemberBalanceDTO(
        Long userId,
        String userName,
        String email,
        BigDecimal totalPaid,
        BigDecimal totalOwed,
        BigDecimal netBalance,
        String status // OWED_MONEY (net > 0), IN_DEBT (net < 0), SETTLED (net == 0)
) {
}
