package com.bananaledger.service;

import com.bananaledger.dto.DailyReportDto;
import com.bananaledger.dto.DashboardDto;
import com.bananaledger.dto.MonthlyReportDto;
import com.bananaledger.dto.SupplierSummaryDto;
import com.bananaledger.dto.CustomerSummaryDto;
import com.bananaledger.entity.Purchase;
import com.bananaledger.entity.Sale;
import com.bananaledger.entity.SupplierPayment;
import com.bananaledger.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final PurchaseRepository purchaseRepository;
    private final SaleRepository saleRepository;
    private final SupplierPaymentRepository supplierPaymentRepository;
    private final CustomerPaymentRepository customerPaymentRepository;
    private final ExpenseRepository expenseRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final SupplierService supplierService;
    private final CustomerService customerService;
    private final DailyClosingService dailyClosingService;

    public ReportService(PurchaseRepository purchaseRepository,
                          SaleRepository saleRepository,
                          SupplierPaymentRepository supplierPaymentRepository,
                          CustomerPaymentRepository customerPaymentRepository,
                          ExpenseRepository expenseRepository,
                          InventoryTransactionRepository inventoryTransactionRepository,
                          SupplierService supplierService,
                          CustomerService customerService,
                          DailyClosingService dailyClosingService) {
        this.purchaseRepository = purchaseRepository;
        this.saleRepository = saleRepository;
        this.supplierPaymentRepository = supplierPaymentRepository;
        this.customerPaymentRepository = customerPaymentRepository;
        this.expenseRepository = expenseRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.supplierService = supplierService;
        this.customerService = customerService;
        this.dailyClosingService = dailyClosingService;
    }

    public DashboardDto getDashboard() {
        LocalDate today = LocalDate.now();
        DailyReportDto todaySummary = dailyClosingService.getDailySummary(today);

        // Overall totals across all suppliers and customers
        List<SupplierSummaryDto> allSuppliers = supplierService.getAllSuppliers(null);
        BigDecimal totalSupplierPayable = allSuppliers.stream()
                .map(SupplierSummaryDto::getOutstandingBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CustomerSummaryDto> allCustomers = customerService.getAllCustomers(null);
        BigDecimal totalCustomerReceivable = allCustomers.stream()
                .map(CustomerSummaryDto::getOutstandingBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Recent purchases, sales, payments
        List<Purchase> recentPurchases = purchaseRepository.findByPurchaseDateBetweenOrderByPurchaseDateDescCreatedAtDesc(today.minusDays(7), today);
        if (recentPurchases.size() > 5) recentPurchases = recentPurchases.subList(0, 5);

        List<Sale> recentSales = saleRepository.findBySaleDateBetweenOrderBySaleDateDescCreatedAtDesc(today.minusDays(7), today);
        if (recentSales.size() > 5) recentSales = recentSales.subList(0, 5);

        List<SupplierPayment> recentPayments = supplierPaymentRepository.findByPaymentDateBetweenOrderByPaymentDateDescCreatedAtDesc(today.minusDays(7), today);
        if (recentPayments.size() > 5) recentPayments = recentPayments.subList(0, 5);

        // Top outstanding lists
        List<SupplierSummaryDto> topSuppliers = allSuppliers.stream()
                .filter(s -> s.getOutstandingBalance().compareTo(BigDecimal.ZERO) > 0)
                .sorted(Comparator.comparing(SupplierSummaryDto::getOutstandingBalance).reversed())
                .limit(5)
                .collect(Collectors.toList());

        List<CustomerSummaryDto> topCustomers = allCustomers.stream()
                .filter(c -> c.getOutstandingBalance().compareTo(BigDecimal.ZERO) > 0)
                .sorted(Comparator.comparing(CustomerSummaryDto::getOutstandingBalance).reversed())
                .limit(5)
                .collect(Collectors.toList());

        DashboardDto dto = new DashboardDto();
        dto.setTodayCustomersCount(todaySummary.getCustomerCount());
        dto.setTodayTharsPurchased(todaySummary.getTharsPurchased());
        dto.setTodayTharsSold(todaySummary.getTharsSold());
        dto.setCurrentStock(todaySummary.getClosingStock());
        dto.setTodayPurchaseValue(todaySummary.getPurchaseValue());
        dto.setTodaySalesValue(todaySummary.getSalesValue());
        dto.setTotalSupplierPayable(totalSupplierPayable);
        dto.setTotalCustomerReceivable(totalCustomerReceivable);
        dto.setTodayExpenses(todaySummary.getExpenses());
        dto.setTodayEstimatedProfit(todaySummary.getEstimatedProfit());
        dto.setLowStockWarning(todaySummary.getClosingStock() < 20); // Low stock if < 20 Thars
        dto.setRecentPurchases(recentPurchases);
        dto.setRecentSales(recentSales);
        dto.setRecentPayments(recentPayments);
        dto.setTopOutstandingSuppliers(topSuppliers);
        dto.setTopOutstandingCustomers(topCustomers);

        return dto;
    }

    public MonthlyReportDto getMonthlyReport(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        int totalTharsPurchased = purchaseRepository.sumTharsBetweenDates(startDate, endDate).orElse(0);
        int totalTharsSold = saleRepository.sumTharsBetweenDates(startDate, endDate).orElse(0);

        BigDecimal totalPurchases = purchaseRepository.sumTotalAmountBetweenDates(startDate, endDate).orElse(BigDecimal.ZERO);
        BigDecimal totalSales = saleRepository.sumTotalAmountBetweenDates(startDate, endDate).orElse(BigDecimal.ZERO);
        BigDecimal totalExpenses = expenseRepository.sumAmountBetweenDates(startDate, endDate).orElse(BigDecimal.ZERO);

        List<SupplierSummaryDto> suppliers = supplierService.getAllSuppliers(null);
        BigDecimal supplierOutstanding = suppliers.stream().map(SupplierSummaryDto::getOutstandingBalance).reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CustomerSummaryDto> customers = customerService.getAllCustomers(null);
        BigDecimal customerOutstanding = customers.stream().map(CustomerSummaryDto::getOutstandingBalance).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgPurchasePrice = totalTharsPurchased > 0 ?
                totalPurchases.divide(BigDecimal.valueOf(totalTharsPurchased), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal avgSellingPrice = totalTharsSold > 0 ?
                totalSales.divide(BigDecimal.valueOf(totalTharsSold), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        BigDecimal cogs = avgPurchasePrice.multiply(BigDecimal.valueOf(totalTharsSold));
        BigDecimal estimatedProfit = totalSales.subtract(cogs).subtract(totalExpenses);

        // Daily chart series
        List<Map<String, Object>> dailySalesData = new ArrayList<>();
        List<Map<String, Object>> dailyProfitData = new ArrayList<>();
        List<Map<String, Object>> stockMovementData = new ArrayList<>();

        for (int day = 1; day <= ym.lengthOfMonth(); day++) {
            LocalDate d = ym.atDay(day);

            BigDecimal dSales = saleRepository.sumTotalAmountByDate(d).orElse(BigDecimal.ZERO);
            BigDecimal dPurchases = purchaseRepository.sumTotalAmountByDate(d).orElse(BigDecimal.ZERO);
            BigDecimal dExpenses = expenseRepository.sumAmountByDate(d).orElse(BigDecimal.ZERO);
            int dSold = saleRepository.sumTharsByDate(d).orElse(0);
            int dPurchased = purchaseRepository.sumTharsByDate(d).orElse(0);

            BigDecimal dCogs = avgPurchasePrice.multiply(BigDecimal.valueOf(dSold));
            BigDecimal dProfit = dSales.subtract(dCogs).subtract(dExpenses);

            Map<String, Object> salesRow = new HashMap<>();
            salesRow.put("day", String.format("%02d", day));
            salesRow.put("sales", dSales);
            salesRow.put("purchases", dPurchases);
            dailySalesData.add(salesRow);

            Map<String, Object> profitRow = new HashMap<>();
            profitRow.put("day", String.format("%02d", day));
            profitRow.put("profit", dProfit);
            dailyProfitData.add(profitRow);

            Map<String, Object> stockRow = new HashMap<>();
            stockRow.put("day", String.format("%02d", day));
            stockRow.put("purchased", dPurchased);
            stockRow.put("sold", dSold);
            stockMovementData.add(stockRow);
        }

        MonthlyReportDto dto = new MonthlyReportDto();
        dto.setYearMonth(ym.toString());
        dto.setTotalTharsPurchased(totalTharsPurchased);
        dto.setTotalTharsSold(totalTharsSold);
        dto.setTotalPurchases(totalPurchases);
        dto.setTotalSales(totalSales);
        dto.setTotalExpenses(totalExpenses);
        dto.setSupplierOutstanding(supplierOutstanding);
        dto.setCustomerOutstanding(customerOutstanding);
        dto.setEstimatedProfit(estimatedProfit);
        dto.setAvgPurchasePrice(avgPurchasePrice);
        dto.setAvgSellingPrice(avgSellingPrice);
        dto.setDailySalesData(dailySalesData);
        dto.setDailyProfitData(dailyProfitData);
        dto.setStockMovementData(stockMovementData);

        return dto;
    }
}
