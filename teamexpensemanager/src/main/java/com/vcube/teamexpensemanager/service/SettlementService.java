package com.vcube.teamexpensemanager.service;

import java.util.List;

import com.vcube.teamexpensemanager.dto.SettlementRequest;
import com.vcube.teamexpensemanager.dto.SuggestedSettlementDTO;
import com.vcube.teamexpensemanager.entity.Settlement;

public interface SettlementService {

    Settlement recordSettlement(SettlementRequest request);

    List<Settlement> getSettlementsByEvent(Long eventId);

    List<SuggestedSettlementDTO> getSuggestedSettlements(Long eventId);
}
