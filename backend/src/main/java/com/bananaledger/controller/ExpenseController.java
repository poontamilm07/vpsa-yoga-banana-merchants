package com.bananaledger.controller;

import com.bananaledger.dto.ApiResponse;
import com.bananaledger.dto.ExpenseRequest;
import com.bananaledger.entity.Expense;
import com.bananaledger.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Expense>> createExpense(@Valid @RequestBody ExpenseRequest request) {
        Expense expense = expenseService.createExpense(request);
        return ResponseEntity.ok(ApiResponse.ok("Expense recorded successfully", expense));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Expense>>> getExpenses(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) startDate = LocalDate.now().minusDays(30);
        if (endDate == null) endDate = LocalDate.now();

        List<Expense> expenses = expenseService.getExpensesByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(expenses));
    }
}
