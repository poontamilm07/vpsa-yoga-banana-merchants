package com.bananaledger.service;

import com.bananaledger.dto.LedgerEntryDto;
import com.bananaledger.dto.SupplierRequest;
import com.bananaledger.dto.SupplierSummaryDto;
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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final PurchaseRepository purchaseRepository;
    private final SupplierPaymentRepository supplierPaymentRepository;
    private final PaymentAllocationRepository allocationRepository;

    public SupplierService(SupplierRepository supplierRepository,
                           PurchaseRepository purchaseRepository,
                           SupplierPaymentRepository supplierPaymentRepository,
                           PaymentAllocationRepository allocationRepository) {
        this.supplierRepository = supplierRepository;
        this.purchaseRepository = purchaseRepository;
        this.supplierPaymentRepository = supplierPaymentRepository;
        this.allocationRepository = allocationRepository;
    }

    @Transactional
    public Supplier createSupplier(SupplierRequest request) {
        Supplier supplier = new Supplier();
        if (request.getSupplierCode() != null && !request.getSupplierCode().trim().isEmpty()) {
            supplier.setSupplierCode(request.getSupplierCode().trim());
        } else {
            supplier.setSupplierCode(generateSupplierCode());
        }
        supplier.setName(request.getName());
        supplier.setPhotoUrl(request.getPhotoUrl());
        supplier.setPhone(request.getPhone());
        supplier.setWhatsappNumber(request.getWhatsappNumber());
        supplier.setVillage(request.getVillage());
        supplier.setArea(request.getArea());
        supplier.setAddress(request.getAddress());
        supplier.setNotes(request.getNotes());
        supplier.setActive(request.getActive() != null ? request.getActive() : true);
        supplier.setFavorite(request.getFavorite() != null ? request.getFavorite() : false);
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));

        if (request.getSupplierCode() != null && !request.getSupplierCode().trim().isEmpty()) supplier.setSupplierCode(request.getSupplierCode().trim());
        if (request.getName() != null) supplier.setName(request.getName());
        if (request.getPhotoUrl() != null) supplier.setPhotoUrl(request.getPhotoUrl());
        if (request.getPhone() != null) supplier.setPhone(request.getPhone());
        if (request.getWhatsappNumber() != null) supplier.setWhatsappNumber(request.getWhatsappNumber());
        if (request.getVillage() != null) supplier.setVillage(request.getVillage());
        if (request.getArea() != null) supplier.setArea(request.getArea());
        if (request.getAddress() != null) supplier.setAddress(request.getAddress());
        if (request.getNotes() != null) supplier.setNotes(request.getNotes());
        if (request.getActive() != null) supplier.setActive(request.getActive());
        if (request.getFavorite() != null) supplier.setFavorite(request.getFavorite());

        return supplierRepository.save(supplier);
    }

    @Transactional
    public boolean toggleFavorite(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        supplier.setFavorite(!supplier.isFavorite());
        supplierRepository.save(supplier);
        return supplier.isFavorite();
    }

    public com.bananaledger.dto.QuickRepeatTemplateDto getQuickRepeatTemplate(Long supplierId) {
        SupplierSummaryDto summary = getSupplierSummary(supplierId);
        List<Purchase> purchases = purchaseRepository.findBySupplierIdOrderByPurchaseDateAscCreatedAtAsc(supplierId);

        com.bananaledger.dto.QuickRepeatTemplateDto dto = new com.bananaledger.dto.QuickRepeatTemplateDto();
        dto.setVendorId(summary.getId());
        dto.setVendorName(summary.getName());
        dto.setPreviousBalance(summary.getOutstandingBalance());

        if (!purchases.isEmpty()) {
            Purchase last = purchases.get(purchases.size() - 1);
            dto.setLastThars(last.getThars());
            dto.setLastPricePerThar(last.getPricePerThar());
            dto.setLastPaymentMethod(com.bananaledger.entity.enums.PaymentMethod.CASH);
        }
        return dto;
    }

    public List<SupplierSummaryDto> getAllSuppliers(String search) {
        List<Supplier> suppliers;
        if (search != null && !search.trim().isEmpty()) {
            suppliers = supplierRepository.searchSuppliers(search.trim());
        } else {
            suppliers = supplierRepository.findAll();
        }

        List<SupplierSummaryDto> list = new ArrayList<>();
        for (Supplier s : suppliers) {
            list.add(getSupplierSummary(s.getId()));
        }
        return list;
    }

    public SupplierSummaryDto getSupplierSummary(Long supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + supplierId));

        List<Purchase> purchases = purchaseRepository.findBySupplierIdOrderByPurchaseDateAscCreatedAtAsc(supplierId);
        List<SupplierPayment> payments = supplierPaymentRepository.findBySupplierIdOrderByPaymentDateAscCreatedAtAsc(supplierId);

        BigDecimal totalKg = BigDecimal.ZERO;
        int totalThars = 0;
        BigDecimal totalPurchaseAmount = BigDecimal.ZERO;
        BigDecimal totalPaidAmount = BigDecimal.ZERO;
        LocalDate lastTransactionDate = null;

        for (Purchase p : purchases) {
            if (p.getStatus() != PaymentStatus.VOID) {
                BigDecimal pWeight = p.getTotalWeightKg() != null ? p.getTotalWeightKg() : BigDecimal.valueOf((p.getThars() != null ? p.getThars() : 0) * 15L);
                totalKg = totalKg.add(pWeight);
                totalThars += (p.getThars() != null ? p.getThars() : 0);
                totalPurchaseAmount = totalPurchaseAmount.add(p.getTotalAmount());
                if (lastTransactionDate == null || p.getPurchaseDate().isAfter(lastTransactionDate)) {
                    lastTransactionDate = p.getPurchaseDate();
                }
            }
        }

        // Sum explicit SupplierPayment entries
        for (SupplierPayment sp : payments) {
            totalPaidAmount = totalPaidAmount.add(sp.getAmount());
            if (lastTransactionDate == null || sp.getPaymentDate().isAfter(lastTransactionDate)) {
                lastTransactionDate = sp.getPaymentDate();
            }
        }

        // Add unlinked purchase paidAmounts
        totalPaidAmount = totalPaidAmount.add(getUnlinkedPurchasePayments(purchases, payments));

        BigDecimal outstandingBalance = totalPurchaseAmount.subtract(totalPaidAmount);
        if (outstandingBalance.compareTo(BigDecimal.ZERO) < 0) {
            outstandingBalance = BigDecimal.ZERO;
        }

        // Rate History Analytics
        BigDecimal lastRatePerKg = null;
        BigDecimal sumRatesPerKg = BigDecimal.ZERO;
        BigDecimal highestRatePerKg = null;
        BigDecimal lowestRatePerKg = null;
        int kgRateCount = 0;

        BigDecimal lastRate = null;
        BigDecimal sumRates = BigDecimal.ZERO;
        BigDecimal highestRate = null;
        BigDecimal lowestRate = null;
        int rateCount = 0;
        LocalDate oldestPendingDate = null;

        for (Purchase p : purchases) {
            if (p.getStatus() != PaymentStatus.VOID) {
                // Rate per KG
                BigDecimal rKg = p.getRatePerKg();
                if (rKg == null && p.getPricePerThar() != null) {
                    rKg = p.getPricePerThar().divide(BigDecimal.valueOf(15), 2, RoundingMode.HALF_UP);
                }
                if (rKg != null) {
                    lastRatePerKg = rKg;
                    sumRatesPerKg = sumRatesPerKg.add(rKg);
                    kgRateCount++;
                    if (highestRatePerKg == null || rKg.compareTo(highestRatePerKg) > 0) highestRatePerKg = rKg;
                    if (lowestRatePerKg == null || rKg.compareTo(lowestRatePerKg) < 0) lowestRatePerKg = rKg;
                }

                // Legacy rate per Thar
                if (p.getPricePerThar() != null) {
                    BigDecimal rate = p.getPricePerThar();
                    lastRate = rate;
                    sumRates = sumRates.add(rate);
                    rateCount++;
                    if (highestRate == null || rate.compareTo(highestRate) > 0) highestRate = rate;
                    if (lowestRate == null || rate.compareTo(lowestRate) < 0) lowestRate = rate;
                }

                if (p.getPaidAmount().compareTo(p.getTotalAmount()) < 0 && oldestPendingDate == null) {
                    oldestPendingDate = p.getPurchaseDate();
                }
            }
        }

        BigDecimal avgRatePerKg = kgRateCount > 0 ? sumRatesPerKg.divide(BigDecimal.valueOf(kgRateCount), 2, RoundingMode.HALF_UP) : null;
        BigDecimal avgRate = rateCount > 0 ? sumRates.divide(BigDecimal.valueOf(rateCount), 2, RoundingMode.HALF_UP) : null;

        SupplierSummaryDto dto = new SupplierSummaryDto();
        dto.setId(supplier.getId());
        dto.setSupplierCode(supplier.getSupplierCode());
        dto.setName(supplier.getName());
        dto.setPhotoUrl(supplier.getPhotoUrl());
        dto.setPhone(supplier.getPhone());
        dto.setWhatsappNumber(supplier.getWhatsappNumber());
        dto.setVillage(supplier.getVillage());
        dto.setArea(supplier.getArea());
        dto.setAddress(supplier.getAddress());
        dto.setNotes(supplier.getNotes());
        dto.setActive(supplier.isActive());
        dto.setFavorite(supplier.isFavorite());

        dto.setTotalKgPurchased(totalKg);
        dto.setTotalTharsPurchased(totalThars);
        dto.setTotalPurchaseAmount(totalPurchaseAmount);
        dto.setTotalPaidAmount(totalPaidAmount);
        dto.setOutstandingBalance(outstandingBalance);
        dto.setLastTransactionDate(lastTransactionDate);
        dto.setTransactionCount(purchases.size() + payments.size());

        dto.setLastRatePerKg(lastRatePerKg);
        dto.setAvgRatePerKg(avgRatePerKg);
        dto.setHighestRatePerKg(highestRatePerKg);
        dto.setLowestRatePerKg(lowestRatePerKg);

        dto.setLastRate(lastRate);
        dto.setAvgRate(avgRate);
        dto.setHighestRate(highestRate);
        dto.setLowestRate(lowestRate);
        dto.setOldestPendingDate(oldestPendingDate);

        return dto;
    }

    public List<LedgerEntryDto> getSupplierLedger(Long supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + supplierId));

        List<Purchase> purchases = purchaseRepository.findBySupplierIdOrderByPurchaseDateAscCreatedAtAsc(supplierId);
        List<SupplierPayment> payments = supplierPaymentRepository.findBySupplierIdOrderByPaymentDateAscCreatedAtAsc(supplierId);

        List<LedgerEvent> events = new ArrayList<>();
        for (Purchase p : purchases) {
            if (p.getStatus() != PaymentStatus.VOID) {
                events.add(new LedgerEvent(p.getPurchaseDate(), p.getCreatedAt(), "PURCHASE", p.getTransactionId(),
                        "Purchase Bill #" + (p.getBillNumber() != null ? p.getBillNumber() : p.getTransactionId()) + " (" + (p.getTotalWeightKg() != null ? p.getTotalWeightKg() + " KG" : p.getThars() + " Thars") + " @ ₹" + (p.getRatePerKg() != null ? p.getRatePerKg() : p.getPricePerThar()) + ")",
                        p.getThars(), p.getPricePerThar(), p.getTotalAmount(), BigDecimal.ZERO));
            }
        }

        for (SupplierPayment sp : payments) {
            events.add(new LedgerEvent(sp.getPaymentDate(), sp.getCreatedAt(), "PAYMENT", sp.getPaymentCode(),
                    "Payment via " + sp.getPaymentMethod() + (sp.getReferenceNo() != null ? " (Ref: " + sp.getReferenceNo() + ")" : "") + (sp.getNotes() != null ? " - " + sp.getNotes() : ""),
                    null, null, BigDecimal.ZERO, sp.getAmount()));
        }

        events.sort((a, b) -> {
            int dateCmp = a.date.compareTo(b.date);
            if (dateCmp != 0) return dateCmp;
            if (a.createdAt != null && b.createdAt != null) {
                return a.createdAt.compareTo(b.createdAt);
            }
            return 0;
        });

        List<LedgerEntryDto> ledger = new ArrayList<>();
        BigDecimal runningBalance = BigDecimal.ZERO;

        for (LedgerEvent e : events) {
            runningBalance = runningBalance.add(e.debit).subtract(e.credit);
            LedgerEntryDto entry = new LedgerEntryDto();
            entry.setDate(e.date);
            entry.setTransactionId(e.txId);
            entry.setType(e.type);
            entry.setDescription(e.description);
            entry.setThars(e.thars);
            entry.setUnitPrice(e.unitPrice);
            entry.setDebit(e.debit);
            entry.setCredit(e.credit);
            entry.setRunningBalance(runningBalance);
            ledger.add(entry);
        }

        return ledger;
    }

    private BigDecimal getUnlinkedPurchasePayments(List<Purchase> purchases, List<SupplierPayment> payments) {
        BigDecimal sumUnlinked = BigDecimal.ZERO;

        for (Purchase p : purchases) {
            if (p.getStatus() != PaymentStatus.VOID && p.getPaidAmount() != null && p.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
                boolean hasAllocation = allocationRepository.findByPurchaseId(p.getId()).stream()
                        .anyMatch(a -> a.getSupplierPayment() != null);
                if (!hasAllocation) {
                    sumUnlinked = sumUnlinked.add(p.getPaidAmount());
                }
            }
        }

        return sumUnlinked;
    }

    private String generateSupplierCode() {
        long count = supplierRepository.count() + 1;
        return String.format("SUP-%04d", count);
    }

    private static class LedgerEvent {
        LocalDate date;
        java.time.LocalDateTime createdAt;
        String type;
        String txId;
        String description;
        Integer thars;
        BigDecimal unitPrice;
        BigDecimal debit;
        BigDecimal credit;

        LedgerEvent(LocalDate date, java.time.LocalDateTime createdAt, String type, String txId, String description, Integer thars, BigDecimal unitPrice, BigDecimal debit, BigDecimal credit) {
            this.date = date;
            this.createdAt = createdAt;
            this.type = type;
            this.txId = txId;
            this.description = description;
            this.thars = thars;
            this.unitPrice = unitPrice;
            this.debit = debit;
            this.credit = credit;
        }
    }
}
