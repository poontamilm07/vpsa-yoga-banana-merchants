package com.bananaledger.dto;

import com.bananaledger.entity.Purchase;
import com.bananaledger.entity.Sale;
import com.bananaledger.entity.SupplierPayment;

import java.math.BigDecimal;
import java.util.List;

public class DashboardDto {
    // Today metrics
    private long todayCustomersCount;
    private BigDecimal todayKgPurchased;
    private int todayTharsPurchased;
    private int todayTharsSold;
    private int currentStock;
    private BigDecimal todayPurchaseValue;
    private BigDecimal todaySalesValue;
    private BigDecimal totalSupplierPayable;
    private BigDecimal totalCustomerReceivable;
    private BigDecimal todayExpenses;
    private BigDecimal todayEstimatedProfit;

    // Warning flags
    private boolean lowStockWarning;

    // Recent lists
    private List<Purchase> recentPurchases;
    private List<Sale> recentSales;
    private List<SupplierPayment> recentPayments;
    private List<SupplierSummaryDto> topOutstandingSuppliers;
    private List<CustomerSummaryDto> topOutstandingCustomers;

    public DashboardDto() {}

    public long getTodayCustomersCount() { return todayCustomersCount; }
    public void setTodayCustomersCount(long todayCustomersCount) { this.todayCustomersCount = todayCustomersCount; }

    public BigDecimal getTodayKgPurchased() { return todayKgPurchased; }
    public void setTodayKgPurchased(BigDecimal todayKgPurchased) { this.todayKgPurchased = todayKgPurchased; }

    public int getTodayTharsPurchased() { return todayTharsPurchased; }
    public void setTodayTharsPurchased(int todayTharsPurchased) { this.todayTharsPurchased = todayTharsPurchased; }

    public int getTodayTharsSold() { return todayTharsSold; }
    public void setTodayTharsSold(int todayTharsSold) { this.todayTharsSold = todayTharsSold; }

    public int getCurrentStock() { return currentStock; }
    public void setCurrentStock(int currentStock) { this.currentStock = currentStock; }

    public BigDecimal getTodayPurchaseValue() { return todayPurchaseValue; }
    public void setTodayPurchaseValue(BigDecimal todayPurchaseValue) { this.todayPurchaseValue = todayPurchaseValue; }

    public BigDecimal getTodaySalesValue() { return todaySalesValue; }
    public void setTodaySalesValue(BigDecimal todaySalesValue) { this.todaySalesValue = todaySalesValue; }

    public BigDecimal getTotalSupplierPayable() { return totalSupplierPayable; }
    public void setTotalSupplierPayable(BigDecimal totalSupplierPayable) { this.totalSupplierPayable = totalSupplierPayable; }

    public BigDecimal getTotalCustomerReceivable() { return totalCustomerReceivable; }
    public void setTotalCustomerReceivable(BigDecimal totalCustomerReceivable) { this.totalCustomerReceivable = totalCustomerReceivable; }

    public BigDecimal getTodayExpenses() { return todayExpenses; }
    public void setTodayExpenses(BigDecimal todayExpenses) { this.todayExpenses = todayExpenses; }

    public BigDecimal getTodayEstimatedProfit() { return todayEstimatedProfit; }
    public void setTodayEstimatedProfit(BigDecimal todayEstimatedProfit) { this.todayEstimatedProfit = todayEstimatedProfit; }

    public boolean isLowStockWarning() { return lowStockWarning; }
    public void setLowStockWarning(boolean lowStockWarning) { this.lowStockWarning = lowStockWarning; }

    public List<Purchase> getRecentPurchases() { return recentPurchases; }
    public void setRecentPurchases(List<Purchase> recentPurchases) { this.recentPurchases = recentPurchases; }

    public List<Sale> getRecentSales() { return recentSales; }
    public void setRecentSales(List<Sale> recentSales) { this.recentSales = recentSales; }

    public List<SupplierPayment> getRecentPayments() { return recentPayments; }
    public void setRecentPayments(List<SupplierPayment> recentPayments) { this.recentPayments = recentPayments; }

    public List<SupplierSummaryDto> getTopOutstandingSuppliers() { return topOutstandingSuppliers; }
    public void setTopOutstandingSuppliers(List<SupplierSummaryDto> topOutstandingSuppliers) { this.topOutstandingSuppliers = topOutstandingSuppliers; }

    public List<CustomerSummaryDto> getTopOutstandingCustomers() { return topOutstandingCustomers; }
    public void setTopOutstandingCustomers(List<CustomerSummaryDto> topOutstandingCustomers) { this.topOutstandingCustomers = topOutstandingCustomers; }
}
