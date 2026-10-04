package com.bananaledger.service;

import com.bananaledger.dto.ExpenseRequest;
import com.bananaledger.entity.Expense;
import com.bananaledger.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final AuditService auditService;

    public ExpenseService(ExpenseRepository expenseRepository, AuditService auditService) {
        this.expenseRepository = expenseRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Expense createExpense(ExpenseRequest request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Expense amount must be greater than zero");
        }

        Expense expense = new Expense();
        expense.setExpenseCode(generateExpenseCode(request.getExpenseDate()));
        expense.setExpenseDate(request.getExpenseDate());
        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setReceiptUrl(request.getReceiptUrl());

        Expense saved = expenseRepository.save(expense);

        auditService.log("CREATE_EXPENSE", "EXPENSE", saved.getExpenseCode(), null,
                "Category: " + saved.getCategory() + ", Amount: ₹" + saved.getAmount());

        return saved;
    }

    public List<Expense> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByExpenseDateBetweenOrderByExpenseDateDescCreatedAtDesc(startDate, endDate);
    }

    private String generateExpenseCode(LocalDate date) {
        String dateStr = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = expenseRepository.count() + 1;
        return String.format("EXP-%s-%04d", dateStr, count);
    }
}
