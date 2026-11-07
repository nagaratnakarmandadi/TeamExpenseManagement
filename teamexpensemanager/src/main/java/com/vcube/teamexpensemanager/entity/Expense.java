package com.vcube.teamexpensemanager.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "expenses71")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String description;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal amount;

	@Column(nullable = false)
	private String category;

	@Column(nullable = false)
	private LocalDate expenseDate;

	@Enumerated(EnumType.STRING)
	@Column(name = "split_type")
	private SplitType splitType = SplitType.EQUAL;

	@ManyToOne
	@JoinColumn(name = "event_id", nullable = false)
	private Event event;

	@ManyToOne
	@JoinColumn(name = "paid_by", nullable = false)
	private User paidBy;

	@OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
	private List<ExpenseSplit> splits = new ArrayList<>();

	public void addSplit(ExpenseSplit split) {
		splits.add(split);
		split.setExpense(this);
	}

	public void clearSplits() {
		splits.clear();
	}
}
