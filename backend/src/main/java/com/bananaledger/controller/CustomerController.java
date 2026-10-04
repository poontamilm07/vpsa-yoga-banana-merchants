package com.bananaledger.controller;

import com.bananaledger.dto.ApiResponse;
import com.bananaledger.dto.CustomerRequest;
import com.bananaledger.dto.CustomerSummaryDto;
import com.bananaledger.dto.LedgerEntryDto;
import com.bananaledger.entity.Customer;
import com.bananaledger.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerSummaryDto>>> getAllCustomers(
            @RequestParam(required = false) String search) {
        List<CustomerSummaryDto> customers = customerService.getAllCustomers(search);
        return ResponseEntity.ok(ApiResponse.ok(customers));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Customer>> createCustomer(@Valid @RequestBody CustomerRequest request) {
        Customer customer = customerService.createCustomer(request);
        return ResponseEntity.ok(ApiResponse.ok("Customer created successfully", customer));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerSummaryDto>> getCustomerSummary(@PathVariable Long id) {
        CustomerSummaryDto summary = customerService.getCustomerSummary(id);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> updateCustomer(
            @PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        Customer updated = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Customer updated successfully", updated));
    }

    @GetMapping("/{id}/ledger")
    public ResponseEntity<ApiResponse<List<LedgerEntryDto>>> getCustomerLedger(@PathVariable Long id) {
        List<LedgerEntryDto> ledger = customerService.getCustomerLedger(id);
        return ResponseEntity.ok(ApiResponse.ok(ledger));
    }
}
