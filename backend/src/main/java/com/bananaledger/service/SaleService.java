package com.bananaledger.service;

import com.bananaledger.dto.SaleRequest;
import com.bananaledger.entity.Customer;
import com.bananaledger.entity.InventoryTransaction;
import com.bananaledger.entity.Sale;
import com.bananaledger.entity.enums.InventoryType;
import com.bananaledger.entity.enums.PaymentStatus;
import com.bananaledger.repository.CustomerRepository;
import com.bananaledger.repository.InventoryTransactionRepository;
import com.bananaledger.repository.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final AuditService auditService;

    public SaleService(SaleRepository saleRepository,
                        CustomerRepository customerRepository,
                        InventoryTransactionRepository inventoryTransactionRepository,
                        AuditService auditService) {
        this.saleRepository = saleRepository;
        this.customerRepository = customerRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Sale createSale(SaleRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + request.getCustomerId()));

        if (request.getThars() == null || request.getThars() <= 0) {
            throw new RuntimeException("Please enter a valid number of Thars (> 0)");
        }
        if (request.getPricePerThar() == null || request.getPricePerThar().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Price per Thar cannot be negative");
        }

        BigDecimal totalAmount = request.getPricePerThar().multiply(BigDecimal.valueOf(request.getThars()));
        BigDecimal received = request.getPaymentReceived() != null ? request.getPaymentReceived() : BigDecimal.ZERO;

        if (received.compareTo(totalAmount) > 0) {
            throw new RuntimeException("Payment received cannot be greater than sale total amount");
        }

        BigDecimal balanceAmount = totalAmount.subtract(received);
        PaymentStatus status;
        if (received.compareTo(totalAmount) >= 0) {
            status = PaymentStatus.PAID;
        } else if (received.compareTo(BigDecimal.ZERO) > 0) {
            status = PaymentStatus.PARTIALLY_PAID;
        } else {
            status = PaymentStatus.UNPAID;
        }

        Sale sale = new Sale();
        sale.setTransactionId(generateSaleTxId(request.getSaleDate()));
        sale.setCustomer(customer);
        sale.setSaleDate(request.getSaleDate());
        sale.setThars(request.getThars());
        sale.setPricePerThar(request.getPricePerThar());
        sale.setTotalAmount(totalAmount);
        sale.setReceivedAmount(received);
        sale.setBalanceAmount(balanceAmount);
        sale.setStatus(status);
        sale.setPaymentMethod(request.getPaymentMethod());
        sale.setNotes(request.getNotes());

        Sale savedSale = saleRepository.save(sale);

        // Update inventory
        int currentStock = inventoryTransactionRepository.sumCurrentStock().orElse(0);
        int newStock = currentStock - request.getThars(); // stock deducted

        InventoryTransaction invTx = new InventoryTransaction();
        invTx.setTransactionDate(request.getSaleDate());
        invTx.setType(InventoryType.SALE);
        invTx.setTharsChange(-request.getThars());
        invTx.setResultingStock(newStock);
        invTx.setReferenceId(savedSale.getTransactionId());
        invTx.setNotes("Sale to " + customer.getName() + " (" + customer.getCustomerCode() + ")");
        inventoryTransactionRepository.save(invTx);

        auditService.log("CREATE_SALE", "SALE", savedSale.getTransactionId(), null,
                "Customer: " + customer.getName() + ", Thars: " + request.getThars() + ", Total: ₹" + totalAmount);

        return savedSale;
    }

    @Transactional
    public Sale voidSale(Long id, String reason) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale not found with id: " + id));

        if (sale.getStatus() == PaymentStatus.VOID) {
            throw new RuntimeException("Sale is already voided");
        }

        PaymentStatus oldStatus = sale.getStatus();
        sale.setStatus(PaymentStatus.VOID);
        sale.setBalanceAmount(BigDecimal.ZERO);
        sale.setNotes((sale.getNotes() != null ? sale.getNotes() + " | " : "") + "VOIDED: " + reason);

        Sale saved = saleRepository.save(sale);

        // Reverse inventory movement (add thars back)
        int currentStock = inventoryTransactionRepository.sumCurrentStock().orElse(0);
        int newStock = currentStock + sale.getThars();

        InventoryTransaction invTx = new InventoryTransaction();
        invTx.setTransactionDate(LocalDate.now());
        invTx.setType(InventoryType.ADJUSTMENT);
        invTx.setTharsChange(sale.getThars());
        invTx.setResultingStock(newStock);
        invTx.setReferenceId("VOID-" + sale.getTransactionId());
        invTx.setNotes("Reversal for voided sale " + sale.getTransactionId() + ": " + reason);
        inventoryTransactionRepository.save(invTx);

        auditService.log("VOID_SALE", "SALE", sale.getTransactionId(), oldStatus.name(), "VOID: " + reason);

        return saved;
    }

    public List<Sale> getSalesByDateRange(LocalDate startDate, LocalDate endDate) {
        return saleRepository.findBySaleDateBetweenOrderBySaleDateDescCreatedAtDesc(startDate, endDate);
    }

    public List<Sale> getCustomerSales(Long customerId) {
        return saleRepository.findByCustomerIdOrderBySaleDateAscCreatedAtAsc(customerId);
    }

    public Sale getSaleByTxId(String txId) {
        return saleRepository.findByTransactionId(txId)
                .orElseThrow(() -> new RuntimeException("Sale transaction not found: " + txId));
    }

    public Sale getLastCustomerSale(Long customerId) {
        return saleRepository.findTopByCustomerIdOrderByCreatedAtDesc(customerId).orElse(null);
    }

    private String generateSaleTxId(LocalDate date) {
        String dateStr = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = saleRepository.countSalesByDate(date) + 1;
        return String.format("SAL-%s-%04d", dateStr, count);
    }
}
