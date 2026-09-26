package com.saksham.splitr.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.saksham.splitr.model.Expense;
import com.saksham.splitr.model.User;
import com.saksham.splitr.repository.ExpenseRepository;
import com.saksham.splitr.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        expenseRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void addExpense_Success() throws Exception {
        Expense expense = new Expense();
        expense.setTitle("Dinner");
        expense.setAmount(1000.0);
        expense.setPaidByEmail("alice@example.com");
        expense.setSplitWithEmail("bob@example.com");

        mockMvc.perform(post("/api/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(expense)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Dinner")))
                .andExpect(jsonPath("$.amount", is(1000.0)));
    }

    @Test
    void addExpense_MissingSplitWith_ReturnsBadRequest() throws Exception {
        Expense expense = new Expense();
        expense.setTitle("Rent");
        expense.setAmount(5000.0);
        expense.setPaidByEmail("alice@example.com");
        // splitWithEmail intentionally omitted

        mockMvc.perform(post("/api/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(expense)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getExpenses_ReturnsCorrectExpenses() throws Exception {
        Expense e1 = new Expense();
        e1.setTitle("Netflix");
        e1.setAmount(500.0);
        e1.setPaidByEmail("alice@example.com");
        e1.setSplitWithEmail("bob@example.com");
        expenseRepository.save(e1);

        Expense e2 = new Expense();
        e2.setTitle("Groceries");
        e2.setAmount(800.0);
        e2.setPaidByEmail("charlie@example.com");
        e2.setSplitWithEmail("alice@example.com");
        expenseRepository.save(e2);

        // alice should see both expenses
        mockMvc.perform(get("/api/expenses/alice@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }
}
