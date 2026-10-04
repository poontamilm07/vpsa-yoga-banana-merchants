package com.bananaledger.dto;

import com.bananaledger.entity.enums.PaymentMethod;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SaleRequest {

    @NotNull(message = "Customer is required")
    private Long customerId;

    @NotNull(message = "Sale date is required")
    private LocalDate saleDate;

    @NotNull(message = "Number of Thars is required")
    @Min(value = 1, message = "Thars must be at least 1")
    private Integer thars;

    @NotNull(message = "Price per Thar is required")
    private BigDecimal pricePerThar;

    private BigDecimal paymentReceived = BigDecimal.ZERO;

    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    private String notes;

    public SaleRequest() {}

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public LocalDate getSaleDate() { return saleDate; }
    public void setSaleDate(LocalDate saleDate) { this.saleDate = saleDate; }

    public Integer getThars() { return thars; }
    public void setThars(Integer thars) { this.thars = thars; }

    public BigDecimal getPricePerThar() { return pricePerThar; }
    public void setPricePerThar(BigDecimal pricePerThar) { this.pricePerThar = pricePerThar; }

    public BigDecimal getPaymentReceived() { return paymentReceived; }
    public void setPaymentReceived(BigDecimal paymentReceived) { this.paymentReceived = paymentReceived; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
