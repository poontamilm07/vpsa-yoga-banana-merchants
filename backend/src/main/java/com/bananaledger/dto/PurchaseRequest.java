package com.bananaledger.dto;

import com.bananaledger.entity.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PurchaseRequest {

    @NotNull(message = "Supplier is required")
    private Long supplierId;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    private String billNumber;
    private String particulars;
    private String lotNumber;
    private Integer quantity;

    private BigDecimal netWeightKg;
    private BigDecimal lsWeightKg;
    private BigDecimal totalWeightKg;
    private BigDecimal ratePerKg;
    private BigDecimal grossAmount;
    private BigDecimal discountAmount = BigDecimal.ZERO;
    private String itemsJson;

    // Legacy Thar fields (Optional fallback)
    private Integer thars;
    private BigDecimal pricePerThar;

    private BigDecimal paymentNow = BigDecimal.ZERO;
    private PaymentMethod paymentMethod = PaymentMethod.CASH;
    private String referenceNo;
    private String upiId;
    private String accountName;
    private String upiPhone;
    private String accountNumber;
    private String bankName;
    private String branchName;
    private String ifscCode;
    private String notes;
    private String attachmentUrl;

    public PurchaseRequest() {}

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }

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

    public BigDecimal getPricePerThar() { return pricePerThar; }
    public void setPricePerThar(BigDecimal pricePerThar) { this.pricePerThar = pricePerThar; }

    public BigDecimal getPaymentNow() { return paymentNow; }
    public void setPaymentNow(BigDecimal paymentNow) { this.paymentNow = paymentNow; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

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

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }
}
