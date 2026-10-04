package com.bananaledger.repository;

import com.bananaledger.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findAllByOrderByTransactionDateDescCreatedAtDesc();

    List<InventoryTransaction> findByTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(LocalDate startDate, LocalDate endDate);

    Optional<InventoryTransaction> findTopByOrderByCreatedAtDesc();

    @Query("SELECT SUM(it.tharsChange) FROM InventoryTransaction it")
    Optional<Integer> sumCurrentStock();

    @Query("SELECT SUM(it.tharsChange) FROM InventoryTransaction it WHERE it.type = 'DAMAGE' AND it.transactionDate = :date")
    Optional<Integer> sumDamagedTharsByDate(@Param("date") LocalDate date);
}
