package com.vcube.teamexpensemanager.serviceImpl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vcube.teamexpensemanager.dto.MemberBalanceDTO;
import com.vcube.teamexpensemanager.entity.Event;
import com.vcube.teamexpensemanager.entity.Expense;
import com.vcube.teamexpensemanager.entity.ExpenseSplit;
import com.vcube.teamexpensemanager.entity.Settlement;
import com.vcube.teamexpensemanager.entity.User;
import com.vcube.teamexpensemanager.exceptions.ResourceNotFoundException;
import com.vcube.teamexpensemanager.repository.EventRepository;
import com.vcube.teamexpensemanager.repository.ExpenseRepository;
import com.vcube.teamexpensemanager.repository.SettlementRepository;
import com.vcube.teamexpensemanager.service.BalanceService;

@Service
@Transactional(readOnly = true)
public class BalanceServiceImpl implements BalanceService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Override
    public List<MemberBalanceDTO> calculateEventBalances(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event with ID " + eventId + " not found"));

        Map<Long, User> userMap = new LinkedHashMap<>();
        if (event.getMembers() != null) {
            for (User u : event.getMembers()) {
                userMap.put(u.getId(), u);
            }
        }

        Map<Long, BigDecimal> paidMap = new HashMap<>();
        Map<Long, BigDecimal> owedMap = new HashMap<>();

        // Process all expenses for this event
        List<Expense> expenses = expenseRepository.findByEventId(eventId);
        for (Expense exp : expenses) {
            User payer = exp.getPaidBy();
            if (payer != null) {
                userMap.putIfAbsent(payer.getId(), payer);
                paidMap.put(payer.getId(), paidMap.getOrDefault(payer.getId(), BigDecimal.ZERO).add(exp.getAmount()));
            }

            if (exp.getSplits() != null) {
                for (ExpenseSplit split : exp.getSplits()) {
                    User splitUser = split.getUser();
                    if (splitUser != null) {
                        userMap.putIfAbsent(splitUser.getId(), splitUser);
                        owedMap.put(splitUser.getId(),
                                owedMap.getOrDefault(splitUser.getId(), BigDecimal.ZERO).add(split.getAllocatedAmount()));
                    }
                }
            }
        }

        // Process all settlements for this event
        List<Settlement> settlements = settlementRepository.findByEventId(eventId);
        for (Settlement s : settlements) {
            User payer = s.getPayer();
            User payee = s.getPayee();

            if (payer != null) {
                userMap.putIfAbsent(payer.getId(), payer);
                // Payer gave money, so they get credit (like paying an expense)
                paidMap.put(payer.getId(), paidMap.getOrDefault(payer.getId(), BigDecimal.ZERO).add(s.getAmount()));
            }
            if (payee != null) {
                userMap.putIfAbsent(payee.getId(), payee);
                // Payee received money to settle their credit, so their owed amount increases
                owedMap.put(payee.getId(), owedMap.getOrDefault(payee.getId(), BigDecimal.ZERO).add(s.getAmount()));
            }
        }

        List<MemberBalanceDTO> results = new ArrayList<>();
        for (User u : userMap.values()) {
            BigDecimal totalPaid = paidMap.getOrDefault(u.getId(), BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalOwed = owedMap.getOrDefault(u.getId(), BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            BigDecimal netBalance = totalPaid.subtract(totalOwed).setScale(2, RoundingMode.HALF_UP);

            String status;
            if (netBalance.compareTo(new BigDecimal("0.01")) > 0) {
                status = "OWED_MONEY";
            } else if (netBalance.compareTo(new BigDecimal("-0.01")) < 0) {
                status = "IN_DEBT";
            } else {
                status = "SETTLED";
            }

            results.add(new MemberBalanceDTO(
                    u.getId(),
                    u.getName(),
                    u.getEmail(),
                    totalPaid,
                    totalOwed,
                    netBalance,
                    status
            ));
        }

        return results;
    }
}
