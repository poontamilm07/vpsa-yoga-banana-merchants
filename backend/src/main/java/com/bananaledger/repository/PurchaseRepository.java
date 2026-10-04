package com.bananaledger.repository;

import com.bananaledger.entity.Purchase;
import com.bananaledger.entity.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    Optional<Purchase> findByTransactionId(String transactionId);

    List<Purchase> findBySupplierIdOrderByPurchaseDateAscCreatedAtAsc(Long supplierId);

    List<Purchase> findBySupplierIdAndStatusNotOrderByPurchaseDateAscCreatedAtAsc(Long supplierId, PaymentStatus status);

    List<Purchase> findByPurchaseDateBetweenOrderByPurchaseDateDescCreatedAtDesc(LocalDate startDate, LocalDate endDate);

    @Query("SELECT p FROM Purchase p WHERE p.supplier.id = :supplierId AND p.status IN ('UNPAID', 'PARTIALLY_PAID') ORDER BY p.purchaseDate ASC, p.createdAt ASC")
    List<Purchase> findUnpaidPurchasesBySupplier(@Param("supplierId") Long supplierId);

    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.purchaseDate = :date AND p.status <> 'VOID'")
    Long countPurchasesByDate(@Param("date") LocalDate date);

    @Query("SELECT SUM(p.totalAmount) FROM Purchase p WHERE p.purchaseDate = :date AND p.status <> 'VOID'")
    Optional<java.math.BigDecimal> sumTotalAmountByDate(@Param("date") LocalDate date);

    @Query("SELECT SUM(p.thars) FROM Purchase p WHERE p.purchaseDate = :date AND p.status <> 'VOID'")
    Optional<Integer> sumTharsByDate(@Param("date") LocalDate date);

    @Query("SELECT SUM(p.totalAmount) FROM Purchase p WHERE p.purchaseDate BETWEEN :startDate AND :endDate AND p.status <> 'VOID'")
    Optional<java.math.BigDecimal> sumTotalAmountBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(p.thars) FROM Purchase p WHERE p.purchaseDate BETWEEN :startDate AND :endDate AND p.status <> 'VOID'")
    Optional<Integer> sumTharsBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    Optional<Purchase> findTopBySupplierIdOrderByCreatedAtDesc(Long supplierId);
}
