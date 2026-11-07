package com.vcube.teamexpensemanager.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vcube.teamexpensemanager.dto.SettlementRequest;
import com.vcube.teamexpensemanager.dto.SuggestedSettlementDTO;
import com.vcube.teamexpensemanager.entity.Settlement;
import com.vcube.teamexpensemanager.service.SettlementService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/settlements")
public class SettlementController {

    @Autowired
    private SettlementService settlementService;

    @PostMapping
    public ResponseEntity<Settlement> recordSettlement(@Valid @RequestBody SettlementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(settlementService.recordSettlement(request));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Settlement>> getSettlementsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(settlementService.getSettlementsByEvent(eventId));
    }

    @GetMapping("/event/{eventId}/suggested")
    public ResponseEntity<List<SuggestedSettlementDTO>> getSuggestedSettlements(@PathVariable Long eventId) {
        return ResponseEntity.ok(settlementService.getSuggestedSettlements(eventId));
    }
}
