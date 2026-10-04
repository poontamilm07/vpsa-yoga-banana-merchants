package com.bananaledger.service;

import com.bananaledger.dto.PurchaseRequest;
import com.bananaledger.entity.InventoryTransaction;
import com.bananaledger.entity.Purchase;
import com.bananaledger.entity.Supplier;
import com.bananaledger.entity.enums.InventoryType;
import com.bananaledger.entity.enums.PaymentStatus;
import com.bananaledger.repository.InventoryTransactionRepository;
import com.bananaledger.repository.PurchaseRepository;
import com.bananaledger.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final SupplierPaymentService supplierPaymentService;
    private final SupplierService supplierService;
    private final AuditService auditService;

    public PurchaseService(PurchaseRepository purchaseRepository,
                           SupplierRepository supplierRepository,
                           InventoryTransactionRepository inventoryTransactionRepository,
                           SupplierPaymentService supplierPaymentService,
                           SupplierService supplierService,
                           AuditService auditService) {
        this.purchaseRepository = purchaseRepository;
        this.supplierRepository = supplierRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.supplierPaymentService = supplierPaymentService;
        this.supplierService = supplierService;
        this.auditService = auditService;
    }

    @Transactional
    public Purchase createPurchase(PurchaseRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + request.getSupplierId()));

        if (request.getNetWeightKg() != null && request.getNetWeightKg().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Net Weight cannot be negative.");
        }
        if (request.getLsWeightKg() != null && request.getLsWeightKg().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("L.S. Weight cannot be negative.");
        }

        BigDecimal totalWeightKg = request.getTotalWeightKg();
        if (request.getNetWeightKg() != null || request.getLsWeightKg() != null) {
            BigDecimal net = request.getNetWeightKg() != null ? request.getNetWeightKg() : BigDecimal.ZERO;
            BigDecimal ls = request.getLsWeightKg() != null ? request.getLsWeightKg() : BigDecimal.ZERO;
            totalWeightKg = net.subtract(ls);
        }

        BigDecimal ratePerKg = request.getRatePerKg();
        BigDecimal grossAmount;
        BigDecimal discountAmount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount;
        Integer thars = request.getThars();
        BigDecimal pricePerThar = request.getPricePerThar();

        if (totalWeightKg != null && totalWeightKg.compareTo(BigDecimal.ZERO) > 0 && ratePerKg != null) {
            if (ratePerKg.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Rate per KG cannot be negative.");
            }
            if (ratePerKg.compareTo(BigDecimal.ZERO) == 0) {
                throw new IllegalArgumentException("Rate per KG cannot be zero.");
            }
            grossAmount = totalWeightKg.multiply(ratePerKg).setScale(2, RoundingMode.HALF_UP);
            if (discountAmount.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Discount cannot be negative.");
            }
            if (discountAmount.compareTo(grossAmount) > 0) {
                throw new IllegalArgumentException("Discount cannot exceed gross purchase amount.");
            }
            totalAmount = grossAmount.subtract(discountAmount).setScale(2, RoundingMode.HALF_UP);
            if (thars == null || thars <= 0) {
                thars = Math.max(1, totalWeightKg.divide(BigDecimal.valueOf(15), 0, RoundingMode.HALF_UP).intValue());
            }
            if (pricePerThar == null) {
                pricePerThar = ratePerKg.multiply(BigDecimal.valueOf(15)).setScale(2, RoundingMode.HALF_UP);
            }
        } else if (thars != null && thars > 0 && pricePerThar != null) {
            if (pricePerThar.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Price per Thar cannot be negative");
            }
            grossAmount = pricePerThar.multiply(BigDecimal.valueOf(thars)).setScale(2, RoundingMode.HALF_UP);
            if (discountAmount.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Discount cannot be negative.");
            }
            if (discountAmount.compareTo(grossAmount) > 0) {
                throw new IllegalArgumentException("Discount cannot exceed gross purchase amount.");
            }
            totalAmount = grossAmount.subtract(discountAmount).setScale(2, RoundingMode.HALF_UP);
            if (totalWeightKg == null) {
                totalWeightKg = BigDecimal.valueOf(thars * 15L);
            }
            if (ratePerKg == null) {
                ratePerKg = pricePerThar.divide(BigDecimal.valueOf(15), 2, RoundingMode.HALF_UP);
            }
        } else {
            throw new IllegalArgumentException("Please enter a valid purchase weight (KG) and rate per KG");
        }

        BigDecimal previousOutstanding = supplierService.getSupplierSummary(supplier.getId()).getOutstandingBalance();
        if (previousOutstanding == null || previousOutstanding.compareTo(BigDecimal.ZERO) < 0) {
            previousOutstanding = BigDecimal.ZERO;
        }

        BigDecimal totalDue = previousOutstanding.add(totalAmount);
        BigDecimal paidNowInput = request.getPaymentNow() != null ? request.getPaymentNow() : BigDecimal.ZERO;

        if (paidNowInput.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Payment amount cannot be negative.");
        }

        if (paidNowInput.compareTo(totalDue) > 0) {
            throw new IllegalArgumentException("Payment amount " + formatMoney(paidNowInput) + " is higher than the total payable amount " + formatMoney(totalDue) + ".");
        }

        String billNo = request.getBillNumber();
        if (billNo == null || billNo.trim().isEmpty()) {
            billNo = String.valueOf(1500 + purchaseRepository.count() + 1);
        } else {
            billNo = billNo.trim();
        }

        Purchase purchase = new Purchase();
        purchase.setTransactionId(generatePurchaseTxId(request.getPurchaseDate()));
        purchase.setBillNumber(billNo);
        purchase.setSupplier(supplier);
        purchase.setPurchaseDate(request.getPurchaseDate());

        purchase.setParticulars(request.getParticulars() != null ? request.getParticulars() : "Banana Lot");
        purchase.setLotNumber(request.getLotNumber());
        purchase.setQuantity(request.getQuantity());
        purchase.setNetWeightKg(request.getNetWeightKg() != null ? request.getNetWeightKg() : totalWeightKg);
        purchase.setLsWeightKg(request.getLsWeightKg() != null ? request.getLsWeightKg() : BigDecimal.ZERO);
        purchase.setTotalWeightKg(totalWeightKg);
        purchase.setRatePerKg(ratePerKg);
        purchase.setGrossAmount(grossAmount);
        purchase.setDiscountAmount(discountAmount);
        purchase.setItemsJson(request.getItemsJson());

        purchase.setThars(thars);
        purchase.setPricePerThar(pricePerThar);
        purchase.setTotalAmount(totalAmount);
        purchase.setPaidAmount(BigDecimal.ZERO);
        purchase.setBalanceAmount(totalAmount);
        purchase.setStatus(PaymentStatus.UNPAID);
        purchase.setNotes(request.getNotes());
        purchase.setAttachmentUrl(request.getAttachmentUrl());

        Purchase savedPurchase = purchaseRepository.save(purchase);

        // Record payment if made now
        if (paidNowInput.compareTo(BigDecimal.ZERO) > 0) {
            com.bananaledger.dto.SupplierPaymentRequest paymentReq = new com.bananaledger.dto.SupplierPaymentRequest();
            paymentReq.setSupplierId(supplier.getId());
            paymentReq.setPaymentDate(request.getPurchaseDate());
            paymentReq.setAmount(paidNowInput);
            paymentReq.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : com.bananaledger.entity.enums.PaymentMethod.CASH);
            paymentReq.setReferenceNo(request.getReferenceNo());
            paymentReq.setUpiId(request.getUpiId());
            paymentReq.setAccountName(request.getAccountName());
            paymentReq.setUpiPhone(request.getUpiPhone());
            paymentReq.setAccountNumber(request.getAccountNumber());
            paymentReq.setBankName(request.getBankName());
            paymentReq.setBranchName(request.getBranchName());
            paymentReq.setIfscCode(request.getIfscCode());
            paymentReq.setNotes(request.getNotes() != null ? request.getNotes() : "Payment on purchase Bill #" + savedPurchase.getBillNumber());
            supplierPaymentService.createPayment(paymentReq);
        }

        // Update inventory
        int currentStock = inventoryTransactionRepository.sumCurrentStock().orElse(0);
        int newStock = currentStock + thars;

        InventoryTransaction invTx = new InventoryTransaction();
        invTx.setTransactionDate(request.getPurchaseDate());
        invTx.setType(InventoryType.PURCHASE);
        invTx.setTharsChange(thars);
        invTx.setResultingStock(newStock);
        invTx.setReferenceId(savedPurchase.getTransactionId());
        invTx.setNotes("Purchase Bill #" + savedPurchase.getBillNumber() + " from " + supplier.getName() + " (" + totalWeightKg + " KG @ ₹" + ratePerKg + ")");
        inventoryTransactionRepository.save(invTx);

        // Audit log
        auditService.log("CREATE_PURCHASE", "PURCHASE", savedPurchase.getTransactionId(), null,
                "Supplier: " + supplier.getName() + ", Bill: " + savedPurchase.getBillNumber() + ", Weight: " + totalWeightKg + " KG, Total: ₹" + totalAmount);

        return savedPurchase;
    }

    @Transactional
    public Purchase voidPurchase(Long id, String reason) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase not found with id: " + id));

        if (purchase.getStatus() == PaymentStatus.VOID) {
            throw new RuntimeException("Purchase is already voided");
        }

        PaymentStatus oldStatus = purchase.getStatus();
        purchase.setStatus(PaymentStatus.VOID);
        purchase.setBalanceAmount(BigDecimal.ZERO);
        purchase.setNotes((purchase.getNotes() != null ? purchase.getNotes() + " | " : "") + "VOIDED: " + reason);

        Purchase saved = purchaseRepository.save(purchase);

        // Reverse stock movement
        int tharsToReverse = purchase.getThars() != null ? purchase.getThars() : 0;
        int currentStock = inventoryTransactionRepository.sumCurrentStock().orElse(0);
        int newStock = Math.max(0, currentStock - tharsToReverse);

        InventoryTransaction invTx = new InventoryTransaction();
        invTx.setTransactionDate(LocalDate.now());
        invTx.setType(InventoryType.ADJUSTMENT);
        invTx.setTharsChange(-tharsToReverse);
        invTx.setResultingStock(newStock);
        invTx.setReferenceId("VOID-" + purchase.getTransactionId());
        invTx.setNotes("Reversal for voided purchase Bill #" + purchase.getBillNumber() + ": " + reason);
        inventoryTransactionRepository.save(invTx);

        auditService.log("VOID_PURCHASE", "PURCHASE", purchase.getTransactionId(), oldStatus.name(), "VOID: " + reason);

        return saved;
    }

    public List<Purchase> getPurchasesByDateRange(LocalDate startDate, LocalDate endDate) {
        return purchaseRepository.findByPurchaseDateBetweenOrderByPurchaseDateDescCreatedAtDesc(startDate, endDate);
    }

    public List<Purchase> getSupplierPurchases(Long supplierId) {
        return purchaseRepository.findBySupplierIdOrderByPurchaseDateAscCreatedAtAsc(supplierId);
    }

    public Purchase getPurchaseByTxId(String txId) {
        return purchaseRepository.findByTransactionId(txId)
                .orElseThrow(() -> new RuntimeException("Purchase transaction not found: " + txId));
    }

    private String generatePurchaseTxId(LocalDate date) {
        String dateStr = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = purchaseRepository.countPurchasesByDate(date) + 1;
        return String.format("PUR-%s-%04d", dateStr, count);
    }

    private String formatMoney(BigDecimal amount) {
        if (amount == null) return "₹0";
        BigDecimal stripped = amount.stripTrailingZeros();
        if (stripped.scale() <= 0) {
            return String.format("₹%,d", amount.longValue());
        } else {
            return String.format("₹%,.2f", amount.doubleValue());
        }
    }
}
