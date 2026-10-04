package com.bananaledger.dto;

import com.bananaledger.entity.enums.PaymentMethod;
import com.bananaledger.entity.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public class LedgerEntryDto {
    private LocalDate date;
    private String transactionId;
    private String type; // PURCHASE, PAYMENT, SALE, RECEIPT
    private String description;
    private Integer thars;
    private BigDecimal unitPrice;
    private BigDecimal debit;  // New charge / purchase amount
    private BigDecimal credit; // Payment / received amount
    private BigDecimal runningBalance;
    private PaymentStatus status;
    private PaymentMethod paymentMethod;
    private String notes;
    private java.time.LocalDateTime createdAt;

    public LedgerEntryDto() {}

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getThars() { return thars; }
    public void setThars(Integer thars) { this.thars = thars; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getDebit() { return debit; }
    public void setDebit(BigDecimal debit) { this.debit = debit; }

    public BigDecimal getCredit() { return credit; }
    public void setCredit(BigDecimal credit) { this.credit = credit; }

    public BigDecimal getRunningBalance() { return runningBalance; }
    public void setRunningBalance(BigDecimal runningBalance) { this.runningBalance = runningBalance; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
}
