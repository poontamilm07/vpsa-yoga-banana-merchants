package com.bananaledger.controller;

import com.bananaledger.dto.ApiResponse;
import com.bananaledger.dto.StockAdjustmentRequest;
import com.bananaledger.entity.InventoryTransaction;
import com.bananaledger.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/stock")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentStock() {
        Map<String, Object> summary = inventoryService.getStockSummary();
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/movements")
    public ResponseEntity<ApiResponse<List<InventoryTransaction>>> getStockMovements(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<InventoryTransaction> list = inventoryService.getStockMovements(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/adjust")
    public ResponseEntity<ApiResponse<InventoryTransaction>> addStockAdjustment(
            @Valid @RequestBody StockAdjustmentRequest request) {
        InventoryTransaction tx = inventoryService.addStockAdjustment(request);
        return ResponseEntity.ok(ApiResponse.ok("Stock adjustment saved successfully", tx));
    }
}
