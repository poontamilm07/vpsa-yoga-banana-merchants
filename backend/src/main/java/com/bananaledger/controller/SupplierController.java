package com.bananaledger.controller;

import com.bananaledger.dto.ApiResponse;
import com.bananaledger.dto.LedgerEntryDto;
import com.bananaledger.dto.SupplierRequest;
import com.bananaledger.dto.SupplierSummaryDto;
import com.bananaledger.entity.Supplier;
import com.bananaledger.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupplierSummaryDto>>> getAllSuppliers(
            @RequestParam(required = false) String search) {
        List<SupplierSummaryDto> suppliers = supplierService.getAllSuppliers(search);
        return ResponseEntity.ok(ApiResponse.ok(suppliers));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Supplier>> createSupplier(@Valid @RequestBody SupplierRequest request) {
        Supplier supplier = supplierService.createSupplier(request);
        return ResponseEntity.ok(ApiResponse.ok("Supplier created successfully", supplier));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierSummaryDto>> getSupplierSummary(@PathVariable Long id) {
        SupplierSummaryDto summary = supplierService.getSupplierSummary(id);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Supplier>> updateSupplier(
            @PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        Supplier updated = supplierService.updateSupplier(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Supplier updated successfully", updated));
    }

    @GetMapping("/{id}/ledger")
    public ResponseEntity<ApiResponse<List<LedgerEntryDto>>> getSupplierLedger(@PathVariable Long id) {
        List<LedgerEntryDto> ledger = supplierService.getSupplierLedger(id);
        return ResponseEntity.ok(ApiResponse.ok(ledger));
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<ApiResponse<Boolean>> toggleFavorite(@PathVariable Long id) {
        boolean isFav = supplierService.toggleFavorite(id);
        return ResponseEntity.ok(ApiResponse.ok("Favorite status updated", isFav));
    }

    @GetMapping("/{id}/last-purchase-template")
    public ResponseEntity<ApiResponse<com.bananaledger.dto.QuickRepeatTemplateDto>> getQuickRepeatTemplate(@PathVariable Long id) {
        com.bananaledger.dto.QuickRepeatTemplateDto template = supplierService.getQuickRepeatTemplate(id);
        return ResponseEntity.ok(ApiResponse.ok(template));
    }
}
