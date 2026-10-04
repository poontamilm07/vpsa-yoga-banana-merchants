package com.bananaledger.dto;

import com.bananaledger.entity.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class TransactionDto {
    private String id; // Transaction ID e.g. PUR-..., SAL-..., PAY-...
    private String type; // PURCHASE, SALE, SUPPLIER_PAYMENT, CUSTOMER_PAYMENT, EXPENSE, STOCK_ADJUSTMENT
    private LocalDate date;
    private LocalDateTime timestamp;
    private String partyName; // Supplier or Customer name
    private String partyCode; // SUP-0001 or CUS-0001
    private String partyType; // SUPPLIER or CUSTOMER
    private Long partyId;

    // Bill & KG fields
    private String billNumber;
    private String particulars;
    private String lotNumber;
    private Integer quantity;
    private BigDecimal netWeightKg;
    private BigDecimal lsWeightKg;
    private BigDecimal totalWeightKg;
    private BigDecimal ratePerKg;
    private BigDecimal grossAmount;
    private BigDecimal discountAmount;
    private String itemsJson;

    // Legacy Thar fields
    private Integer thars;
    private BigDecimal unitPrice;

    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private PaymentStatus status;
    private String paymentMethod;
    private String referenceNo;
    private String upiId;
    private String accountName;
    private String upiPhone;
    private String accountNumber;
    private String bankName;
    private String branchName;
    private String ifscCode;
    private String category;
    private String notes;
    private String attachmentUrl;
    private List<Map<String, Object>> allocations; // Allocations details

    public TransactionDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getPartyName() { return partyName; }
    public void setPartyName(String partyName) { this.partyName = partyName; }

    public String getPartyCode() { return partyCode; }
    public void setPartyCode(String partyCode) { this.partyCode = partyCode; }

    public String getPartyType() { return partyType; }
    public void setPartyType(String partyType) { this.partyType = partyType; }

    public Long getPartyId() { return partyId; }
    public void setPartyId(Long partyId) { this.partyId = partyId; }

    public String getBillNumber() { return billNumber; }
    public void setBillNumber(String billNumber) { this.billNumber = billNumber; }

    public String getParticulars() { return particulars; }
    public void setParticulars(String particulars) { this.particulars = particulars; }

    public String getLotNumber() { return lotNumber; }
    public void setLotNumber(String lotNumber) { this.lotNumber = lotNumber; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getNetWeightKg() { return netWeightKg; }
    public void setNetWeightKg(BigDecimal netWeightKg) { this.netWeightKg = netWeightKg; }

    public BigDecimal getLsWeightKg() { return lsWeightKg; }
    public void setLsWeightKg(BigDecimal lsWeightKg) { this.lsWeightKg = lsWeightKg; }

    public BigDecimal getTotalWeightKg() { return totalWeightKg; }
    public void setTotalWeightKg(BigDecimal totalWeightKg) { this.totalWeightKg = totalWeightKg; }

    public BigDecimal getRatePerKg() { return ratePerKg; }
    public void setRatePerKg(BigDecimal ratePerKg) { this.ratePerKg = ratePerKg; }

    public BigDecimal getGrossAmount() { return grossAmount; }
    public void setGrossAmount(BigDecimal grossAmount) { this.grossAmount = grossAmount; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public String getItemsJson() { return itemsJson; }
    public void setItemsJson(String itemsJson) { this.itemsJson = itemsJson; }

    public Integer getThars() { return thars; }
    public void setThars(Integer thars) { this.thars = thars; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }

    public BigDecimal getBalanceAmount() { return balanceAmount; }
    public void setBalanceAmount(BigDecimal balanceAmount) { this.balanceAmount = balanceAmount; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getReferenceNo() { return referenceNo; }
    public void setReferenceNo(String referenceNo) { this.referenceNo = referenceNo; }

    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public String getUpiPhone() { return upiPhone; }
    public void setUpiPhone(String upiPhone) { this.upiPhone = upiPhone; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }

    public List<Map<String, Object>> getAllocations() { return allocations; }
    public void setAllocations(List<Map<String, Object>> allocations) { this.allocations = allocations; }
}
