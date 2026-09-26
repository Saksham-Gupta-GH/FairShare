package com.saksham.splitr.repository;

import com.saksham.splitr.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByPaidByEmailOrSplitWithEmailOrderByCreatedAtDesc(String paidByEmail, String splitWithEmail);
}
