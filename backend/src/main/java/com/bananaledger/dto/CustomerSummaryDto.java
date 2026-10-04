package com.bananaledger.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CustomerSummaryDto {
    private Long id;
    private String customerCode;
    private String name;
    private String photoUrl;
    private String phone;
    private String village;
    private String area;
    private String address;
    private String notes;
    private boolean active;
    private boolean favorite;

    // Aggregated financial metrics
    private Integer totalTharsSold;
    private BigDecimal totalSalesAmount;
    private BigDecimal totalReceivedAmount;
    private BigDecimal outstandingBalance;
    private LocalDate lastTransactionDate;
    private Integer transactionCount;

    public CustomerSummaryDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerCode() { return customerCode; }
    public void setCustomerCode(String customerCode) { this.customerCode = customerCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

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

    public Integer getTotalTharsSold() { return totalTharsSold; }
    public void setTotalTharsSold(Integer totalTharsSold) { this.totalTharsSold = totalTharsSold; }

    public BigDecimal getTotalSalesAmount() { return totalSalesAmount; }
    public void setTotalSalesAmount(BigDecimal totalSalesAmount) { this.totalSalesAmount = totalSalesAmount; }

    public BigDecimal getTotalReceivedAmount() { return totalReceivedAmount; }
    public void setTotalReceivedAmount(BigDecimal totalReceivedAmount) { this.totalReceivedAmount = totalReceivedAmount; }

    public BigDecimal getOutstandingBalance() { return outstandingBalance; }
    public void setOutstandingBalance(BigDecimal outstandingBalance) { this.outstandingBalance = outstandingBalance; }

    public LocalDate getLastTransactionDate() { return lastTransactionDate; }
    public void setLastTransactionDate(LocalDate lastTransactionDate) { this.lastTransactionDate = lastTransactionDate; }

    public Integer getTransactionCount() { return transactionCount; }
    public void setTransactionCount(Integer transactionCount) { this.transactionCount = transactionCount; }
}
