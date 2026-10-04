package com.bananaledger.controller;

import com.bananaledger.dto.ApiResponse;
import com.bananaledger.dto.LedgerEntryDto;
import com.bananaledger.dto.QuickRepeatTemplateDto;
import com.bananaledger.dto.SupplierRequest;
import com.bananaledger.dto.SupplierSummaryDto;
import com.bananaledger.entity.Supplier;
import com.bananaledger.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final SupplierService supplierService;

    public VendorController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupplierSummaryDto>>> getAllVendors(
            @RequestParam(required = false) String search) {
        List<SupplierSummaryDto> vendors = supplierService.getAllSuppliers(search);
        return ResponseEntity.ok(ApiResponse.ok(vendors));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Supplier>> createVendor(@Valid @RequestBody SupplierRequest request) {
        Supplier vendor = supplierService.createSupplier(request);
        return ResponseEntity.ok(ApiResponse.ok("Vendor created successfully", vendor));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierSummaryDto>> getVendorSummary(@PathVariable Long id) {
        SupplierSummaryDto summary = supplierService.getSupplierSummary(id);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Supplier>> updateVendor(
            @PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        Supplier updated = supplierService.updateSupplier(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Vendor updated successfully", updated));
    }

    @GetMapping("/{id}/ledger")
    public ResponseEntity<ApiResponse<List<LedgerEntryDto>>> getVendorLedger(@PathVariable Long id) {
        List<LedgerEntryDto> ledger = supplierService.getSupplierLedger(id);
        return ResponseEntity.ok(ApiResponse.ok(ledger));
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<ApiResponse<Boolean>> toggleFavorite(@PathVariable Long id) {
        boolean isFav = supplierService.toggleFavorite(id);
        return ResponseEntity.ok(ApiResponse.ok("Favorite status updated", isFav));
    }

    @GetMapping("/{id}/last-purchase-template")
    public ResponseEntity<ApiResponse<QuickRepeatTemplateDto>> getQuickRepeatTemplate(@PathVariable Long id) {
        QuickRepeatTemplateDto template = supplierService.getQuickRepeatTemplate(id);
        return ResponseEntity.ok(ApiResponse.ok(template));
    }
}
