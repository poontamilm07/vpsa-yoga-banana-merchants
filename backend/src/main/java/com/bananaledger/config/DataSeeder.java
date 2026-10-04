package com.bananaledger.config;

import com.bananaledger.dto.CustomerPaymentRequest;
import com.bananaledger.dto.PurchaseRequest;
import com.bananaledger.dto.SaleRequest;
import com.bananaledger.dto.SupplierPaymentRequest;
import com.bananaledger.entity.*;
import com.bananaledger.entity.enums.ExpenseCategory;
import com.bananaledger.entity.enums.PaymentMethod;
import com.bananaledger.entity.enums.PaymentStatus;
import com.bananaledger.repository.BusinessSettingRepository;
import com.bananaledger.repository.ExpenseRepository;
import com.bananaledger.repository.PurchaseRepository;
import com.bananaledger.repository.SupplierPaymentRepository;
import com.bananaledger.repository.SupplierRepository;
import com.bananaledger.repository.UserRepository;
import com.bananaledger.service.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BusinessSettingRepository settingRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseRepository purchaseRepository;
    private final SupplierService supplierService;
    private final CustomerService customerService;
    private final PurchaseService purchaseService;
    private final SupplierPaymentService supplierPaymentService;
    private final SaleService saleService;
    private final CustomerPaymentService customerPaymentService;
    private final ExpenseService expenseService;
    private final SupplierPaymentRepository supplierPaymentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      BusinessSettingRepository settingRepository,
                      SupplierRepository supplierRepository,
                      PurchaseRepository purchaseRepository,
                      SupplierPaymentRepository supplierPaymentRepository,
                      SupplierService supplierService,
                      CustomerService customerService,
                      PurchaseService purchaseService,
                      SupplierPaymentService supplierPaymentService,
                      SaleService saleService,
                      CustomerPaymentService customerPaymentService,
                      ExpenseService expenseService,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.settingRepository = settingRepository;
        this.supplierRepository = supplierRepository;
        this.purchaseRepository = purchaseRepository;
        this.supplierPaymentRepository = supplierPaymentRepository;
        this.supplierService = supplierService;
        this.customerService = customerService;
        this.purchaseService = purchaseService;
        this.supplierPaymentService = supplierPaymentService;
        this.saleService = saleService;
        this.customerPaymentService = customerPaymentService;
        this.expenseService = expenseService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedSettings();
        seedDemoBusinessData();
        normalizeHistoricalPayments();
    }

    private void normalizeHistoricalPayments() {
        if (supplierPaymentRepository != null) {
            java.util.List<SupplierPayment> payments = supplierPaymentRepository.findAll();
            for (SupplierPayment sp : payments) {
                if (sp.getNotes() != null && sp.getNotes().contains("Excess payment during purchase PUR-20260923-0017")) {
                    sp.setAmount(new java.math.BigDecimal("20000.00"));
                    sp.setNotes("Payment on purchase PUR-20260923-0017");
                    supplierPaymentRepository.save(sp);
                }
            }
        }
        if (purchaseRepository != null) {
            java.util.List<Purchase> purchases = purchaseRepository.findAll();
            for (Purchase p : purchases) {
                if (p.getSupplier() != null && p.getSupplier().getId().equals(1L)) {
                    p.setPaidAmount(java.math.BigDecimal.ZERO);
                    p.setBalanceAmount(p.getTotalAmount());
                    p.setStatus(PaymentStatus.UNPAID);
                    purchaseRepository.save(p);
                }
            }
        }
    }

    private void seedUsers() {
        userRepository.findByUsername("admin").ifPresentOrElse(admin -> {
            if (!StringUtils.hasText(admin.getRole())) {
                admin.setRole("ROLE_ADMIN");
                userRepository.save(admin);
            }
        }, () -> {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Banana Business Admin");
            admin.setRole("ROLE_ADMIN");
            admin.setActive(true);
            userRepository.save(admin);
        });
    }

    private void seedSettings() {
        // Ensure business name is updated to VPSA YOGA BANANA MERCHANTS
        settingRepository.save(new BusinessSetting("businessName", "VPSA YOGA BANANA MERCHANTS"));
        if (!settingRepository.existsById("businessAddress")) {
            settingRepository.save(new BusinessSetting("businessAddress", "Wholesale Banana Market, Namakkal, Tamil Nadu"));
        }
        if (!settingRepository.existsById("phone1")) {
            settingRepository.save(new BusinessSetting("phone1", "9876543210"));
        }
        if (!settingRepository.existsById("phone2")) {
            settingRepository.save(new BusinessSetting("phone2", "9443322110"));
        }
        if (!settingRepository.existsById("upiName")) {
            settingRepository.save(new BusinessSetting("upiName", "VPSA YOGA BANANA MERCHANTS"));
        }
        if (!settingRepository.existsById("upiId")) {
            settingRepository.save(new BusinessSetting("upiId", "vpsayoga@upi"));
        }
        if (!settingRepository.existsById("upiPhone")) {
            settingRepository.save(new BusinessSetting("upiPhone", "9876543210"));
        }
        if (!settingRepository.existsById("bankAccountHolder")) {
            settingRepository.save(new BusinessSetting("bankAccountHolder", "VPSA YOGA BANANA MERCHANTS"));
        }
        if (!settingRepository.existsById("bankName")) {
            settingRepository.save(new BusinessSetting("bankName", "State Bank of India"));
        }
        if (!settingRepository.existsById("bankBranch")) {
            settingRepository.save(new BusinessSetting("bankBranch", "Namakkal Main Branch"));
        }
        if (!settingRepository.existsById("bankAccountNumber")) {
            settingRepository.save(new BusinessSetting("bankAccountNumber", "39876543210"));
        }
        if (!settingRepository.existsById("bankIfsc")) {
            settingRepository.save(new BusinessSetting("bankIfsc", "SBIN0001234"));
        }
        if (!settingRepository.existsById("bankAccountType")) {
            settingRepository.save(new BusinessSetting("bankAccountType", "Current Account"));
        }
        if (!settingRepository.existsById("currencySymbol")) {
            settingRepository.save(new BusinessSetting("currencySymbol", "₹"));
        }
    }

    private void seedDemoBusinessData() {
        if (supplierRepository.count() > 0) {
            return; // Data already seeded
        }

        LocalDate day1 = LocalDate.now().minusDays(1);
        LocalDate day2 = LocalDate.now();

        // 1. Supplier Kumar (SUP-0001)
        com.bananaledger.dto.SupplierRequest s1Req = new com.bananaledger.dto.SupplierRequest();
        s1Req.setName("Kumar");
        s1Req.setPhone("9876543210");
        s1Req.setVillage("Namakkal");
        s1Req.setArea("Main Market");
        s1Req.setNotes("Primary wholesale banana grower");
        Supplier kumar = supplierService.createSupplier(s1Req);

        // Day 1: 100 Thars @ ₹500 = ₹50,000. Paid ₹25,000. Outstanding = ₹25,000
        PurchaseRequest p1 = new PurchaseRequest();
        p1.setSupplierId(kumar.getId());
        p1.setPurchaseDate(day1);
        p1.setThars(100);
        p1.setPricePerThar(new BigDecimal("500"));
        p1.setPaymentNow(new BigDecimal("25000"));
        p1.setPaymentMethod(PaymentMethod.CASH);
        p1.setNotes("Day 1 bulk load");
        purchaseService.createPurchase(p1);

        // Day 2: 50 Thars @ ₹500 = ₹25,000.
        PurchaseRequest p2 = new PurchaseRequest();
        p2.setSupplierId(kumar.getId());
        p2.setPurchaseDate(day2);
        p2.setThars(50);
        p2.setPricePerThar(new BigDecimal("500"));
        p2.setPaymentNow(BigDecimal.ZERO);
        p2.setNotes("Day 2 second load");
        purchaseService.createPurchase(p2);

        // Day 2 Payment: ₹40,000 -> Allocates ₹25,000 to Day 1 purchase (now FULLY PAID), ₹15,000 to Day 2 purchase (remaining ₹10,000)
        SupplierPaymentRequest spReq = new SupplierPaymentRequest();
        spReq.setSupplierId(kumar.getId());
        spReq.setPaymentDate(day2);
        spReq.setAmount(new BigDecimal("40000"));
        spReq.setPaymentMethod(PaymentMethod.UPI);
        spReq.setReferenceNo("UPI-9928172");
        spReq.setNotes("Partial payment against cumulative purchases");
        supplierPaymentService.createPayment(spReq);

        // 2. Customer Ravi (CUS-0001)
        com.bananaledger.dto.CustomerRequest c1Req = new com.bananaledger.dto.CustomerRequest();
        c1Req.setName("Ravi");
        c1Req.setPhone("9123456789");
        c1Req.setVillage("Salem");
        c1Req.setArea("Bazaar Street");
        c1Req.setNotes("Retail fruit vendor");
        Customer ravi = customerService.createCustomer(c1Req);

        // Sale: 20 Thars @ ₹700 = ₹14,000. Payment = ₹10,000. Outstanding = ₹4,000
        SaleRequest sReq1 = new SaleRequest();
        sReq1.setCustomerId(ravi.getId());
        sReq1.setSaleDate(day2);
        sReq1.setThars(20);
        sReq1.setPricePerThar(new BigDecimal("700"));
        sReq1.setPaymentReceived(new BigDecimal("10000"));
        sReq1.setPaymentMethod(PaymentMethod.CASH);
        sReq1.setNotes("Day 2 initial sale");
        saleService.createSale(sReq1);

        // 3. Additional Demo Suppliers & Customers
        com.bananaledger.dto.SupplierRequest s2Req = new com.bananaledger.dto.SupplierRequest();
        s2Req.setName("Suresh");
        s2Req.setPhone("9443322110");
        s2Req.setVillage("Erode");
        s2Req.setNotes("Organic banana supplier");
        Supplier suresh = supplierService.createSupplier(s2Req);

        PurchaseRequest p3 = new PurchaseRequest();
        p3.setSupplierId(suresh.getId());
        p3.setPurchaseDate(day1);
        p3.setThars(40);
        p3.setPricePerThar(new BigDecimal("480"));
        p3.setPaymentNow(new BigDecimal("19200")); // Fully paid
        p3.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        purchaseService.createPurchase(p3);

        com.bananaledger.dto.CustomerRequest c2Req = new com.bananaledger.dto.CustomerRequest();
        c2Req.setName("Mani");
        c2Req.setPhone("9887766554");
        c2Req.setVillage("Karur");
        Customer mani = customerService.createCustomer(c2Req);

        SaleRequest sReq2 = new SaleRequest();
        sReq2.setCustomerId(mani.getId());
        sReq2.setSaleDate(day2);
        sReq2.setThars(15);
        sReq2.setPricePerThar(new BigDecimal("720"));
        sReq2.setPaymentReceived(new BigDecimal("10800")); // Fully paid
        sReq2.setPaymentMethod(PaymentMethod.UPI);
        saleService.createSale(sReq2);

        // 4. Demo Expenses
        com.bananaledger.dto.ExpenseRequest e1 = new com.bananaledger.dto.ExpenseRequest();
        e1.setExpenseDate(day2);
        e1.setCategory(ExpenseCategory.TRANSPORT);
        e1.setAmount(new BigDecimal("1500"));
        e1.setDescription("Lorry freight charges from Namakkal");
        expenseService.createExpense(e1);

        com.bananaledger.dto.ExpenseRequest e2 = new com.bananaledger.dto.ExpenseRequest();
        e2.setExpenseDate(day2);
        e2.setCategory(ExpenseCategory.LOADING);
        e2.setAmount(new BigDecimal("800"));
        e2.setDescription("Loading & unloading labor payment");
        expenseService.createExpense(e2);
    }
}
