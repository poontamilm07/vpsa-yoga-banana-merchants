package com.bananaledger.repository;

import com.bananaledger.entity.Sale;
import com.bananaledger.entity.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    Optional<Sale> findByTransactionId(String transactionId);

    List<Sale> findByCustomerIdOrderBySaleDateAscCreatedAtAsc(Long customerId);

    List<Sale> findBySaleDateBetweenOrderBySaleDateDescCreatedAtDesc(LocalDate startDate, LocalDate endDate);

    @Query("SELECT s FROM Sale s WHERE s.customer.id = :customerId AND s.status IN ('UNPAID', 'PARTIALLY_PAID') ORDER BY s.saleDate ASC, s.createdAt ASC")
    List<Sale> findUnpaidSalesByCustomer(@Param("customerId") Long customerId);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.saleDate = :date AND s.status <> 'VOID'")
    Long countSalesByDate(@Param("date") LocalDate date);

    @Query("SELECT SUM(s.totalAmount) FROM Sale s WHERE s.saleDate = :date AND s.status <> 'VOID'")
    Optional<java.math.BigDecimal> sumTotalAmountByDate(@Param("date") LocalDate date);

    @Query("SELECT SUM(s.thars) FROM Sale s WHERE s.saleDate = :date AND s.status <> 'VOID'")
    Optional<Integer> sumTharsByDate(@Param("date") LocalDate date);

    @Query("SELECT SUM(s.totalAmount) FROM Sale s WHERE s.saleDate BETWEEN :startDate AND :endDate AND s.status <> 'VOID'")
    Optional<java.math.BigDecimal> sumTotalAmountBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(s.thars) FROM Sale s WHERE s.saleDate BETWEEN :startDate AND :endDate AND s.status <> 'VOID'")
    Optional<Integer> sumTharsBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    Optional<Sale> findTopByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
