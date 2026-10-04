package com.bananaledger.repository;

import com.bananaledger.entity.PaymentAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentAllocationRepository extends JpaRepository<PaymentAllocation, Long> {
    List<PaymentAllocation> findBySupplierPaymentId(Long supplierPaymentId);
    List<PaymentAllocation> findByPurchaseId(Long purchaseId);
    List<PaymentAllocation> findByCustomerPaymentId(Long customerPaymentId);
    List<PaymentAllocation> findBySaleId(Long saleId);
}
