package com.bananaledger.dto;

import com.bananaledger.entity.enums.InventoryType;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class StockAdjustmentRequest {

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    @NotNull(message = "Adjustment type is required (DAMAGE or ADJUSTMENT)")
    private InventoryType type;

    @NotNull(message = "Thars change is required (positive for add, negative for remove)")
    private Integer tharsChange;

    private String notes;

    public StockAdjustmentRequest() {}

    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }

    public InventoryType getType() { return type; }
    public void setType(InventoryType type) { this.type = type; }

    public Integer getTharsChange() { return tharsChange; }
    public void setTharsChange(Integer tharsChange) { this.tharsChange = tharsChange; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
