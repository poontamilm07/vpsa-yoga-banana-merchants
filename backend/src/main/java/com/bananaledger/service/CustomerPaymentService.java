package com.bananaledger.service;

import com.bananaledger.dto.CustomerPaymentRequest;
import com.bananaledger.entity.Customer;
import com.bananaledger.entity.CustomerPayment;
import com.bananaledger.entity.PaymentAllocation;
import com.bananaledger.entity.Sale;
import com.bananaledger.entity.enums.PaymentStatus;
import com.bananaledger.repository.CustomerPaymentRepository;
import com.bananaledger.repository.CustomerRepository;
import com.bananaledger.repository.PaymentAllocationRepository;
import com.bananaledger.repository.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class CustomerPaymentService {

    private final CustomerPaymentRepository customerPaymentRepository;
    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;
    private final PaymentAllocationRepository allocationRepository;
    private final AuditService auditService;

    public CustomerPaymentService(CustomerPaymentRepository customerPaymentRepository,
                                  CustomerRepository customerRepository,
                                  SaleRepository saleRepository,
                                  PaymentAllocationRepository allocationRepository,
                                  AuditService auditService) {
        this.customerPaymentRepository = customerPaymentRepository;
        this.customerRepository = customerRepository;
        this.saleRepository = saleRepository;
        this.allocationRepository = allocationRepository;
        this.auditService = auditService;
    }

    @Transactional
    public CustomerPayment createPayment(CustomerPaymentRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + request.getCustomerId()));

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Payment amount must be greater than zero");
        }

        CustomerPayment payment = new CustomerPayment();
        payment.setPaymentCode(generatePaymentCode(request.getPaymentDate()));
        payment.setCustomer(customer);
        payment.setPaymentDate(request.getPaymentDate());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setReferenceNo(request.getReferenceNo());
        payment.setNotes(request.getNotes());

        CustomerPayment savedPayment = customerPaymentRepository.save(payment);

        // Allocate payment to oldest unpaid sales first
        allocateCustomerPayment(savedPayment);

        auditService.log("CREATE_CUSTOMER_PAYMENT", "CUSTOMER_PAYMENT", savedPayment.getPaymentCode(), null,
                "Customer: " + customer.getName() + ", Amount: ₹" + request.getAmount() + ", Method: " + request.getPaymentMethod());

        return savedPayment;
    }

    private void allocateCustomerPayment(CustomerPayment payment) {
        BigDecimal remainingToAllocate = payment.getAmount();

        List<Sale> unpaidSales = saleRepository.findUnpaidSalesByCustomer(payment.getCustomer().getId());

        for (Sale sale : unpaidSales) {
            if (remainingToAllocate.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal saleBalance = sale.getBalanceAmount();
            BigDecimal amountToApply = remainingToAllocate.min(saleBalance);

            sale.setReceivedAmount(sale.getReceivedAmount().add(amountToApply));
            sale.setBalanceAmount(sale.getBalanceAmount().subtract(amountToApply));

            if (sale.getBalanceAmount().compareTo(BigDecimal.ZERO) <= 0) {
                sale.setStatus(PaymentStatus.PAID);
            } else {
                sale.setStatus(PaymentStatus.PARTIALLY_PAID);
            }
            saleRepository.save(sale);

            PaymentAllocation allocation = new PaymentAllocation();
            allocation.setCustomerPayment(payment);
            allocation.setSale(sale);
            allocation.setAmount(amountToApply);
            allocationRepository.save(allocation);

            remainingToAllocate = remainingToAllocate.subtract(amountToApply);
        }
    }

    public List<CustomerPayment> getPaymentsByDateRange(LocalDate startDate, LocalDate endDate) {
        return customerPaymentRepository.findByPaymentDateBetweenOrderByPaymentDateDescCreatedAtDesc(startDate, endDate);
    }

    public List<CustomerPayment> getCustomerPayments(Long customerId) {
        return customerPaymentRepository.findByCustomerIdOrderByPaymentDateAscCreatedAtAsc(customerId);
    }

    private String generatePaymentCode(LocalDate date) {
        String dateStr = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = customerPaymentRepository.count() + 1;
        return String.format("CPAY-%s-%04d", dateStr, count);
    }
}
