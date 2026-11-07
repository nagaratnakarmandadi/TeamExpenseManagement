package com.vcube.teamexpensemanager.serviceImpl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vcube.teamexpensemanager.dto.MemberBalanceDTO;
import com.vcube.teamexpensemanager.dto.SettlementRequest;
import com.vcube.teamexpensemanager.dto.SuggestedSettlementDTO;
import com.vcube.teamexpensemanager.entity.Event;
import com.vcube.teamexpensemanager.entity.Settlement;
import com.vcube.teamexpensemanager.entity.User;
import com.vcube.teamexpensemanager.exceptions.BadRequestException;
import com.vcube.teamexpensemanager.exceptions.ResourceNotFoundException;
import com.vcube.teamexpensemanager.repository.EventRepository;
import com.vcube.teamexpensemanager.repository.SettlementRepository;
import com.vcube.teamexpensemanager.repository.UserRepository;
import com.vcube.teamexpensemanager.service.BalanceService;
import com.vcube.teamexpensemanager.service.SettlementService;

@Service
@Transactional
public class SettlementServiceImpl implements SettlementService {

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BalanceService balanceService;

    @Override
    public Settlement recordSettlement(SettlementRequest request) {
        if (request.payerId().equals(request.payeeId())) {
            throw new BadRequestException("Payer and Payee cannot be the same person");
        }

        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event with ID " + request.eventId() + " not found"));

        User payer = userRepository.findById(request.payerId())
                .orElseThrow(() -> new ResourceNotFoundException("Payer with ID " + request.payerId() + " not found"));

        User payee = userRepository.findById(request.payeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Payee with ID " + request.payeeId() + " not found"));

        Settlement settlement = new Settlement();
        settlement.setEvent(event);
        settlement.setPayer(payer);
        settlement.setPayee(payee);
        settlement.setAmount(request.amount().setScale(2, RoundingMode.HALF_UP));
        settlement.setPaymentMethod(request.paymentMethod());
        settlement.setTransactionRef(request.transactionRef());
        settlement.setNotes(request.notes());
        settlement.setSettledAt(LocalDateTime.now());

        return settlementRepository.save(settlement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Settlement> getSettlementsByEvent(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException("Event with ID " + eventId + " not found");
        }
        return settlementRepository.findByEventId(eventId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SuggestedSettlementDTO> getSuggestedSettlements(Long eventId) {
        List<MemberBalanceDTO> balances = balanceService.calculateEventBalances(eventId);

        // Internal mutable container for the debt simplification algorithm
        class BalanceNode {
            final Long userId;
            final String userName;
            BigDecimal amount;

            BalanceNode(Long userId, String userName, BigDecimal amount) {
                this.userId = userId;
                this.userName = userName;
                this.amount = amount;
            }
        }

        List<BalanceNode> debtors = new ArrayList<>();
        List<BalanceNode> creditors = new ArrayList<>();

        for (MemberBalanceDTO b : balances) {
            if (b.netBalance().compareTo(new BigDecimal("-0.01")) < 0) {
                debtors.add(new BalanceNode(b.userId(), b.userName(), b.netBalance().abs()));
            } else if (b.netBalance().compareTo(new BigDecimal("0.01")) > 0) {
                creditors.add(new BalanceNode(b.userId(), b.userName(), b.netBalance()));
            }
        }

        List<SuggestedSettlementDTO> suggestions = new ArrayList<>();

        int i = 0; // debtor index
        int j = 0; // creditor index

        while (i < debtors.size() && j < creditors.size()) {
            BalanceNode debtor = debtors.get(i);
            BalanceNode creditor = creditors.get(j);

            BigDecimal settleAmount = debtor.amount.min(creditor.amount).setScale(2, RoundingMode.HALF_UP);

            if (settleAmount.compareTo(new BigDecimal("0.00")) > 0) {
                suggestions.add(new SuggestedSettlementDTO(
                        debtor.userId,
                        debtor.userName,
                        creditor.userId,
                        creditor.userName,
                        settleAmount
                ));
            }

            debtor.amount = debtor.amount.subtract(settleAmount);
            creditor.amount = creditor.amount.subtract(settleAmount);

            if (debtor.amount.compareTo(new BigDecimal("0.005")) <= 0) {
                i++;
            }
            if (creditor.amount.compareTo(new BigDecimal("0.005")) <= 0) {
                j++;
            }
        }

        return suggestions;
    }
}
