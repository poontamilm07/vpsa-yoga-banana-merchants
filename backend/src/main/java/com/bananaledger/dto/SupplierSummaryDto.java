package com.bananaledger.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SupplierSummaryDto {
    private Long id;
    private String supplierCode;
    private String name;
    private String photoUrl;
    private String phone;
    private String whatsappNumber;
    private String village;
    private String area;
    private String address;
    private String notes;
    private boolean active;
    private boolean favorite;
    
    // Aggregated financial metrics
    private BigDecimal totalKgPurchased;
    private Integer totalTharsPurchased;
    private BigDecimal totalPurchaseAmount;
    private BigDecimal totalPaidAmount;
    private BigDecimal outstandingBalance;
    private LocalDate lastTransactionDate;
    private Integer transactionCount;

    // Rate history analytics (per KG and per Thar)
    private BigDecimal lastRatePerKg;
    private BigDecimal avgRatePerKg;
    private BigDecimal highestRatePerKg;
    private BigDecimal lowestRatePerKg;

    private BigDecimal lastRate;
    private BigDecimal avgRate;
    private BigDecimal highestRate;
    private BigDecimal lowestRate;
    private LocalDate oldestPendingDate;

    public SupplierSummaryDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSupplierCode() { return supplierCode; }
    public void setSupplierCode(String supplierCode) { this.supplierCode = supplierCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public boolean isFavorite() { return favorite; }
    public void setFavorite(boolean favorite) { this.favorite = favorite; }

    public BigDecimal getTotalKgPurchased() { return totalKgPurchased; }
    public void setTotalKgPurchased(BigDecimal totalKgPurchased) { this.totalKgPurchased = totalKgPurchased; }

    public Integer getTotalTharsPurchased() { return totalTharsPurchased; }
    public void setTotalTharsPurchased(Integer totalTharsPurchased) { this.totalTharsPurchased = totalTharsPurchased; }

    public BigDecimal getTotalPurchaseAmount() { return totalPurchaseAmount; }
    public void setTotalPurchaseAmount(BigDecimal totalPurchaseAmount) { this.totalPurchaseAmount = totalPurchaseAmount; }

    public BigDecimal getTotalPaidAmount() { return totalPaidAmount; }
    public void setTotalPaidAmount(BigDecimal totalPaidAmount) { this.totalPaidAmount = totalPaidAmount; }

    public BigDecimal getOutstandingBalance() { return outstandingBalance; }
    public void setOutstandingBalance(BigDecimal outstandingBalance) { this.outstandingBalance = outstandingBalance; }

    public LocalDate getLastTransactionDate() { return lastTransactionDate; }
    public void setLastTransactionDate(LocalDate lastTransactionDate) { this.lastTransactionDate = lastTransactionDate; }

    public Integer getTransactionCount() { return transactionCount; }
    public void setTransactionCount(Integer transactionCount) { this.transactionCount = transactionCount; }

    public BigDecimal getLastRatePerKg() { return lastRatePerKg; }
    public void setLastRatePerKg(BigDecimal lastRatePerKg) { this.lastRatePerKg = lastRatePerKg; }

    public BigDecimal getAvgRatePerKg() { return avgRatePerKg; }
    public void setAvgRatePerKg(BigDecimal avgRatePerKg) { this.avgRatePerKg = avgRatePerKg; }

    public BigDecimal getHighestRatePerKg() { return highestRatePerKg; }
    public void setHighestRatePerKg(BigDecimal highestRatePerKg) { this.highestRatePerKg = highestRatePerKg; }

    public BigDecimal getLowestRatePerKg() { return lowestRatePerKg; }
    public void setLowestRatePerKg(BigDecimal lowestRatePerKg) { this.lowestRatePerKg = lowestRatePerKg; }

    public BigDecimal getLastRate() { return lastRate; }
    public void setLastRate(BigDecimal lastRate) { this.lastRate = lastRate; }

    public BigDecimal getAvgRate() { return avgRate; }
    public void setAvgRate(BigDecimal avgRate) { this.avgRate = avgRate; }

    public BigDecimal getHighestRate() { return highestRate; }
    public void setHighestRate(BigDecimal highestRate) { this.highestRate = highestRate; }

    public BigDecimal getLowestRate() { return lowestRate; }
    public void setLowestRate(BigDecimal lowestRate) { this.lowestRate = lowestRate; }

    public LocalDate getOldestPendingDate() { return oldestPendingDate; }
    public void setOldestPendingDate(LocalDate oldestPendingDate) { this.oldestPendingDate = oldestPendingDate; }
}
