package com.vcube.teamexpensemanager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vcube.teamexpensemanager.entity.Expense;

public interface ExpenseRepository extends JpaRepository<Expense, Long> { 
	
	List<Expense> findByEventId(Long eventId);

}
