package com.bananaledger.dto;

import jakarta.validation.constraints.NotBlank;

public class CustomerRequest {
    @NotBlank(message = "Customer name is required")
    private String name;

    private String photoUrl;
    private String phone;
    private String village;
    private String area;
    private String address;
    private String notes;
    private Boolean active;

    public CustomerRequest() {}

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

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
