package com.vcube.teamexpensemanager.serviceImpl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vcube.teamexpensemanager.dto.ExpenseRequest;
import com.vcube.teamexpensemanager.dto.ExpenseSplitRequest;
import com.vcube.teamexpensemanager.entity.Event;
import com.vcube.teamexpensemanager.entity.Expense;
import com.vcube.teamexpensemanager.entity.ExpenseSplit;
import com.vcube.teamexpensemanager.entity.SplitType;
import com.vcube.teamexpensemanager.entity.User;
import com.vcube.teamexpensemanager.exceptions.BadRequestException;
import com.vcube.teamexpensemanager.exceptions.ResourceNotFoundException;
import com.vcube.teamexpensemanager.repository.EventRepository;
import com.vcube.teamexpensemanager.repository.ExpenseRepository;
import com.vcube.teamexpensemanager.repository.UserRepository;
import com.vcube.teamexpensemanager.service.ExpenseService;

@Service
@Transactional
public class ExpenseServiceImpl implements ExpenseService {

	@Autowired
	private ExpenseRepository expenseRepository;

	@Autowired
	private EventRepository eventRepository;

	@Autowired
	private UserRepository userRepository;

	@Override
	public Expense createExpense(ExpenseRequest request) {
		Event event = eventRepository.findById(request.eventId())
				.orElseThrow(() -> new ResourceNotFoundException("Event with ID " + request.eventId() + " not found"));

		User paidByUser = userRepository.findById(request.userId())
				.orElseThrow(() -> new ResourceNotFoundException("User with ID " + request.userId() + " not found"));

		Expense expense = new Expense();
		expense.setDescription(request.description());
		expense.setAmount(request.amount().setScale(2, RoundingMode.HALF_UP));
		expense.setCategory(request.category());
		expense.setExpenseDate(request.expenseDate());
		expense.setEvent(event);
		expense.setPaidBy(paidByUser);

		SplitType splitType = request.splitType() != null ? request.splitType() : SplitType.EQUAL;
		expense.setSplitType(splitType);

		applySplits(expense, event, paidByUser, splitType, request.splits());

		return expenseRepository.save(expense);
	}

	@Override
	@Transactional(readOnly = true)
	public List<Expense> getAllExpenses() {
		return expenseRepository.findAll();
	}

	@Override
	@Transactional(readOnly = true)
	public Expense getExpenseById(Long id) {
		return expenseRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Expense with ID " + id + " not found"));
	}

	@Override
	@Transactional(readOnly = true)
	public List<Expense> getExpensesByEvent(Long eventId) {
		if (!eventRepository.existsById(eventId)) {
			throw new ResourceNotFoundException("Event with ID " + eventId + " not found");
		}
		return expenseRepository.findByEventId(eventId);
	}

	@Override
	public Expense updateExpense(Long id, ExpenseRequest request) {
		Expense expense = getExpenseById(id);

		Event event = eventRepository.findById(request.eventId())
				.orElseThrow(() -> new ResourceNotFoundException("Event with ID " + request.eventId() + " not found"));

		User paidByUser = userRepository.findById(request.userId())
				.orElseThrow(() -> new ResourceNotFoundException("User with ID " + request.userId() + " not found"));

		expense.setDescription(request.description());
		expense.setAmount(request.amount().setScale(2, RoundingMode.HALF_UP));
		expense.setCategory(request.category());
		expense.setExpenseDate(request.expenseDate());
		expense.setEvent(event);
		expense.setPaidBy(paidByUser);

		SplitType splitType = request.splitType() != null ? request.splitType() : SplitType.EQUAL;
		expense.setSplitType(splitType);

		// Clear existing splits and apply new ones
		expense.clearSplits();
		applySplits(expense, event, paidByUser, splitType, request.splits());

		return expenseRepository.save(expense);
	}

	@Override
	public void deleteExpense(Long id) {
		Expense expense = getExpenseById(id);
		expenseRepository.delete(expense);
	}

	private void applySplits(Expense expense, Event event, User paidByUser, SplitType splitType, List<ExpenseSplitRequest> splitRequests) {
		BigDecimal totalAmount = expense.getAmount();

		if (splitRequests == null || splitRequests.isEmpty()) {
			// Default equal split among all event members
			Set<User> members = event.getMembers();
			List<User> targetUsers = new ArrayList<>();
			if (members != null && !members.isEmpty()) {
				targetUsers.addAll(members);
			} else {
				targetUsers.add(paidByUser);
			}

			int count = targetUsers.size();
			BigDecimal countBd = new BigDecimal(count);
			BigDecimal baseAmount = totalAmount.divide(countBd, 2, RoundingMode.FLOOR);
			BigDecimal remainder = totalAmount.subtract(baseAmount.multiply(countBd));
			BigDecimal pct = new BigDecimal("100.00").divide(countBd, 2, RoundingMode.HALF_UP);

			for (int i = 0; i < count; i++) {
				User u = targetUsers.get(i);
				BigDecimal allocated = (i == 0) ? baseAmount.add(remainder) : baseAmount;
				ExpenseSplit split = new ExpenseSplit();
				split.setUser(u);
				split.setAllocatedAmount(allocated);
				split.setPercentage(pct);
				split.setSplitType(SplitType.EQUAL);
				expense.addSplit(split);
			}
			return;
		}

		// Custom splits specified
		if (splitType == SplitType.EQUAL) {
			int count = splitRequests.size();
			if (count == 0) {
				throw new BadRequestException("At least one participant must be selected for equal split");
			}
			BigDecimal countBd = new BigDecimal(count);
			BigDecimal baseAmount = totalAmount.divide(countBd, 2, RoundingMode.FLOOR);
			BigDecimal remainder = totalAmount.subtract(baseAmount.multiply(countBd));
			BigDecimal pct = new BigDecimal("100.00").divide(countBd, 2, RoundingMode.HALF_UP);

			for (int i = 0; i < count; i++) {
				ExpenseSplitRequest sr = splitRequests.get(i);
				User user = userRepository.findById(sr.userId())
						.orElseThrow(() -> new ResourceNotFoundException("User with ID " + sr.userId() + " not found"));
				BigDecimal allocated = (i == 0) ? baseAmount.add(remainder) : baseAmount;

				ExpenseSplit split = new ExpenseSplit();
				split.setUser(user);
				split.setAllocatedAmount(allocated);
				split.setPercentage(pct);
				split.setSplitType(SplitType.EQUAL);
				expense.addSplit(split);
			}
		} else if (splitType == SplitType.EXACT) {
			BigDecimal sumAllocated = BigDecimal.ZERO;
			List<ExpenseSplit> createdSplits = new ArrayList<>();

			for (ExpenseSplitRequest sr : splitRequests) {
				if (sr.allocatedAmount() == null || sr.allocatedAmount().compareTo(BigDecimal.ZERO) < 0) {
					throw new BadRequestException("Allocated amount for each participant must be non-negative");
				}
				User user = userRepository.findById(sr.userId())
						.orElseThrow(() -> new ResourceNotFoundException("User with ID " + sr.userId() + " not found"));

				BigDecimal allocated = sr.allocatedAmount().setScale(2, RoundingMode.HALF_UP);
				sumAllocated = sumAllocated.add(allocated);

				BigDecimal pct = totalAmount.compareTo(BigDecimal.ZERO) > 0
						? allocated.multiply(new BigDecimal("100")).divide(totalAmount, 2, RoundingMode.HALF_UP)
						: BigDecimal.ZERO;

				ExpenseSplit split = new ExpenseSplit();
				split.setUser(user);
				split.setAllocatedAmount(allocated);
				split.setPercentage(pct);
				split.setSplitType(SplitType.EXACT);
				createdSplits.add(split);
			}

			if (sumAllocated.compareTo(totalAmount) != 0) {
				throw new BadRequestException("Sum of split amounts (" + sumAllocated + ") must match total expense amount (" + totalAmount + ")");
			}

			createdSplits.forEach(expense::addSplit);

		} else if (splitType == SplitType.PERCENTAGE) {
			BigDecimal sumPct = BigDecimal.ZERO;
			for (ExpenseSplitRequest sr : splitRequests) {
				if (sr.percentage() == null || sr.percentage().compareTo(BigDecimal.ZERO) < 0) {
					throw new BadRequestException("Percentage for each participant must be non-negative");
				}
				sumPct = sumPct.add(sr.percentage());
			}

			// Validate percentage sum is 100%
			if (sumPct.setScale(1, RoundingMode.HALF_UP).compareTo(new BigDecimal("100.0")) != 0) {
				throw new BadRequestException("Sum of split percentages (" + sumPct + "%) must equal 100%");
			}

			BigDecimal sumCalculated = BigDecimal.ZERO;
			List<ExpenseSplit> createdSplits = new ArrayList<>();

			for (ExpenseSplitRequest sr : splitRequests) {
				User user = userRepository.findById(sr.userId())
						.orElseThrow(() -> new ResourceNotFoundException("User with ID " + sr.userId() + " not found"));

				BigDecimal calculated = totalAmount.multiply(sr.percentage()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
				sumCalculated = sumCalculated.add(calculated);

				ExpenseSplit split = new ExpenseSplit();
				split.setUser(user);
				split.setAllocatedAmount(calculated);
				split.setPercentage(sr.percentage().setScale(2, RoundingMode.HALF_UP));
				split.setSplitType(SplitType.PERCENTAGE);
				createdSplits.add(split);
			}

			// Adjust penny difference on first split
			BigDecimal diff = totalAmount.subtract(sumCalculated);
			if (diff.compareTo(BigDecimal.ZERO) != 0 && !createdSplits.isEmpty()) {
				ExpenseSplit first = createdSplits.get(0);
				first.setAllocatedAmount(first.getAllocatedAmount().add(diff));
			}

			createdSplits.forEach(expense::addSplit);
		}
	}
}
