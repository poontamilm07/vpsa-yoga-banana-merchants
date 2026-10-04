package com.bananaledger.repository;

import com.bananaledger.entity.SupplierPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SupplierPaymentRepository extends JpaRepository<SupplierPayment, Long> {
    Optional<SupplierPayment> findByPaymentCode(String paymentCode);

    List<SupplierPayment> findBySupplierIdOrderByPaymentDateAscCreatedAtAsc(Long supplierId);

    List<SupplierPayment> findByPaymentDateBetweenOrderByPaymentDateDescCreatedAtDesc(LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(sp.amount) FROM SupplierPayment sp WHERE sp.paymentDate = :date")
    Optional<java.math.BigDecimal> sumAmountByDate(@Param("date") LocalDate date);

    @Query("SELECT SUM(sp.amount) FROM SupplierPayment sp WHERE sp.paymentDate BETWEEN :startDate AND :endDate")
    Optional<java.math.BigDecimal> sumAmountBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
