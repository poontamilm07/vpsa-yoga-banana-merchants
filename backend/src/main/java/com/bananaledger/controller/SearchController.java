package com.bananaledger.controller;

import com.bananaledger.dto.ApiResponse;
import com.bananaledger.dto.CustomerSummaryDto;
import com.bananaledger.dto.SupplierSummaryDto;
import com.bananaledger.entity.Purchase;
import com.bananaledger.entity.Sale;
import com.bananaledger.service.CustomerService;
import com.bananaledger.service.PurchaseService;
import com.bananaledger.service.SaleService;
import com.bananaledger.service.SupplierService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SupplierService supplierService;
    private final CustomerService customerService;
    private final PurchaseService purchaseService;
    private final SaleService saleService;

    public SearchController(SupplierService supplierService,
                            CustomerService customerService,
                            PurchaseService purchaseService,
                            SaleService saleService) {
        this.supplierService = supplierService;
        this.customerService = customerService;
        this.purchaseService = purchaseService;
        this.saleService = saleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> globalSearch(@RequestParam String q) {
        Map<String, Object> results = new HashMap<>();

        if (q == null || q.trim().isEmpty()) {
            results.put("suppliers", List.of());
            results.put("customers", List.of());
            return ResponseEntity.ok(ApiResponse.ok(results));
        }

        List<SupplierSummaryDto> suppliers = supplierService.getAllSuppliers(q);
        List<CustomerSummaryDto> customers = customerService.getAllCustomers(q);

        results.put("suppliers", suppliers);
        results.put("customers", customers);

        return ResponseEntity.ok(ApiResponse.ok(results));
    }
}
