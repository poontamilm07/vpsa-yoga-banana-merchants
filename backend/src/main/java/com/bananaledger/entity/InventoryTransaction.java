package com.bananaledger.entity;

import com.bananaledger.entity.enums.InventoryType;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions", indexes = {
    @Index(name = "idx_inv_date", columnList = "transaction_date"),
    @Index(name = "idx_inv_type", columnList = "type")
})
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InventoryType type;

    @Column(name = "thars_change", nullable = false)
    private Integer tharsChange;

    @Column(name = "resulting_stock", nullable = false)
    private Integer resultingStock;

    @Column(name = "reference_id", length = 50)
    private String referenceId; // e.g. PUR-20260923-0001 or SAL-20260923-0001

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public InventoryTransaction() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }

    public InventoryType getType() { return type; }
    public void setType(InventoryType type) { this.type = type; }

    public Integer getTharsChange() { return tharsChange; }
    public void setTharsChange(Integer tharsChange) { this.tharsChange = tharsChange; }

    public Integer getResultingStock() { return resultingStock; }
    public void setResultingStock(Integer resultingStock) { this.resultingStock = resultingStock; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
