package com.bananaledger.dto;

import com.bananaledger.entity.enums.PaymentMethod;
import java.math.BigDecimal;

public class QuickRepeatTemplateDto {
    private Long vendorId;
    private String vendorName;
    private Integer lastThars;
    private BigDecimal lastPricePerThar;
    private PaymentMethod lastPaymentMethod;
    private BigDecimal previousBalance;

    public QuickRepeatTemplateDto() {}

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public Integer getLastThars() { return lastThars; }
    public void setLastThars(Integer lastThars) { this.lastThars = lastThars; }

    public BigDecimal getLastPricePerThar() { return lastPricePerThar; }
    public void setLastPricePerThar(BigDecimal lastPricePerThar) { this.lastPricePerThar = lastPricePerThar; }

    public PaymentMethod getLastPaymentMethod() { return lastPaymentMethod; }
    public void setLastPaymentMethod(PaymentMethod lastPaymentMethod) { this.lastPaymentMethod = lastPaymentMethod; }

    public BigDecimal getPreviousBalance() { return previousBalance; }
    public void setPreviousBalance(BigDecimal previousBalance) { this.previousBalance = previousBalance; }
}
