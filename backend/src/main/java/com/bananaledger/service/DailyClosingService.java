package com.bananaledger.service;

import com.bananaledger.dto.DailyClosingRequest;
import com.bananaledger.dto.DailyReportDto;
import com.bananaledger.entity.DailyClosing;
import com.bananaledger.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class DailyClosingService {

    private final DailyClosingRepository dailyClosingRepository;
    private final PurchaseRepository purchaseRepository;
    private final SaleRepository saleRepository;
    private final SupplierPaymentRepository supplierPaymentRepository;
    private final CustomerPaymentRepository customerPaymentRepository;
    private final ExpenseRepository expenseRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final AuditService auditService;

    public DailyClosingService(DailyClosingRepository dailyClosingRepository,
                               PurchaseRepository purchaseRepository,
                               SaleRepository saleRepository,
                               SupplierPaymentRepository supplierPaymentRepository,
                               CustomerPaymentRepository customerPaymentRepository,
                               ExpenseRepository expenseRepository,
                               InventoryTransactionRepository inventoryTransactionRepository,
                               AuditService auditService) {
        this.dailyClosingRepository = dailyClosingRepository;
        this.purchaseRepository = purchaseRepository;
        this.saleRepository = saleRepository;
        this.supplierPaymentRepository = supplierPaymentRepository;
        this.customerPaymentRepository = customerPaymentRepository;
        this.expenseRepository = expenseRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.auditService = auditService;
    }

    public DailyReportDto getDailySummary(LocalDate date) {
        long customerCount = saleRepository.countSalesByDate(date);
        int tharsPurchased = purchaseRepository.sumTharsByDate(date).orElse(0);
        int tharsSold = saleRepository.sumTharsByDate(date).orElse(0);
        int closingStock = inventoryTransactionRepository.sumCurrentStock().orElse(0);

        BigDecimal purchaseVal = purchaseRepository.sumTotalAmountByDate(date).orElse(BigDecimal.ZERO);
        BigDecimal salesVal = saleRepository.sumTotalAmountByDate(date).orElse(BigDecimal.ZERO);
        BigDecimal suppPayments = supplierPaymentRepository.sumAmountByDate(date).orElse(BigDecimal.ZERO);
        BigDecimal custReceived = customerPaymentRepository.sumAmountByDate(date).orElse(BigDecimal.ZERO);
        BigDecimal expensesVal = expenseRepository.sumAmountByDate(date).orElse(BigDecimal.ZERO);

        // Calculate weighted average cost profit:
        // Weighted Average Cost per Thar = Total Purchases Value / Total Thars Purchased (if any), fallback to current average cost
        BigDecimal avgCostPerThar = BigDecimal.ZERO;
        if (tharsPurchased > 0) {
            avgCostPerThar = purchaseVal.divide(BigDecimal.valueOf(tharsPurchased), 2, java.math.RoundingMode.HALF_UP);
        } else {
            // Check global average purchase price
            BigDecimal globalTotalPurchases = purchaseRepository.sumTotalAmountBetweenDates(LocalDate.of(2000, 1, 1), LocalDate.now()).orElse(BigDecimal.ZERO);
            int globalTharsPurchased = purchaseRepository.sumTharsBetweenDates(LocalDate.of(2000, 1, 1), LocalDate.now()).orElse(0);
            if (globalTharsPurchased > 0) {
                avgCostPerThar = globalTotalPurchases.divide(BigDecimal.valueOf(globalTharsPurchased), 2, java.math.RoundingMode.HALF_UP);
            }
        }

        BigDecimal cogs = avgCostPerThar.multiply(BigDecimal.valueOf(tharsSold));
        BigDecimal estimatedProfit = salesVal.subtract(cogs).subtract(expensesVal);

        DailyReportDto dto = new DailyReportDto();
        dto.setDate(date);
        dto.setCustomerCount(customerCount);
        dto.setTharsPurchased(tharsPurchased);
        dto.setTharsSold(tharsSold);
        dto.setClosingStock(closingStock);
        dto.setPurchaseValue(purchaseVal);
        dto.setSalesValue(salesVal);
        dto.setSupplierPayments(suppPayments);
        dto.setCustomerReceived(custReceived);
        dto.setExpenses(expensesVal);
        dto.setEstimatedProfit(estimatedProfit);

        return dto;
    }

    @Transactional
    public DailyClosing closeDay(DailyClosingRequest request) {
        LocalDate date = request.getClosingDate();
        if (dailyClosingRepository.existsByClosingDate(date)) {
            throw new RuntimeException("Day " + date + " is already closed!");
        }

        DailyReportDto summary = getDailySummary(date);

        String username = "system";
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            username = SecurityContextHolder.getContext().getAuthentication().getName();
        }

        DailyClosing closing = new DailyClosing();
        closing.setClosingDate(date);
        closing.setTharsPurchased(summary.getTharsPurchased());
        closing.setTharsSold(summary.getTharsSold());
        closing.setClosingStock(summary.getClosingStock());
        closing.setTotalPurchases(summary.getPurchaseValue());
        closing.setTotalSales(summary.getSalesValue());
        closing.setSupplierPayments(summary.getSupplierPayments());
        closing.setCustomerPayments(summary.getCustomerReceived());
        closing.setTotalExpenses(summary.getExpenses());
        closing.setEstimatedProfit(summary.getEstimatedProfit());
        closing.setCashReceived(summary.getCustomerReceived());
        closing.setCashPaid(summary.getSupplierPayments().add(summary.getExpenses()));
        closing.setConfirmedBy(username);

        DailyClosing saved = dailyClosingRepository.save(closing);

        auditService.log("CLOSE_DAY", "DAILY_CLOSING", date.toString(), null,
                "Sales: ₹" + summary.getSalesValue() + ", Profit: ₹" + summary.getEstimatedProfit());

        return saved;
    }

    public boolean isDayClosed(LocalDate date) {
        return dailyClosingRepository.existsByClosingDate(date);
    }
}
