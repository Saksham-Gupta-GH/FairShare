package com.saksham.splitr.controller;

import com.saksham.splitr.model.Expense;
import com.saksham.splitr.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {
    
    @Autowired 
    private ExpenseRepository expenseRepository;

    @PostMapping
    public ResponseEntity<?> addExpense(@RequestBody Expense expense) {
        if (expense.getSplitWithEmail() == null || expense.getSplitWithEmail().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Must specify who to split with (email)"));
        }
        Expense saved = expenseRepository.save(expense);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{email}")
    public ResponseEntity<List<Expense>> getExpenses(@PathVariable String email) {
        List<Expense> expenses = expenseRepository.findByPaidByEmailOrSplitWithEmailOrderByCreatedAtDesc(email, email);
        return ResponseEntity.ok(expenses);
    }
}
