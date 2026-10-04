package com.bananaledger.repository;

import com.bananaledger.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCustomerCode(String customerCode);

    @Query("SELECT c FROM Customer c WHERE c.active = true AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.phone) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.village) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Customer> searchCustomers(@Param("query") String query);

    @Query("SELECT MAX(CAST(SUBSTRING(c.customerCode, 5) AS integer)) FROM Customer c WHERE c.customerCode LIKE 'CUS-%'")
    Integer findMaxCustomerCodeSeq();
}
