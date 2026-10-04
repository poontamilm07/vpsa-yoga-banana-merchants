package com.bananaledger.repository;

import com.bananaledger.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findBySupplierCode(String supplierCode);
    
    @Query("SELECT s FROM Supplier s WHERE s.active = true AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.phone) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.village) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.supplierCode) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Supplier> searchSuppliers(@Param("query") String query);

    @Query("SELECT MAX(CAST(SUBSTRING(s.supplierCode, 5) AS integer)) FROM Supplier s WHERE s.supplierCode LIKE 'SUP-%'")
    Integer findMaxSupplierCodeSeq();
}
