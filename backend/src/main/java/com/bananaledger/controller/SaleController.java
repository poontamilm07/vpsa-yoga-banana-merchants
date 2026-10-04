package com.bananaledger.controller;

import com.bananaledger.dto.ApiResponse;
import com.bananaledger.dto.SaleRequest;
import com.bananaledger.entity.Sale;
import com.bananaledger.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Sale>> createSale(@Valid @RequestBody SaleRequest request) {
        Sale sale = saleService.createSale(request);
        return ResponseEntity.ok(ApiResponse.ok("Sale recorded successfully", sale));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Sale>>> getSales(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) startDate = LocalDate.now().minusDays(30);
        if (endDate == null) endDate = LocalDate.now();

        List<Sale> sales = saleService.getSalesByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(sales));
    }

    @GetMapping("/last-customer-sale/{customerId}")
    public ResponseEntity<ApiResponse<Sale>> getLastCustomerSale(@PathVariable Long customerId) {
        Sale lastSale = saleService.getLastCustomerSale(customerId);
        return ResponseEntity.ok(ApiResponse.ok(lastSale));
    }

    @PostMapping("/{id}/void")
    public ResponseEntity<ApiResponse<Sale>> voidSale(
            @PathVariable Long id, @RequestParam(defaultValue = "Transaction voided by user") String reason) {
        Sale voided = saleService.voidSale(id, reason);
        return ResponseEntity.ok(ApiResponse.ok("Sale voided successfully", voided));
    }
}
