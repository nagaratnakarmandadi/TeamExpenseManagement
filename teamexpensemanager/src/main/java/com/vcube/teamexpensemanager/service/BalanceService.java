package com.vcube.teamexpensemanager.service;

import java.util.List;

import com.vcube.teamexpensemanager.dto.MemberBalanceDTO;

public interface BalanceService {

    List<MemberBalanceDTO> calculateEventBalances(Long eventId);
}
