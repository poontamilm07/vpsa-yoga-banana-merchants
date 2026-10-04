package com.bananaledger.controller;

import com.bananaledger.dto.ApiResponse;
import com.bananaledger.dto.CustomerPaymentRequest;
import com.bananaledger.entity.CustomerPayment;
import com.bananaledger.service.CustomerPaymentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/customer-payments")
public class CustomerPaymentController {

    private final CustomerPaymentService customerPaymentService;

    public CustomerPaymentController(CustomerPaymentService customerPaymentService) {
        this.customerPaymentService = customerPaymentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerPayment>> createPayment(@Valid @RequestBody CustomerPaymentRequest request) {
        CustomerPayment payment = customerPaymentService.createPayment(request);
        return ResponseEntity.ok(ApiResponse.ok("Customer payment recorded successfully", payment));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerPayment>>> getPayments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) startDate = LocalDate.now().minusDays(30);
        if (endDate == null) endDate = LocalDate.now();

        List<CustomerPayment> payments = customerPaymentService.getPaymentsByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(payments));
    }
}
