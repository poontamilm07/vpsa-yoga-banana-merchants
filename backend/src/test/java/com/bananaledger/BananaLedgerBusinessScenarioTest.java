package com.bananaledger;

import com.bananaledger.dto.*;
import com.bananaledger.entity.Supplier;
import com.bananaledger.entity.enums.PaymentMethod;
import com.bananaledger.service.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class BananaLedgerBusinessScenarioTest {

    @Autowired
    private SupplierService supplierService;

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private SupplierPaymentService supplierPaymentService;

    @Test
    @DisplayName("Master Prompt Section 39: Exact Kumar 3-Day Test Scenario")
    public void testMasterPromptKumar3DayScenario() {
        LocalDate day1 = LocalDate.of(2026, 9, 20);
        LocalDate day2 = LocalDate.of(2026, 9, 21);
        LocalDate day3 = LocalDate.of(2026, 9, 22);

        // Create Vendor Kumar
        SupplierRequest kumarReq = new SupplierRequest();
        kumarReq.setName("Kumar Master Vendor");
        kumarReq.setPhone("9876543210");
        kumarReq.setWhatsappNumber("9876543210");
        kumarReq.setVillage("Namakkal");
        Supplier kumar = supplierService.createSupplier(kumarReq);

        // DAY 1: 20 Thars @ ₹500 = ₹10,000. Paid ₹5,000. Balance = ₹5,000
        PurchaseRequest p1Req = new PurchaseRequest();
        p1Req.setSupplierId(kumar.getId());
        p1Req.setPurchaseDate(day1);
        p1Req.setThars(20);
        p1Req.setPricePerThar(new BigDecimal("500"));
        p1Req.setPaymentNow(new BigDecimal("5000"));
        p1Req.setPaymentMethod(PaymentMethod.CASH);
        purchaseService.createPurchase(p1Req);

        SupplierSummaryDto d1Summary = supplierService.getSupplierSummary(kumar.getId());
        assertEquals(20, d1Summary.getTotalTharsPurchased());
        assertEquals(new BigDecimal("10000.00"), d1Summary.getTotalPurchaseAmount());
        assertEquals(new BigDecimal("5000.00"), d1Summary.getTotalPaidAmount());
        assertEquals(new BigDecimal("5000.00"), d1Summary.getOutstandingBalance());

        // DAY 2: 30 Thars @ ₹550 = ₹16,500. Previous ₹5,000. Total due ₹21,500. Pay ₹10,000. Balance = ₹11,500
        PurchaseRequest p2Req = new PurchaseRequest();
        p2Req.setSupplierId(kumar.getId());
        p2Req.setPurchaseDate(day2);
        p2Req.setThars(30);
        p2Req.setPricePerThar(new BigDecimal("550"));
        p2Req.setPaymentNow(new BigDecimal("10000"));
        p2Req.setPaymentMethod(PaymentMethod.UPI);
        purchaseService.createPurchase(p2Req);

        SupplierSummaryDto d2Summary = supplierService.getSupplierSummary(kumar.getId());
        assertEquals(50, d2Summary.getTotalTharsPurchased());
        assertEquals(new BigDecimal("26500.00"), d2Summary.getTotalPurchaseAmount());
        assertEquals(new BigDecimal("15000.00"), d2Summary.getTotalPaidAmount());
        assertEquals(new BigDecimal("11500.00"), d2Summary.getOutstandingBalance());

        // DAY 3: 20 Thars @ ₹600 = ₹12,000. Previous ₹11,500. Total due ₹23,500. Pay ₹20,000. Final Balance = ₹3,500
        PurchaseRequest p3Req = new PurchaseRequest();
        p3Req.setSupplierId(kumar.getId());
        p3Req.setPurchaseDate(day3);
        p3Req.setThars(20);
        p3Req.setPricePerThar(new BigDecimal("600"));
        p3Req.setPaymentNow(new BigDecimal("20000"));
        p3Req.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        purchaseService.createPurchase(p3Req);

        SupplierSummaryDto d3Summary = supplierService.getSupplierSummary(kumar.getId());
        assertEquals(70, d3Summary.getTotalTharsPurchased());
        assertEquals(new BigDecimal("38500.00"), d3Summary.getTotalPurchaseAmount());
        assertEquals(new BigDecimal("35000.00"), d3Summary.getTotalPaidAmount());
        assertEquals(new BigDecimal("3500.00"), d3Summary.getOutstandingBalance()); // Must be EXACTLY ₹3,500!

        // Rate analytics verification
        assertEquals(0, new BigDecimal("600.00").compareTo(d3Summary.getLastRate()));
        assertEquals(0, new BigDecimal("600.00").compareTo(d3Summary.getHighestRate()));
        assertEquals(0, new BigDecimal("500.00").compareTo(d3Summary.getLowestRate()));
    }

    @Test
    @DisplayName("Master Prompt Section 40: 10-Vendor Multi-Day Test Scenario")
    public void testMasterPrompt10VendorScenario() {
        LocalDate day1 = LocalDate.of(2026, 9, 20);
        LocalDate day2 = LocalDate.of(2026, 9, 21);

        List<Supplier> day1Vendors = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            SupplierRequest req = new SupplierRequest();
            req.setName("Vendor " + i);
            req.setPhone("980000000" + i);
            Supplier vendor = supplierService.createSupplier(req);
            day1Vendors.add(vendor);

            // Purchase 20 Thars @ ₹500 = ₹10,000
            BigDecimal payNow;
            if (i % 3 == 1) payNow = new BigDecimal("10000"); // Full payment
            else if (i % 3 == 2) payNow = new BigDecimal("4000"); // Partial payment
            else payNow = BigDecimal.ZERO; // No payment

            PurchaseRequest purReq = new PurchaseRequest();
            purReq.setSupplierId(vendor.getId());
            purReq.setPurchaseDate(day1);
            purReq.setThars(20);
            purReq.setPricePerThar(new BigDecimal("500"));
            purReq.setPaymentNow(payNow);
            purchaseService.createPurchase(purReq);
        }

        // Day 2: Add 5 new vendors (should start at ₹0 balance)
        for (int i = 11; i <= 15; i++) {
            SupplierRequest req = new SupplierRequest();
            req.setName("New Vendor " + i);
            Supplier newVendor = supplierService.createSupplier(req);
            SupplierSummaryDto summary = supplierService.getSupplierSummary(newVendor.getId());
            assertEquals(BigDecimal.ZERO, summary.getOutstandingBalance(), "New vendor must start at ₹0 balance");
        }

        List<SupplierSummaryDto> allVendors = supplierService.getAllSuppliers(null);
        assertTrue(allVendors.size() >= 15, "Should have at least 15 vendors");
    }

    @Test
    @DisplayName("Financial Consistency Test: Total Purchased - Total Paid = Outstanding Balance in Summary & Ledger")
    public void testFinancialConsistencyAndLedgerMatching() {
        LocalDate today = LocalDate.now();

        SupplierRequest req = new SupplierRequest();
        req.setName("Consistency Test Vendor");
        Supplier vendor = supplierService.createSupplier(req);

        // Transaction 1: Purchase 50 Thars @ ₹1000 = ₹50,000, Pay ₹25,000
        PurchaseRequest p1 = new PurchaseRequest();
        p1.setSupplierId(vendor.getId());
        p1.setPurchaseDate(today);
        p1.setThars(50);
        p1.setPricePerThar(new BigDecimal("1000"));
        p1.setPaymentNow(new BigDecimal("25000"));
        purchaseService.createPurchase(p1);

        // Transaction 2: Payment ₹15,000
        SupplierPaymentRequest pay = new SupplierPaymentRequest();
        pay.setSupplierId(vendor.getId());
        pay.setPaymentDate(today);
        pay.setAmount(new BigDecimal("15000"));
        pay.setPaymentMethod(PaymentMethod.UPI);
        supplierPaymentService.createPayment(pay);

        // Transaction 3: Purchase 20 Thars @ ₹500 = ₹10,000, Pay ₹5,000
        PurchaseRequest p2 = new PurchaseRequest();
        p2.setSupplierId(vendor.getId());
        p2.setPurchaseDate(today);
        p2.setThars(20);
        p2.setPricePerThar(new BigDecimal("500"));
        p2.setPaymentNow(new BigDecimal("5000"));
        purchaseService.createPurchase(p2);

        SupplierSummaryDto summary = supplierService.getSupplierSummary(vendor.getId());
        List<LedgerEntryDto> ledger = supplierService.getSupplierLedger(vendor.getId());

        BigDecimal expectedPurchases = new BigDecimal("60000.00"); // 50000 + 10000
        BigDecimal expectedPaid = new BigDecimal("45000.00");     // 25000 + 15000 + 5000
        BigDecimal expectedOutstanding = new BigDecimal("15000.00"); // 60000 - 45000

        assertEquals(0, expectedPurchases.compareTo(summary.getTotalPurchaseAmount()), "Total Purchased mismatch in Summary");
        assertEquals(0, expectedPaid.compareTo(summary.getTotalPaidAmount()), "Total Paid mismatch in Summary");
        assertEquals(0, expectedOutstanding.compareTo(summary.getOutstandingBalance()), "Outstanding Balance mismatch in Summary");

        assertFalse(ledger.isEmpty(), "Ledger should not be empty");
        LedgerEntryDto lastEntry = ledger.get(ledger.size() - 1);
        assertEquals(0, expectedOutstanding.compareTo(lastEntry.getRunningBalance()), "Ledger running balance mismatch with summary outstanding balance");
    }

    @Test
    @DisplayName("Section 14 — TEST 1: Purchase 20 Thars @ ₹500 = ₹10,000, Payment ₹5,000 -> Outstanding ₹5,000")
    public void testScenario1_PurchaseAndPartialPayment() {
        SupplierRequest req = new SupplierRequest();
        req.setName("Test 1 Vendor");
        Supplier vendor = supplierService.createSupplier(req);

        PurchaseRequest p1 = new PurchaseRequest();
        p1.setSupplierId(vendor.getId());
        p1.setPurchaseDate(LocalDate.now());
        p1.setThars(20);
        p1.setPricePerThar(new BigDecimal("500"));
        p1.setPaymentNow(new BigDecimal("5000"));
        p1.setPaymentMethod(PaymentMethod.CASH);
        purchaseService.createPurchase(p1);

        SupplierSummaryDto summary = supplierService.getSupplierSummary(vendor.getId());
        assertEquals(0, new BigDecimal("10000.00").compareTo(summary.getTotalPurchaseAmount()));
        assertEquals(0, new BigDecimal("5000.00").compareTo(summary.getTotalPaidAmount()));
        assertEquals(0, new BigDecimal("5000.00").compareTo(summary.getOutstandingBalance()));
    }

    @Test
    @DisplayName("Section 14 — TEST 2: Previous ₹5,000 + Purchase 30 @ ₹550 (₹16,500) = ₹21,500 - Payment ₹10,000 = ₹11,500")
    public void testScenario2_CumulativePurchaseAndPayment() {
        SupplierRequest req = new SupplierRequest();
        req.setName("Test 2 Vendor");
        Supplier vendor = supplierService.createSupplier(req);

        // Day 1
        PurchaseRequest p1 = new PurchaseRequest();
        p1.setSupplierId(vendor.getId());
        p1.setPurchaseDate(LocalDate.now().minusDays(1));
        p1.setThars(20);
        p1.setPricePerThar(new BigDecimal("500"));
        p1.setPaymentNow(new BigDecimal("5000"));
        purchaseService.createPurchase(p1);

        // Day 2
        PurchaseRequest p2 = new PurchaseRequest();
        p2.setSupplierId(vendor.getId());
        p2.setPurchaseDate(LocalDate.now());
        p2.setThars(30);
        p2.setPricePerThar(new BigDecimal("550"));
        p2.setPaymentNow(new BigDecimal("10000"));
        p2.setPaymentMethod(PaymentMethod.UPI);
        purchaseService.createPurchase(p2);

        SupplierSummaryDto summary = supplierService.getSupplierSummary(vendor.getId());
        assertEquals(0, new BigDecimal("26500.00").compareTo(summary.getTotalPurchaseAmount()));
        assertEquals(0, new BigDecimal("15000.00").compareTo(summary.getTotalPaidAmount()));
        assertEquals(0, new BigDecimal("11500.00").compareTo(summary.getOutstandingBalance()));
    }

    @Test
    @DisplayName("Section 14 — TEST 3: Previous ₹11,500 + Purchase 20 @ ₹600 (₹12,000) = ₹23,500 - Payment ₹20,000 = ₹3,500")
    public void testScenario3_MultiDayFinalBalance() {
        SupplierRequest req = new SupplierRequest();
        req.setName("Test 3 Vendor");
        Supplier vendor = supplierService.createSupplier(req);

        // Day 1
        PurchaseRequest p1 = new PurchaseRequest();
        p1.setSupplierId(vendor.getId());
        p1.setPurchaseDate(LocalDate.now().minusDays(2));
        p1.setThars(20);
        p1.setPricePerThar(new BigDecimal("500"));
        p1.setPaymentNow(new BigDecimal("5000"));
        purchaseService.createPurchase(p1);

        // Day 2
        PurchaseRequest p2 = new PurchaseRequest();
        p2.setSupplierId(vendor.getId());
        p2.setPurchaseDate(LocalDate.now().minusDays(1));
        p2.setThars(30);
        p2.setPricePerThar(new BigDecimal("550"));
        p2.setPaymentNow(new BigDecimal("10000"));
        purchaseService.createPurchase(p2);

        // Day 3
        PurchaseRequest p3 = new PurchaseRequest();
        p3.setSupplierId(vendor.getId());
        p3.setPurchaseDate(LocalDate.now());
        p3.setThars(20);
        p3.setPricePerThar(new BigDecimal("600"));
        p3.setPaymentNow(new BigDecimal("20000"));
        purchaseService.createPurchase(p3);

        SupplierSummaryDto summary = supplierService.getSupplierSummary(vendor.getId());
        assertEquals(0, new BigDecimal("38500.00").compareTo(summary.getTotalPurchaseAmount()));
        assertEquals(0, new BigDecimal("35000.00").compareTo(summary.getTotalPaidAmount()));
        assertEquals(0, new BigDecimal("3500.00").compareTo(summary.getOutstandingBalance()));
    }

    @Test
    @DisplayName("Section 14 — TEST 4: Overpayment Rejection (Outstanding ₹8,500, Payment ₹10,000 -> Rejected)")
    public void testScenario4_OverpaymentRejection() {
        SupplierRequest req = new SupplierRequest();
        req.setName("Test 4 Vendor");
        Supplier vendor = supplierService.createSupplier(req);

        // Create purchase resulting in ₹8,500 outstanding
        PurchaseRequest p1 = new PurchaseRequest();
        p1.setSupplierId(vendor.getId());
        p1.setPurchaseDate(LocalDate.now());
        p1.setThars(17);
        p1.setPricePerThar(new BigDecimal("500")); // ₹8,500
        p1.setPaymentNow(BigDecimal.ZERO);
        purchaseService.createPurchase(p1);

        SupplierSummaryDto initialSummary = supplierService.getSupplierSummary(vendor.getId());
        assertEquals(0, new BigDecimal("8500.00").compareTo(initialSummary.getOutstandingBalance()));

        // Attempt overpayment of ₹10,000
        SupplierPaymentRequest overpay = new SupplierPaymentRequest();
        overpay.setSupplierId(vendor.getId());
        overpay.setPaymentDate(LocalDate.now());
        overpay.setAmount(new BigDecimal("10000"));
        overpay.setPaymentMethod(PaymentMethod.CASH);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            supplierPaymentService.createPayment(overpay);
        });

        assertTrue(exception.getMessage().contains("cannot exceed the outstanding amount"), "Error message should inform of overpayment restriction");

        // Verify balance remains ₹8,500 and never negative
        SupplierSummaryDto postSummary = supplierService.getSupplierSummary(vendor.getId());
        assertEquals(0, new BigDecimal("8500.00").compareTo(postSummary.getOutstandingBalance()));
    }

    @Test
    @DisplayName("Section 14 — TEST 5: FIFO Payment Allocation (Purchase 1 = ₹10,000, Purchase 2 = ₹16,500, Payment = ₹12,000)")
    public void testScenario5_FifoPaymentAllocation() {
        SupplierRequest req = new SupplierRequest();
        req.setName("Test 5 Vendor");
        Supplier vendor = supplierService.createSupplier(req);

        // Purchase 1 = ₹10,000
        PurchaseRequest p1 = new PurchaseRequest();
        p1.setSupplierId(vendor.getId());
        p1.setPurchaseDate(LocalDate.now().minusDays(1));
        p1.setThars(20);
        p1.setPricePerThar(new BigDecimal("500"));
        p1.setPaymentNow(BigDecimal.ZERO);
        com.bananaledger.entity.Purchase pur1 = purchaseService.createPurchase(p1);

        // Purchase 2 = ₹16,500
        PurchaseRequest p2 = new PurchaseRequest();
        p2.setSupplierId(vendor.getId());
        p2.setPurchaseDate(LocalDate.now());
        p2.setThars(30);
        p2.setPricePerThar(new BigDecimal("550"));
        p2.setPaymentNow(BigDecimal.ZERO);
        com.bananaledger.entity.Purchase pur2 = purchaseService.createPurchase(p2);

        // Payment = ₹12,000
        SupplierPaymentRequest payReq = new SupplierPaymentRequest();
        payReq.setSupplierId(vendor.getId());
        payReq.setPaymentDate(LocalDate.now());
        payReq.setAmount(new BigDecimal("12000"));
        payReq.setPaymentMethod(PaymentMethod.UPI);
        supplierPaymentService.createPayment(payReq);

        // Reload purchases to check balances
        com.bananaledger.entity.Purchase updatedPur1 = purchaseService.getPurchaseByTxId(pur1.getTransactionId());
        com.bananaledger.entity.Purchase updatedPur2 = purchaseService.getPurchaseByTxId(pur2.getTransactionId());

        assertEquals(0, BigDecimal.ZERO.compareTo(updatedPur1.getBalanceAmount()), "Purchase 1 should be fully paid (remaining ₹0)");
        assertEquals(0, new BigDecimal("14500.00").compareTo(updatedPur2.getBalanceAmount()), "Purchase 2 should have ₹14,500 balance remaining");

        SupplierSummaryDto summary = supplierService.getSupplierSummary(vendor.getId());
        assertEquals(0, new BigDecimal("14500.00").compareTo(summary.getOutstandingBalance()), "Vendor outstanding should be ₹14,500");
    }

    @Test
    @DisplayName("Section 14 — TEST 6: Multiple Vendors Isolation (Vendor A actions never affect Vendor B)")
    public void testScenario6_MultiVendorDataIsolation() {
        SupplierRequest reqA = new SupplierRequest();
        reqA.setName("Vendor A");
        Supplier vendorA = supplierService.createSupplier(reqA);

        SupplierRequest reqB = new SupplierRequest();
        reqB.setName("Vendor B");
        Supplier vendorB = supplierService.createSupplier(reqB);

        // Purchase & Pay for Vendor A
        PurchaseRequest pA = new PurchaseRequest();
        pA.setSupplierId(vendorA.getId());
        pA.setPurchaseDate(LocalDate.now());
        pA.setThars(10);
        pA.setPricePerThar(new BigDecimal("500"));
        pA.setPaymentNow(new BigDecimal("2000"));
        purchaseService.createPurchase(pA);

        SupplierSummaryDto summaryA = supplierService.getSupplierSummary(vendorA.getId());
        SupplierSummaryDto summaryB = supplierService.getSupplierSummary(vendorB.getId());

        assertEquals(0, new BigDecimal("3000.00").compareTo(summaryA.getOutstandingBalance()));
        assertEquals(0, BigDecimal.ZERO.compareTo(summaryB.getOutstandingBalance()), "Vendor B balance must remain unaffected at ₹0");
    }

    @Test
    @DisplayName("Validation Scenarios A & B: Valid purchase payment calculation (partial and full payment)")
    public void testPaymentValidationScenariosAandB() {
        SupplierRequest req = new SupplierRequest();
        req.setName("Val Test Vendor AB");
        Supplier vendor = supplierService.createSupplier(req);

        // Initial state: Give initial purchase of ₹7,000 with ₹0 payment -> Outstanding = ₹7,000
        PurchaseRequest pInitial = new PurchaseRequest();
        pInitial.setSupplierId(vendor.getId());
        pInitial.setPurchaseDate(LocalDate.now());
        pInitial.setThars(14);
        pInitial.setPricePerThar(new BigDecimal("500"));
        pInitial.setPaymentNow(BigDecimal.ZERO);
        purchaseService.createPurchase(pInitial);

        SupplierSummaryDto s0 = supplierService.getSupplierSummary(vendor.getId());
        assertEquals(0, new BigDecimal("7000.00").compareTo(s0.getOutstandingBalance()));

        // TEST A: Outstanding = ₹7,000, New Purchase = ₹12,000 (20 Thars @ ₹600), Payment = ₹5,000
        // Expected: Total Payable = ₹19,000, New Outstanding = ₹14,000
        PurchaseRequest pA = new PurchaseRequest();
        pA.setSupplierId(vendor.getId());
        pA.setPurchaseDate(LocalDate.now());
        pA.setThars(20);
        pA.setPricePerThar(new BigDecimal("600"));
        pA.setPaymentNow(new BigDecimal("5000"));
        purchaseService.createPurchase(pA);

        SupplierSummaryDto sA = supplierService.getSupplierSummary(vendor.getId());
        assertEquals(0, new BigDecimal("14000.00").compareTo(sA.getOutstandingBalance()), "New Outstanding after Test A must be ₹14,000");

        // TEST B: Outstanding = ₹14,000, New Purchase = ₹12,000 (20 Thars @ ₹600), Payment = Total Payable = ₹26,000
        // Let's test with Outstanding = ₹7,000, New Purchase = ₹12,000, Payment = ₹19,000 on fresh vendor
        SupplierRequest reqB = new SupplierRequest();
        reqB.setName("Val Test Vendor B Only");
        Supplier vendorB = supplierService.createSupplier(reqB);

        PurchaseRequest pBInit = new PurchaseRequest();
        pBInit.setSupplierId(vendorB.getId());
        pBInit.setPurchaseDate(LocalDate.now());
        pBInit.setThars(14);
        pBInit.setPricePerThar(new BigDecimal("500"));
        pBInit.setPaymentNow(BigDecimal.ZERO);
        purchaseService.createPurchase(pBInit);

        PurchaseRequest pB = new PurchaseRequest();
        pB.setSupplierId(vendorB.getId());
        pB.setPurchaseDate(LocalDate.now());
        pB.setThars(20);
        pB.setPricePerThar(new BigDecimal("600"));
        pB.setPaymentNow(new BigDecimal("19000")); // Full clear of Total Payable ₹19,000
        purchaseService.createPurchase(pB);

        SupplierSummaryDto sB = supplierService.getSupplierSummary(vendorB.getId());
        assertEquals(0, BigDecimal.ZERO.compareTo(sB.getOutstandingBalance()), "Outstanding balance after Test B must be ₹0");
    }

    @Test
    @DisplayName("Validation Scenario C: Purchase Payment > Total Payable throws IllegalArgumentException")
    public void testPaymentValidationScenarioC() {
        SupplierRequest req = new SupplierRequest();
        req.setName("Val Test Vendor C");
        Supplier vendor = supplierService.createSupplier(req);

        // Previous Outstanding = ₹7,000
        PurchaseRequest pInit = new PurchaseRequest();
        pInit.setSupplierId(vendor.getId());
        pInit.setPurchaseDate(LocalDate.now());
        pInit.setThars(14);
        pInit.setPricePerThar(new BigDecimal("500"));
        pInit.setPaymentNow(BigDecimal.ZERO);
        purchaseService.createPurchase(pInit);

        // New Purchase = ₹12,000. Total Payable = ₹19,000. Attempt Payment = ₹20,000
        PurchaseRequest pC = new PurchaseRequest();
        pC.setSupplierId(vendor.getId());
        pC.setPurchaseDate(LocalDate.now());
        pC.setThars(20);
        pC.setPricePerThar(new BigDecimal("600"));
        pC.setPaymentNow(new BigDecimal("20000"));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            purchaseService.createPurchase(pC);
        });

        assertTrue(ex.getMessage().contains("Payment amount ₹20,000 is higher than the total payable amount ₹19,000."), 
                "Exception message must match expected: " + ex.getMessage());

        // Verify balance remains ₹7,000
        SupplierSummaryDto summary = supplierService.getSupplierSummary(vendor.getId());
        assertEquals(0, new BigDecimal("7000.00").compareTo(summary.getOutstandingBalance()), "Outstanding must remain ₹7,000 after rejected purchase");
    }

    @Test
    @DisplayName("Validation Scenario D: Standalone Supplier Payment > Current Outstanding throws IllegalArgumentException")
    public void testPaymentValidationScenarioD() {
        SupplierRequest req = new SupplierRequest();
        req.setName("Val Test Vendor D");
        Supplier vendor = supplierService.createSupplier(req);

        // Outstanding = ₹17,000
        PurchaseRequest pInit = new PurchaseRequest();
        pInit.setSupplierId(vendor.getId());
        pInit.setPurchaseDate(LocalDate.now());
        pInit.setThars(34);
        pInit.setPricePerThar(new BigDecimal("500"));
        pInit.setPaymentNow(BigDecimal.ZERO);
        purchaseService.createPurchase(pInit);

        SupplierSummaryDto sInit = supplierService.getSupplierSummary(vendor.getId());
        assertEquals(0, new BigDecimal("17000.00").compareTo(sInit.getOutstandingBalance()));

        // Attempt standalone payment = ₹20,000
        SupplierPaymentRequest payReq = new SupplierPaymentRequest();
        payReq.setSupplierId(vendor.getId());
        payReq.setPaymentDate(LocalDate.now());
        payReq.setAmount(new BigDecimal("20000"));
        payReq.setPaymentMethod(PaymentMethod.CASH);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            supplierPaymentService.createPayment(payReq);
        });

        assertTrue(ex.getMessage().contains("Payment amount ₹20,000 cannot exceed the outstanding amount ₹17,000."),
                "Exception message must match expected: " + ex.getMessage());

        // Verify balance remains ₹17,000
        SupplierSummaryDto summary = supplierService.getSupplierSummary(vendor.getId());
        assertEquals(0, new BigDecimal("17000.00").compareTo(summary.getOutstandingBalance()), "Outstanding must remain ₹17,000 after rejected payment");
    }

    @Test
    @DisplayName("Master Prompt Section 8 & 9: Exact KG Calculation (Total = Net - LS) and Discount Test")
    public void testKgCalculationFormulaSection8And9() {
        SupplierRequest req = new SupplierRequest();
        req.setName("KG Formula Test Vendor");
        Supplier vendor = supplierService.createSupplier(req);

        // TEST 1 (Section 8): Net = 100, LS = 10, Rate = 30, Discount = 200, Previous = 0, Payment = 0
        PurchaseRequest p1 = new PurchaseRequest();
        p1.setSupplierId(vendor.getId());
        p1.setPurchaseDate(LocalDate.now());
        p1.setNetWeightKg(new BigDecimal("100"));
        p1.setLsWeightKg(new BigDecimal("10"));
        p1.setRatePerKg(new BigDecimal("30"));
        p1.setDiscountAmount(new BigDecimal("200"));
        p1.setPaymentNow(BigDecimal.ZERO);

        com.bananaledger.entity.Purchase pur1 = purchaseService.createPurchase(p1);

        assertEquals(0, new BigDecimal("90.00").compareTo(pur1.getTotalWeightKg()), "Total weight must be 100 - 10 = 90 KG");
        assertEquals(0, new BigDecimal("2700.00").compareTo(pur1.getGrossAmount()), "Gross purchase must be 90 * 30 = 2700");
        assertEquals(0, new BigDecimal("2500.00").compareTo(pur1.getTotalAmount()), "Purchase amount must be 2700 - 200 = 2500");

        SupplierSummaryDto s1 = supplierService.getSupplierSummary(vendor.getId());
        assertEquals(0, new BigDecimal("2500.00").compareTo(s1.getOutstandingBalance()), "Outstanding balance must be 2500");

        // TEST 2 (Section 9): Previous = 2500, Net = 100, LS = 10, Rate = 30, Discount = 200, Payment = 2000
        // Previous = 2500, New Purchase = 2500 -> Total Due = 5000 - Payment 2000 -> Remaining = 3000
        SupplierRequest req2 = new SupplierRequest();
        req2.setName("KG Formula Test Vendor 2");
        Supplier vendor2 = supplierService.createSupplier(req2);

        // Initial purchase to establish 5,000 previous outstanding
        PurchaseRequest pInit = new PurchaseRequest();
        pInit.setSupplierId(vendor2.getId());
        pInit.setPurchaseDate(LocalDate.now());
        pInit.setNetWeightKg(new BigDecimal("200"));
        pInit.setLsWeightKg(BigDecimal.ZERO);
        pInit.setRatePerKg(new BigDecimal("25"));
        pInit.setPaymentNow(BigDecimal.ZERO);
        purchaseService.createPurchase(pInit); // 5,000 outstanding

        SupplierSummaryDto sInit = supplierService.getSupplierSummary(vendor2.getId());
        assertEquals(0, new BigDecimal("5000.00").compareTo(sInit.getOutstandingBalance()), "Initial outstanding must be 5000");

        // Section 9 Test: Net 100, LS 10, Rate 30, Discount 200, Payment 2000
        PurchaseRequest p2 = new PurchaseRequest();
        p2.setSupplierId(vendor2.getId());
        p2.setPurchaseDate(LocalDate.now());
        p2.setNetWeightKg(new BigDecimal("100"));
        p2.setLsWeightKg(new BigDecimal("10"));
        p2.setRatePerKg(new BigDecimal("30"));
        p2.setDiscountAmount(new BigDecimal("200"));
        p2.setPaymentNow(new BigDecimal("2000"));

        com.bananaledger.entity.Purchase pur2 = purchaseService.createPurchase(p2);

        assertEquals(0, new BigDecimal("90.00").compareTo(pur2.getTotalWeightKg()), "Total weight must be 90 KG");
        assertEquals(0, new BigDecimal("2700.00").compareTo(pur2.getGrossAmount()), "Gross amount must be 2700");
        assertEquals(0, new BigDecimal("2500.00").compareTo(pur2.getTotalAmount()), "Purchase amount must be 2500");

        SupplierSummaryDto s2 = supplierService.getSupplierSummary(vendor2.getId());
        // Previous 5000 + Purchase 2500 = Total Due 7500 - Payment 2000 = Remaining 5500
        assertEquals(0, new BigDecimal("5500.00").compareTo(s2.getOutstandingBalance()), "Remaining outstanding must be 5500");
    }
}

