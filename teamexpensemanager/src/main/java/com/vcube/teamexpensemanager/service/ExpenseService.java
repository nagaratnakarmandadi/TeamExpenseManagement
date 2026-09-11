package com.vcube.teamexpensemanager.service;

import java.util.List;

import com.vcube.teamexpensemanager.dto.ExpenseRequest;
import com.vcube.teamexpensemanager.entity.Expense;

public interface ExpenseService {

	public Expense createExpense(ExpenseRequest request);

	public List<Expense> getAllExpenses();

	public Expense getExpenseById(Long id);

	public List<Expense> getExpensesByEvent(Long eventId);

	public Expense updateExpense(Long id, ExpenseRequest request);

	public void deleteExpense(Long id);

}
