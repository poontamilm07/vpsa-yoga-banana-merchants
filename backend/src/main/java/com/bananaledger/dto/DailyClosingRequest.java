package com.bananaledger.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class DailyClosingRequest {

    @NotNull(message = "Closing date is required")
    private LocalDate closingDate;

    private String notes;

    public DailyClosingRequest() {}

    public LocalDate getClosingDate() { return closingDate; }
    public void setClosingDate(LocalDate closingDate) { this.closingDate = closingDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
