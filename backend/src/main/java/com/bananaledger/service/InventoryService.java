package com.bananaledger.service;

import com.bananaledger.dto.StockAdjustmentRequest;
import com.bananaledger.entity.InventoryTransaction;
import com.bananaledger.repository.InventoryTransactionRepository;
import com.bananaledger.repository.PurchaseRepository;
import com.bananaledger.repository.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InventoryService {

    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final PurchaseRepository purchaseRepository;
    private final SaleRepository saleRepository;
    private final AuditService auditService;

    public InventoryService(InventoryTransactionRepository inventoryTransactionRepository,
                            PurchaseRepository purchaseRepository,
                            SaleRepository saleRepository,
                            AuditService auditService) {
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.purchaseRepository = purchaseRepository;
        this.saleRepository = saleRepository;
        this.auditService = auditService;
    }

    public int getCurrentStock() {
        return inventoryTransactionRepository.sumCurrentStock().orElse(0);
    }

    public Map<String, Object> getStockSummary() {
        LocalDate today = LocalDate.now();
        int currentStock = getCurrentStock();

        int todayPurchased = purchaseRepository.sumTharsByDate(today).orElse(0);
        int todaySold = saleRepository.sumTharsByDate(today).orElse(0);
        int todayDamaged = inventoryTransactionRepository.sumDamagedTharsByDate(today).orElse(0);

        // Global total purchases to derive average cost per Thar
        BigDecimal globalTotalPurchases = purchaseRepository.sumTotalAmountBetweenDates(LocalDate.of(2000, 1, 1), today).orElse(BigDecimal.ZERO);
        int globalTharsPurchased = purchaseRepository.sumTharsBetweenDates(LocalDate.of(2000, 1, 1), today).orElse(0);

        BigDecimal avgCostPerThar = BigDecimal.ZERO;
        if (globalTharsPurchased > 0) {
            avgCostPerThar = globalTotalPurchases.divide(BigDecimal.valueOf(globalTharsPurchased), 2, RoundingMode.HALF_UP);
        }

        BigDecimal estimatedStockValue = avgCostPerThar.multiply(BigDecimal.valueOf(currentStock));

        Map<String, Object> map = new HashMap<>();
        map.put("currentStock", currentStock);
        map.put("unit", "Thar");
        map.put("lowStock", currentStock < 20);
        map.put("todayPurchased", todayPurchased);
        map.put("todaySold", todaySold);
        map.put("todayDamaged", todayDamaged);
        map.put("avgCostPerThar", avgCostPerThar);
        map.put("estimatedStockValue", estimatedStockValue);

        return map;
    }

    public List<InventoryTransaction> getStockMovements(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null) {
            return inventoryTransactionRepository.findByTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(startDate, endDate);
        }
        return inventoryTransactionRepository.findAllByOrderByTransactionDateDescCreatedAtDesc();
    }

    @Transactional
    public InventoryTransaction addStockAdjustment(StockAdjustmentRequest request) {
        int currentStock = getCurrentStock();
        int newStock = currentStock + request.getTharsChange();
        if (newStock < 0) {
            throw new RuntimeException("Stock adjustment cannot result in negative inventory (" + newStock + " Thars)");
        }

        InventoryTransaction invTx = new InventoryTransaction();
        invTx.setTransactionDate(request.getTransactionDate());
        invTx.setType(request.getType());
        invTx.setTharsChange(request.getTharsChange());
        invTx.setResultingStock(newStock);
        invTx.setReferenceId("ADJ-" + System.currentTimeMillis());
        invTx.setNotes(request.getNotes() != null ? request.getNotes() : "Manual " + request.getType() + " adjustment");

        InventoryTransaction saved = inventoryTransactionRepository.save(invTx);

        auditService.log("STOCK_ADJUSTMENT", "INVENTORY", saved.getReferenceId(),
                "Old: " + currentStock, "New: " + newStock + " (" + request.getType() + ")");

        return saved;
    }
}
