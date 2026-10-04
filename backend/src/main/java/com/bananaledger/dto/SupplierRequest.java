package com.bananaledger.dto;

import jakarta.validation.constraints.NotBlank;

public class SupplierRequest {
    @NotBlank(message = "Supplier name is required")
    private String name;

    private String supplierCode;
    private String photoUrl;
    private String phone;
    private String whatsappNumber;
    private String village;
    private String area;
    private String address;
    private String notes;
    private Boolean active;
    private Boolean favorite;

    public SupplierRequest() {}

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

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Boolean getFavorite() { return favorite; }
    public void setFavorite(Boolean favorite) { this.favorite = favorite; }
}
