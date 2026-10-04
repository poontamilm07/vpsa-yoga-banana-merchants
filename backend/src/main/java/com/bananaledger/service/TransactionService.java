package com.bananaledger.service;

import com.bananaledger.dto.TransactionDto;
import com.bananaledger.entity.*;
import com.bananaledger.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class TransactionService {

    private final PurchaseRepository purchaseRepository;
    private final SaleRepository saleRepository;
    private final SupplierPaymentRepository supplierPaymentRepository;
    private final CustomerPaymentRepository customerPaymentRepository;
    private final ExpenseRepository expenseRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final PaymentAllocationRepository allocationRepository;

    public TransactionService(PurchaseRepository purchaseRepository,
                               SaleRepository saleRepository,
                               SupplierPaymentRepository supplierPaymentRepository,
                               CustomerPaymentRepository customerPaymentRepository,
                               ExpenseRepository expenseRepository,
                               InventoryTransactionRepository inventoryTransactionRepository,
                               PaymentAllocationRepository allocationRepository) {
        this.purchaseRepository = purchaseRepository;
        this.saleRepository = saleRepository;
        this.supplierPaymentRepository = supplierPaymentRepository;
        this.customerPaymentRepository = customerPaymentRepository;
        this.expenseRepository = expenseRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.allocationRepository = allocationRepository;
    }

    public List<TransactionDto> getTransactions(String typeFilter, String search, LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().minusDays(30);
        if (endDate == null) endDate = LocalDate.now();

        List<TransactionDto> list = new ArrayList<>();

        // 1. Purchases
        if (typeFilter == null || typeFilter.isEmpty() || typeFilter.equalsIgnoreCase("ALL") || typeFilter.equalsIgnoreCase("PURCHASE")) {
            List<Purchase> purchases = purchaseRepository.findByPurchaseDateBetweenOrderByPurchaseDateDescCreatedAtDesc(startDate, endDate);
            for (Purchase p : purchases) {
                TransactionDto dto = new TransactionDto();
                dto.setId(p.getTransactionId());
                dto.setBillNumber(p.getBillNumber());
                dto.setType("PURCHASE");
                dto.setDate(p.getPurchaseDate());
                dto.setTimestamp(p.getCreatedAt());
                dto.setPartyName(p.getSupplier().getName());
                dto.setPartyCode(p.getSupplier().getSupplierCode());
                dto.setPartyType("SUPPLIER");
                dto.setPartyId(p.getSupplier().getId());

                dto.setParticulars(p.getParticulars());
                dto.setLotNumber(p.getLotNumber());
                dto.setQuantity(p.getQuantity());
                dto.setNetWeightKg(p.getNetWeightKg());
                dto.setLsWeightKg(p.getLsWeightKg());
                dto.setTotalWeightKg(p.getTotalWeightKg());
                dto.setRatePerKg(p.getRatePerKg());
                dto.setGrossAmount(p.getGrossAmount());
                dto.setDiscountAmount(p.getDiscountAmount());
                dto.setItemsJson(p.getItemsJson());

                dto.setThars(p.getThars());
                dto.setUnitPrice(p.getRatePerKg() != null ? p.getRatePerKg() : p.getPricePerThar());
                dto.setTotalAmount(p.getTotalAmount());
                dto.setPaidAmount(p.getPaidAmount());
                dto.setBalanceAmount(p.getBalanceAmount());
                dto.setStatus(p.getStatus());
                dto.setNotes(p.getNotes());
                dto.setAttachmentUrl(p.getAttachmentUrl());

                // Fetch allocations
                List<PaymentAllocation> allocs = allocationRepository.findByPurchaseId(p.getId());
                List<Map<String, Object>> allocList = new ArrayList<>();
                for (PaymentAllocation pa : allocs) {
                    Map<String, Object> m = new HashMap<>();
                    m.put("paymentCode", pa.getSupplierPayment() != null ? pa.getSupplierPayment().getPaymentCode() : "Initial Pay");
                    m.put("amount", pa.getAmount());
                    m.put("date", pa.getSupplierPayment() != null ? pa.getSupplierPayment().getPaymentDate() : p.getPurchaseDate());
                    allocList.add(m);
                }
                dto.setAllocations(allocList);
                list.add(dto);
            }
        }

        // 2. Sales
        if (typeFilter == null || typeFilter.isEmpty() || typeFilter.equalsIgnoreCase("ALL") || typeFilter.equalsIgnoreCase("SALE")) {
            List<Sale> sales = saleRepository.findBySaleDateBetweenOrderBySaleDateDescCreatedAtDesc(startDate, endDate);
            for (Sale s : sales) {
                TransactionDto dto = new TransactionDto();
                dto.setId(s.getTransactionId());
                dto.setType("SALE");
                dto.setDate(s.getSaleDate());
                dto.setTimestamp(s.getCreatedAt());
                dto.setPartyName(s.getCustomer().getName());
                dto.setPartyCode(s.getCustomer().getCustomerCode());
                dto.setPartyType("CUSTOMER");
                dto.setPartyId(s.getCustomer().getId());
                dto.setThars(s.getThars());
                dto.setUnitPrice(s.getPricePerThar());
                dto.setTotalAmount(s.getTotalAmount());
                dto.setPaidAmount(s.getReceivedAmount());
                dto.setBalanceAmount(s.getBalanceAmount());
                dto.setStatus(s.getStatus());
                dto.setPaymentMethod(s.getPaymentMethod() != null ? s.getPaymentMethod().name() : null);
                dto.setNotes(s.getNotes());
                list.add(dto);
            }
        }

        // 3. Supplier Payments
        if (typeFilter == null || typeFilter.isEmpty() || typeFilter.equalsIgnoreCase("ALL") || typeFilter.equalsIgnoreCase("SUPPLIER_PAYMENT") || typeFilter.equalsIgnoreCase("PAYMENT")) {
            List<SupplierPayment> sPayments = supplierPaymentRepository.findByPaymentDateBetweenOrderByPaymentDateDescCreatedAtDesc(startDate, endDate);
            for (SupplierPayment sp : sPayments) {
                TransactionDto dto = new TransactionDto();
                dto.setId(sp.getPaymentCode());
                dto.setType("SUPPLIER_PAYMENT");
                dto.setDate(sp.getPaymentDate());
                dto.setTimestamp(sp.getCreatedAt());
                dto.setPartyName(sp.getSupplier().getName());
                dto.setPartyCode(sp.getSupplier().getSupplierCode());
                dto.setPartyType("SUPPLIER");
                dto.setPartyId(sp.getSupplier().getId());
                dto.setTotalAmount(sp.getAmount());
                dto.setPaidAmount(sp.getAmount());
                dto.setBalanceAmount(java.math.BigDecimal.ZERO);
                dto.setPaymentMethod(sp.getPaymentMethod() != null ? sp.getPaymentMethod().name() : null);
                dto.setReferenceNo(sp.getReferenceNo());
                dto.setUpiId(sp.getUpiId());
                dto.setAccountName(sp.getAccountName());
                dto.setUpiPhone(sp.getUpiPhone());
                dto.setAccountNumber(sp.getAccountNumber());
                dto.setBankName(sp.getBankName());
                dto.setBranchName(sp.getBranchName());
                dto.setIfscCode(sp.getIfscCode());
                dto.setNotes(sp.getNotes());
                dto.setAttachmentUrl(sp.getAttachmentUrl());
                list.add(dto);
            }
        }

        // 4. Customer Payments
        if (typeFilter == null || typeFilter.isEmpty() || typeFilter.equalsIgnoreCase("ALL") || typeFilter.equalsIgnoreCase("CUSTOMER_PAYMENT")) {
            List<CustomerPayment> cPayments = customerPaymentRepository.findByPaymentDateBetweenOrderByPaymentDateDescCreatedAtDesc(startDate, endDate);
            for (CustomerPayment cp : cPayments) {
                TransactionDto dto = new TransactionDto();
                dto.setId(cp.getPaymentCode());
                dto.setType("CUSTOMER_PAYMENT");
                dto.setDate(cp.getPaymentDate());
                dto.setTimestamp(cp.getCreatedAt());
                dto.setPartyName(cp.getCustomer().getName());
                dto.setPartyCode(cp.getCustomer().getCustomerCode());
                dto.setPartyType("CUSTOMER");
                dto.setPartyId(cp.getCustomer().getId());
                dto.setTotalAmount(cp.getAmount());
                dto.setPaidAmount(cp.getAmount());
                dto.setBalanceAmount(java.math.BigDecimal.ZERO);
                dto.setPaymentMethod(cp.getPaymentMethod() != null ? cp.getPaymentMethod().name() : null);
                dto.setNotes(cp.getNotes());
                list.add(dto);
            }
        }

        // 5. Expenses
        if (typeFilter == null || typeFilter.isEmpty() || typeFilter.equalsIgnoreCase("ALL") || typeFilter.equalsIgnoreCase("EXPENSE")) {
            List<Expense> expenses = expenseRepository.findByExpenseDateBetweenOrderByExpenseDateDescCreatedAtDesc(startDate, endDate);
            for (Expense e : expenses) {
                TransactionDto dto = new TransactionDto();
                dto.setId("EXP-" + e.getId());
                dto.setType("EXPENSE");
                dto.setDate(e.getExpenseDate());
                dto.setTimestamp(e.getCreatedAt());
                dto.setPartyName("Expense: " + e.getCategory().name());
                dto.setCategory(e.getCategory().name());
                dto.setTotalAmount(e.getAmount());
                dto.setPaidAmount(e.getAmount());
                dto.setBalanceAmount(java.math.BigDecimal.ZERO);
                dto.setPaymentMethod("CASH");
                dto.setNotes(e.getDescription());
                dto.setAttachmentUrl(e.getReceiptUrl());
                list.add(dto);
            }
        }

        // Sort all by Date Descending, Timestamp Descending
        list.sort((a, b) -> {
            int dateCmp = b.getDate().compareTo(a.getDate());
            if (dateCmp != 0) return dateCmp;
            if (a.getTimestamp() != null && b.getTimestamp() != null) {
                return b.getTimestamp().compareTo(a.getTimestamp());
            }
            return 0;
        });

        // Search filter across partyName, partyCode, id, notes, billNumber
        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            List<TransactionDto> filtered = new ArrayList<>();
            for (TransactionDto dto : list) {
                boolean match = (dto.getId() != null && dto.getId().toLowerCase().contains(q)) ||
                                (dto.getBillNumber() != null && dto.getBillNumber().toLowerCase().contains(q)) ||
                                (dto.getPartyName() != null && dto.getPartyName().toLowerCase().contains(q)) ||
                                (dto.getPartyCode() != null && dto.getPartyCode().toLowerCase().contains(q)) ||
                                (dto.getNotes() != null && dto.getNotes().toLowerCase().contains(q));
                if (match) filtered.add(dto);
            }
            return filtered;
        }

        return list;
    }
}
