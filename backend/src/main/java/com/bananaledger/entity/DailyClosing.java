package com.bananaledger.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_closings", indexes = {
    @Index(name = "idx_close_date", columnList = "closing_date", unique = true)
})
public class DailyClosing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "closing_date", unique = true, nullable = false)
    private LocalDate closingDate;

    @Column(name = "thars_purchased", nullable = false)
    private Integer tharsPurchased = 0;

    @Column(name = "thars_sold", nullable = false)
    private Integer tharsSold = 0;

    @Column(name = "closing_stock", nullable = false)
    private Integer closingStock = 0;

    @Column(name = "total_purchases", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPurchases = BigDecimal.ZERO;

    @Column(name = "total_sales", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalSales = BigDecimal.ZERO;

    @Column(name = "supplier_payments", nullable = false, precision = 12, scale = 2)
    private BigDecimal supplierPayments = BigDecimal.ZERO;

    @Column(name = "customer_payments", nullable = false, precision = 12, scale = 2)
    private BigDecimal customerPayments = BigDecimal.ZERO;

    @Column(name = "total_expenses", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalExpenses = BigDecimal.ZERO;

    @Column(name = "estimated_profit", nullable = false, precision = 12, scale = 2)
    private BigDecimal estimatedProfit = BigDecimal.ZERO;

    @Column(name = "cash_received", nullable = false, precision = 12, scale = 2)
    private BigDecimal cashReceived = BigDecimal.ZERO;

    @Column(name = "cash_paid", nullable = false, precision = 12, scale = 2)
    private BigDecimal cashPaid = BigDecimal.ZERO;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "confirmed_by", length = 100)
    private String confirmedBy;

    @PrePersist
    public void onCreate() {
        if (closedAt == null) {
            closedAt = LocalDateTime.now();
        }
    }

    public DailyClosing() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getClosingDate() { return closingDate; }
    public void setClosingDate(LocalDate closingDate) { this.closingDate = closingDate; }

    public Integer getTharsPurchased() { return tharsPurchased; }
    public void setTharsPurchased(Integer tharsPurchased) { this.tharsPurchased = tharsPurchased; }

    public Integer getTharsSold() { return tharsSold; }
    public void setTharsSold(Integer tharsSold) { this.tharsSold = tharsSold; }

    public Integer getClosingStock() { return closingStock; }
    public void setClosingStock(Integer closingStock) { this.closingStock = closingStock; }

    public BigDecimal getTotalPurchases() { return totalPurchases; }
    public void setTotalPurchases(BigDecimal totalPurchases) { this.totalPurchases = totalPurchases; }

    public BigDecimal getTotalSales() { return totalSales; }
    public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }

    public BigDecimal getSupplierPayments() { return supplierPayments; }
    public void setSupplierPayments(BigDecimal supplierPayments) { this.supplierPayments = supplierPayments; }

    public BigDecimal getCustomerPayments() { return customerPayments; }
    public void setCustomerPayments(BigDecimal customerPayments) { this.customerPayments = customerPayments; }

    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }

    public BigDecimal getEstimatedProfit() { return estimatedProfit; }
    public void setEstimatedProfit(BigDecimal estimatedProfit) { this.estimatedProfit = estimatedProfit; }

    public BigDecimal getCashReceived() { return cashReceived; }
    public void setCashReceived(BigDecimal cashReceived) { this.cashReceived = cashReceived; }

    public BigDecimal getCashPaid() { return cashPaid; }
    public void setCashPaid(BigDecimal cashPaid) { this.cashPaid = cashPaid; }

    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }

    public String getConfirmedBy() { return confirmedBy; }
    public void setConfirmedBy(String confirmedBy) { this.confirmedBy = confirmedBy; }
}
