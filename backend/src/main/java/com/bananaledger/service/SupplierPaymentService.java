package com.bananaledger.service;

import com.bananaledger.dto.SupplierPaymentRequest;
import com.bananaledger.entity.PaymentAllocation;
import com.bananaledger.entity.Purchase;
import com.bananaledger.entity.Supplier;
import com.bananaledger.entity.SupplierPayment;
import com.bananaledger.entity.enums.PaymentStatus;
import com.bananaledger.repository.PaymentAllocationRepository;
import com.bananaledger.repository.PurchaseRepository;
import com.bananaledger.repository.SupplierPaymentRepository;
import com.bananaledger.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class SupplierPaymentService {

    private final SupplierPaymentRepository supplierPaymentRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseRepository purchaseRepository;
    private final PaymentAllocationRepository allocationRepository;
    private final SupplierService supplierService;
    private final AuditService auditService;

    public SupplierPaymentService(SupplierPaymentRepository supplierPaymentRepository,
                                  SupplierRepository supplierRepository,
                                  PurchaseRepository purchaseRepository,
                                  PaymentAllocationRepository allocationRepository,
                                  SupplierService supplierService,
                                  AuditService auditService) {
        this.supplierPaymentRepository = supplierPaymentRepository;
        this.supplierRepository = supplierRepository;
        this.purchaseRepository = purchaseRepository;
        this.allocationRepository = allocationRepository;
        this.supplierService = supplierService;
        this.auditService = auditService;
    }

    @Transactional
    public SupplierPayment createPayment(SupplierPaymentRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + request.getSupplierId()));

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero.");
        }

        com.bananaledger.dto.SupplierSummaryDto summary = supplierService.getSupplierSummary(supplier.getId());
        BigDecimal currentOutstanding = summary.getOutstandingBalance();
        if (currentOutstanding == null || currentOutstanding.compareTo(BigDecimal.ZERO) < 0) {
            currentOutstanding = BigDecimal.ZERO;
        }

        if (request.getAmount().compareTo(currentOutstanding) > 0) {
            throw new IllegalArgumentException("Payment amount " + formatMoney(request.getAmount()) + " cannot exceed the outstanding amount " + formatMoney(currentOutstanding) + ".");
        }

        SupplierPayment payment = new SupplierPayment();
        payment.setPaymentCode(generatePaymentCode(request.getPaymentDate()));
        payment.setSupplier(supplier);
        payment.setPaymentDate(request.getPaymentDate());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setReferenceNo(request.getReferenceNo());
        payment.setUpiId(request.getUpiId());
        payment.setAccountName(request.getAccountName());
        payment.setUpiPhone(request.getUpiPhone());
        payment.setAccountNumber(request.getAccountNumber());
        payment.setBankName(request.getBankName());
        payment.setBranchName(request.getBranchName());
        payment.setIfscCode(request.getIfscCode());
        payment.setNotes(request.getNotes());
        payment.setAttachmentUrl(request.getAttachmentUrl());

        SupplierPayment savedPayment = supplierPaymentRepository.save(payment);

        // Allocate payment to oldest unpaid purchases first
        allocateSupplierPayment(savedPayment);

        auditService.log("CREATE_SUPPLIER_PAYMENT", "SUPPLIER_PAYMENT", savedPayment.getPaymentCode(), null,
                "Supplier: " + supplier.getName() + ", Amount: ₹" + request.getAmount() + ", Method: " + request.getPaymentMethod());

        return savedPayment;
    }

    private void allocateSupplierPayment(SupplierPayment payment) {
        BigDecimal remainingToAllocate = payment.getAmount();

        List<Purchase> unpaidPurchases = purchaseRepository.findUnpaidPurchasesBySupplier(payment.getSupplier().getId());

        for (Purchase purchase : unpaidPurchases) {
            if (remainingToAllocate.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal purchaseBalance = purchase.getBalanceAmount();
            BigDecimal amountToApply = remainingToAllocate.min(purchaseBalance);

            purchase.setPaidAmount(purchase.getPaidAmount().add(amountToApply));
            purchase.setBalanceAmount(purchase.getBalanceAmount().subtract(amountToApply));

            if (purchase.getBalanceAmount().compareTo(BigDecimal.ZERO) <= 0) {
                purchase.setStatus(PaymentStatus.PAID);
            } else {
                purchase.setStatus(PaymentStatus.PARTIALLY_PAID);
            }
            purchaseRepository.save(purchase);

            PaymentAllocation allocation = new PaymentAllocation();
            allocation.setSupplierPayment(payment);
            allocation.setPurchase(purchase);
            allocation.setAmount(amountToApply);
            allocationRepository.save(allocation);

            remainingToAllocate = remainingToAllocate.subtract(amountToApply);
        }
    }

    public List<SupplierPayment> getPaymentsByDateRange(LocalDate startDate, LocalDate endDate) {
        return supplierPaymentRepository.findByPaymentDateBetweenOrderByPaymentDateDescCreatedAtDesc(startDate, endDate);
    }

    public List<SupplierPayment> getSupplierPayments(Long supplierId) {
        return supplierPaymentRepository.findBySupplierIdOrderByPaymentDateAscCreatedAtAsc(supplierId);
    }

    private String generatePaymentCode(LocalDate date) {
        String dateStr = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = supplierPaymentRepository.count() + 1;
        return String.format("PAY-%s-%04d", dateStr, count);
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
