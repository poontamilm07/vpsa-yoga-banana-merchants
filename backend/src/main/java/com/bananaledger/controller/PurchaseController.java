package com.bananaledger.controller;

import com.bananaledger.dto.ApiResponse;
import com.bananaledger.dto.PurchaseRequest;
import com.bananaledger.entity.Purchase;
import com.bananaledger.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Purchase>> createPurchase(@Valid @RequestBody PurchaseRequest request) {
        Purchase purchase = purchaseService.createPurchase(request);
        return ResponseEntity.ok(ApiResponse.ok("Purchase recorded successfully", purchase));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Purchase>>> getPurchases(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) startDate = LocalDate.now().minusDays(30);
        if (endDate == null) endDate = LocalDate.now();

        List<Purchase> purchases = purchaseService.getPurchasesByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(purchases));
    }

    @PostMapping("/{id}/void")
    public ResponseEntity<ApiResponse<Purchase>> voidPurchase(
            @PathVariable Long id, @RequestParam(defaultValue = "Transaction voided by user") String reason) {
        Purchase voided = purchaseService.voidPurchase(id, reason);
        return ResponseEntity.ok(ApiResponse.ok("Purchase voided successfully", voided));
    }
}
