package com.bananaledger.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class MonthlyReportDto {
    private String yearMonth; // e.g. 2026-09
    private int totalTharsPurchased;
    private int totalTharsSold;
    private BigDecimal totalPurchases;
    private BigDecimal totalSales;
    private BigDecimal totalExpenses;
    private BigDecimal supplierOutstanding;
    private BigDecimal customerOutstanding;
    private BigDecimal estimatedProfit;
    private BigDecimal avgPurchasePrice;
    private BigDecimal avgSellingPrice;

    // Charts data
    private List<Map<String, Object>> dailySalesData;
    private List<Map<String, Object>> dailyProfitData;
    private List<Map<String, Object>> stockMovementData;

    public MonthlyReportDto() {}

    public String getYearMonth() { return yearMonth; }
    public void setYearMonth(String yearMonth) { this.yearMonth = yearMonth; }

    public int getTotalTharsPurchased() { return totalTharsPurchased; }
    public void setTotalTharsPurchased(int totalTharsPurchased) { this.totalTharsPurchased = totalTharsPurchased; }

    public int getTotalTharsSold() { return totalTharsSold; }
    public void setTotalTharsSold(int totalTharsSold) { this.totalTharsSold = totalTharsSold; }

    public BigDecimal getTotalPurchases() { return totalPurchases; }
    public void setTotalPurchases(BigDecimal totalPurchases) { this.totalPurchases = totalPurchases; }

    public BigDecimal getTotalSales() { return totalSales; }
    public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }

    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }

    public BigDecimal getSupplierOutstanding() { return supplierOutstanding; }
    public void setSupplierOutstanding(BigDecimal supplierOutstanding) { this.supplierOutstanding = supplierOutstanding; }

    public BigDecimal getCustomerOutstanding() { return customerOutstanding; }
    public void setCustomerOutstanding(BigDecimal customerOutstanding) { this.customerOutstanding = customerOutstanding; }

    public BigDecimal getEstimatedProfit() { return estimatedProfit; }
    public void setEstimatedProfit(BigDecimal estimatedProfit) { this.estimatedProfit = estimatedProfit; }

    public BigDecimal getAvgPurchasePrice() { return avgPurchasePrice; }
    public void setAvgPurchasePrice(BigDecimal avgPurchasePrice) { this.avgPurchasePrice = avgPurchasePrice; }

    public BigDecimal getAvgSellingPrice() { return avgSellingPrice; }
    public void setAvgSellingPrice(BigDecimal avgSellingPrice) { this.avgSellingPrice = avgSellingPrice; }

    public List<Map<String, Object>> getDailySalesData() { return dailySalesData; }
    public void setDailySalesData(List<Map<String, Object>> dailySalesData) { this.dailySalesData = dailySalesData; }

    public List<Map<String, Object>> getDailyProfitData() { return dailyProfitData; }
    public void setDailyProfitData(List<Map<String, Object>> dailyProfitData) { this.dailyProfitData = dailyProfitData; }

    public List<Map<String, Object>> getStockMovementData() { return stockMovementData; }
    public void setStockMovementData(List<Map<String, Object>> stockMovementData) { this.stockMovementData = stockMovementData; }
}
