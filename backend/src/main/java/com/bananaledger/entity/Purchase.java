package com.bananaledger.entity;

import com.bananaledger.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchases", indexes = {
    @Index(name = "idx_pur_date", columnList = "purchase_date"),
    @Index(name = "idx_pur_supplier", columnList = "supplier_id"),
    @Index(name = "idx_pur_status", columnList = "status"),
    @Index(name = "idx_pur_bill_no", columnList = "bill_number")
})
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", unique = true, nullable = false, length = 30)
    private String transactionId; // e.g. PUR-20260923-0001

    @Column(name = "bill_number", length = 50)
    private String billNumber; // e.g. 1568 or BILL-1568

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Column(nullable = true)
    private Integer thars;

    @Column(name = "price_per_thar", nullable = true, precision = 12, scale = 2)
    private BigDecimal pricePerThar;

    // KG-based Purchase fields
    @Column(name = "particulars", length = 255)
    private String particulars;

    @Column(name = "lot_number", length = 50)
    private String lotNumber;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "net_weight_kg", precision = 12, scale = 2)
    private BigDecimal netWeightKg;

    @Column(name = "ls_weight_kg", precision = 12, scale = 2)
    private BigDecimal lsWeightKg;

    @Column(name = "total_weight_kg", precision = 12, scale = 2)
    private BigDecimal totalWeightKg;

    @Column(name = "rate_per_kg", precision = 12, scale = 2)
    private BigDecimal ratePerKg;

    @Column(name = "gross_amount", precision = 12, scale = 2)
    private BigDecimal grossAmount;

    @Column(name = "discount_amount", precision = 12, scale = 2)
    private BigDecimal discountAmount;

    @Lob
    @Column(name = "items_json", columnDefinition = "LONGTEXT")
    private String itemsJson; // Multi-lot item JSON

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "paid_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal paidAmount;

    @Column(name = "balance_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal balanceAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Lob
    @Column(name = "attachment_url", columnDefinition = "LONGTEXT")
    private String attachmentUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Purchase() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getBillNumber() { return billNumber; }
    public void setBillNumber(String billNumber) { this.billNumber = billNumber; }

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }

    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }

    public Integer getThars() { return thars; }
    public void setThars(Integer thars) { this.thars = thars; }

    public BigDecimal getPricePerThar() { return pricePerThar; }
    public void setPricePerThar(BigDecimal pricePerThar) { this.pricePerThar = pricePerThar; }

    public String getParticulars() { return particulars; }
    public void setParticulars(String particulars) { this.particulars = particulars; }

    public String getLotNumber() { return lotNumber; }
    public void setLotNumber(String lotNumber) { this.lotNumber = lotNumber; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getNetWeightKg() { return netWeightKg; }
    public void setNetWeightKg(BigDecimal netWeightKg) { this.netWeightKg = netWeightKg; }

    public BigDecimal getLsWeightKg() { return lsWeightKg; }
    public void setLsWeightKg(BigDecimal lsWeightKg) { this.lsWeightKg = lsWeightKg; }

    public BigDecimal getTotalWeightKg() { return totalWeightKg; }
    public void setTotalWeightKg(BigDecimal totalWeightKg) { this.totalWeightKg = totalWeightKg; }

    public BigDecimal getRatePerKg() { return ratePerKg; }
    public void setRatePerKg(BigDecimal ratePerKg) { this.ratePerKg = ratePerKg; }

    public BigDecimal getGrossAmount() { return grossAmount; }
    public void setGrossAmount(BigDecimal grossAmount) { this.grossAmount = grossAmount; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public String getItemsJson() { return itemsJson; }
    public void setItemsJson(String itemsJson) { this.itemsJson = itemsJson; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }

    public BigDecimal getBalanceAmount() { return balanceAmount; }
    public void setBalanceAmount(BigDecimal balanceAmount) { this.balanceAmount = balanceAmount; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
