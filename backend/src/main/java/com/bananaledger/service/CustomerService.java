package com.bananaledger.service;

import com.bananaledger.dto.CustomerRequest;
import com.bananaledger.dto.CustomerSummaryDto;
import com.bananaledger.dto.LedgerEntryDto;
import com.bananaledger.entity.Customer;
import com.bananaledger.entity.CustomerPayment;
import com.bananaledger.entity.Sale;
import com.bananaledger.entity.enums.PaymentStatus;
import com.bananaledger.repository.CustomerPaymentRepository;
import com.bananaledger.repository.CustomerRepository;
import com.bananaledger.repository.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;
    private final CustomerPaymentRepository customerPaymentRepository;

    public CustomerService(CustomerRepository customerRepository,
                            SaleRepository saleRepository,
                            CustomerPaymentRepository customerPaymentRepository) {
        this.customerRepository = customerRepository;
        this.saleRepository = saleRepository;
        this.customerPaymentRepository = customerPaymentRepository;
    }

    @Transactional
    public Customer createCustomer(CustomerRequest request) {
        Customer customer = new Customer();
        customer.setCustomerCode(generateCustomerCode());
        customer.setName(request.getName());
        customer.setPhotoUrl(request.getPhotoUrl());
        customer.setPhone(request.getPhone());
        customer.setVillage(request.getVillage());
        customer.setArea(request.getArea());
        customer.setAddress(request.getAddress());
        customer.setNotes(request.getNotes());
        customer.setActive(request.getActive() != null ? request.getActive() : true);
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));

        if (request.getName() != null) customer.setName(request.getName());
        if (request.getPhotoUrl() != null) customer.setPhotoUrl(request.getPhotoUrl());
        if (request.getPhone() != null) customer.setPhone(request.getPhone());
        if (request.getVillage() != null) customer.setVillage(request.getVillage());
        if (request.getArea() != null) customer.setArea(request.getArea());
        if (request.getAddress() != null) customer.setAddress(request.getAddress());
        if (request.getNotes() != null) customer.setNotes(request.getNotes());
        if (request.getActive() != null) customer.setActive(request.getActive());

        return customerRepository.save(customer);
    }

    public List<CustomerSummaryDto> getAllCustomers(String search) {
        List<Customer> customers;
        if (search != null && !search.trim().isEmpty()) {
            customers = customerRepository.searchCustomers(search.trim());
        } else {
            customers = customerRepository.findAll();
        }

        List<CustomerSummaryDto> list = new ArrayList<>();
        for (Customer c : customers) {
            list.add(getCustomerSummary(c.getId()));
        }
        return list;
    }

    public CustomerSummaryDto getCustomerSummary(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));

        List<Sale> sales = saleRepository.findByCustomerIdOrderBySaleDateAscCreatedAtAsc(customerId);
        List<CustomerPayment> payments = customerPaymentRepository.findByCustomerIdOrderByPaymentDateAscCreatedAtAsc(customerId);

        int totalThars = 0;
        BigDecimal totalSalesAmount = BigDecimal.ZERO;
        BigDecimal totalReceivedAmount = BigDecimal.ZERO;
        LocalDate lastTransactionDate = null;

        for (Sale s : sales) {
            if (s.getStatus() != PaymentStatus.VOID) {
                totalThars += s.getThars();
                totalSalesAmount = totalSalesAmount.add(s.getTotalAmount());
                totalReceivedAmount = totalReceivedAmount.add(s.getReceivedAmount());
                if (lastTransactionDate == null || s.getSaleDate().isAfter(lastTransactionDate)) {
                    lastTransactionDate = s.getSaleDate();
                }
            }
        }

        for (CustomerPayment cp : payments) {
            if (lastTransactionDate == null || cp.getPaymentDate().isAfter(lastTransactionDate)) {
                lastTransactionDate = cp.getPaymentDate();
            }
        }

        BigDecimal outstandingBalance = totalSalesAmount.subtract(totalReceivedAmount);

        CustomerSummaryDto dto = new CustomerSummaryDto();
        dto.setId(customer.getId());
        dto.setCustomerCode(customer.getCustomerCode());
        dto.setName(customer.getName());
        dto.setPhotoUrl(customer.getPhotoUrl());
        dto.setPhone(customer.getPhone());
        dto.setVillage(customer.getVillage());
        dto.setArea(customer.getArea());
        dto.setAddress(customer.getAddress());
        dto.setNotes(customer.getNotes());
        dto.setActive(customer.isActive());
        dto.setTotalTharsSold(totalThars);
        dto.setTotalSalesAmount(totalSalesAmount);
        dto.setTotalReceivedAmount(totalReceivedAmount);
        dto.setOutstandingBalance(outstandingBalance);
        dto.setLastTransactionDate(lastTransactionDate);
        dto.setTransactionCount(sales.size() + payments.size());

        return dto;
    }

    public List<LedgerEntryDto> getCustomerLedger(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));

        List<Sale> sales = saleRepository.findByCustomerIdOrderBySaleDateAscCreatedAtAsc(customerId);
        List<CustomerPayment> payments = customerPaymentRepository.findByCustomerIdOrderByPaymentDateAscCreatedAtAsc(customerId);

        List<LedgerEntryDto> rawEntries = new ArrayList<>();

        for (Sale s : sales) {
            if (s.getStatus() == PaymentStatus.VOID) continue;

            LedgerEntryDto entry = new LedgerEntryDto();
            entry.setDate(s.getSaleDate());
            entry.setTransactionId(s.getTransactionId());
            entry.setType("SALE");
            entry.setDescription("Sale: " + s.getThars() + " Thars @ ₹" + s.getPricePerThar());
            entry.setThars(s.getThars());
            entry.setUnitPrice(s.getPricePerThar());
            entry.setDebit(s.getTotalAmount()); // New receivable added
            entry.setCredit(BigDecimal.ZERO);
            entry.setStatus(s.getStatus());
            entry.setNotes(s.getNotes());
            rawEntries.add(entry);

            if (s.getReceivedAmount().compareTo(BigDecimal.ZERO) > 0) {
                LedgerEntryDto payEntry = new LedgerEntryDto();
                payEntry.setDate(s.getSaleDate());
                payEntry.setTransactionId("CPAY-" + s.getTransactionId());
                payEntry.setType("RECEIPT");
                payEntry.setDescription("Payment for " + s.getTransactionId());
                payEntry.setDebit(BigDecimal.ZERO);
                payEntry.setCredit(s.getReceivedAmount());
                payEntry.setStatus(s.getStatus());
                payEntry.setNotes("Immediate payment on sale");
                rawEntries.add(payEntry);
            }
        }

        for (CustomerPayment cp : payments) {
            LedgerEntryDto entry = new LedgerEntryDto();
            entry.setDate(cp.getPaymentDate());
            entry.setTransactionId(cp.getPaymentCode());
            entry.setType("RECEIPT");
            entry.setDescription("Receipt via " + cp.getPaymentMethod() + (cp.getReferenceNo() != null ? " (" + cp.getReferenceNo() + ")" : ""));
            entry.setDebit(BigDecimal.ZERO);
            entry.setCredit(cp.getAmount());
            entry.setPaymentMethod(cp.getPaymentMethod());
            entry.setNotes(cp.getNotes());
            rawEntries.add(entry);
        }

        rawEntries.sort(Comparator.comparing(LedgerEntryDto::getDate));

        BigDecimal runningBalance = BigDecimal.ZERO;
        for (LedgerEntryDto entry : rawEntries) {
            runningBalance = runningBalance.add(entry.getDebit()).subtract(entry.getCredit());
            entry.setRunningBalance(runningBalance);
        }

        return rawEntries;
    }

    private String generateCustomerCode() {
        Integer maxSeq = customerRepository.findMaxCustomerCodeSeq();
        int nextSeq = (maxSeq != null) ? maxSeq + 1 : 1;
        return String.format("CUS-%04d", nextSeq);
    }
}
