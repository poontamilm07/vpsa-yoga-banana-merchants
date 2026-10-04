package com.bananaledger.controller;

import com.bananaledger.dto.ApiResponse;
import com.bananaledger.dto.SupplierPaymentRequest;
import com.bananaledger.entity.SupplierPayment;
import com.bananaledger.service.SupplierPaymentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/supplier-payments")
public class SupplierPaymentController {

    private final SupplierPaymentService supplierPaymentService;

    public SupplierPaymentController(SupplierPaymentService supplierPaymentService) {
        this.supplierPaymentService = supplierPaymentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierPayment>> createPayment(@Valid @RequestBody SupplierPaymentRequest request) {
        SupplierPayment payment = supplierPaymentService.createPayment(request);
        return ResponseEntity.ok(ApiResponse.ok("Supplier payment recorded successfully", payment));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupplierPayment>>> getPayments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) startDate = LocalDate.now().minusDays(30);
        if (endDate == null) endDate = LocalDate.now();

        List<SupplierPayment> payments = supplierPaymentService.getPaymentsByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(payments));
    }
}
