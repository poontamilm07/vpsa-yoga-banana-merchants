package com.bananaledger.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DailyReportDto {
    private LocalDate date;
    private long customerCount;
    private BigDecimal kgPurchased;
    private int tharsPurchased;
    private int tharsSold;
    private int closingStock;
    private BigDecimal purchaseValue;
    private BigDecimal salesValue;
    private BigDecimal supplierPayments;
    private BigDecimal customerReceived;
    private BigDecimal expenses;
    private BigDecimal estimatedProfit;

    public DailyReportDto() {}

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public long getCustomerCount() { return customerCount; }
    public void setCustomerCount(long customerCount) { this.customerCount = customerCount; }

    public BigDecimal getKgPurchased() { return kgPurchased; }
    public void setKgPurchased(BigDecimal kgPurchased) { this.kgPurchased = kgPurchased; }

    public int getTharsPurchased() { return tharsPurchased; }
    public void setTharsPurchased(int tharsPurchased) { this.tharsPurchased = tharsPurchased; }

    public int getTharsSold() { return tharsSold; }
    public void setTharsSold(int tharsSold) { this.tharsSold = tharsSold; }

    public int getClosingStock() { return closingStock; }
    public void setClosingStock(int closingStock) { this.closingStock = closingStock; }

    public BigDecimal getPurchaseValue() { return purchaseValue; }
    public void setPurchaseValue(BigDecimal purchaseValue) { this.purchaseValue = purchaseValue; }

    public BigDecimal getSalesValue() { return salesValue; }
    public void setSalesValue(BigDecimal salesValue) { this.salesValue = salesValue; }

    public BigDecimal getSupplierPayments() { return supplierPayments; }
    public void setSupplierPayments(BigDecimal supplierPayments) { this.supplierPayments = supplierPayments; }

    public BigDecimal getCustomerReceived() { return customerReceived; }
    public void setCustomerReceived(BigDecimal customerReceived) { this.customerReceived = customerReceived; }

    public BigDecimal getExpenses() { return expenses; }
    public void setExpenses(BigDecimal expenses) { this.expenses = expenses; }

    public BigDecimal getEstimatedProfit() { return estimatedProfit; }
    public void setEstimatedProfit(BigDecimal estimatedProfit) { this.estimatedProfit = estimatedProfit; }
}
