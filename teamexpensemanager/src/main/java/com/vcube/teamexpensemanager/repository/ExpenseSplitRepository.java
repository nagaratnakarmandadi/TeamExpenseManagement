package com.vcube.teamexpensemanager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vcube.teamexpensemanager.entity.ExpenseSplit;

@Repository
public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {

    List<ExpenseSplit> findByExpenseId(Long expenseId);

    List<ExpenseSplit> findByUserId(Long userId);

    List<ExpenseSplit> findByExpenseEventId(Long eventId);
}
