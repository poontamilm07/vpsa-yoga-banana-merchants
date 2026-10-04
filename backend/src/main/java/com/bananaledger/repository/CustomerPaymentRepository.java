package com.bananaledger.repository;

import com.bananaledger.entity.CustomerPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CustomerPaymentRepository extends JpaRepository<CustomerPayment, Long> {
    Optional<CustomerPayment> findByPaymentCode(String paymentCode);

    List<CustomerPayment> findByCustomerIdOrderByPaymentDateAscCreatedAtAsc(Long customerId);

    List<CustomerPayment> findByPaymentDateBetweenOrderByPaymentDateDescCreatedAtDesc(LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(cp.amount) FROM CustomerPayment cp WHERE cp.paymentDate = :date")
    Optional<java.math.BigDecimal> sumAmountByDate(@Param("date") LocalDate date);

    @Query("SELECT SUM(cp.amount) FROM CustomerPayment cp WHERE cp.paymentDate BETWEEN :startDate AND :endDate")
    Optional<java.math.BigDecimal> sumAmountBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
