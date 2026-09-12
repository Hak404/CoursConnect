package com.coursconnect.dto;

import jakarta.validation.constraints.Size;

public class UpdateStudentDTO {

    @Size(max = 20, message = "Le téléphone ne doit pas dépasser 20 caractères")
    private String phone;

    private Long cityId;

    @Size(max = 500, message = "L'URL de la photo ne doit pas dépasser 500 caractères")
    private String profilePhoto;

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Long getCityId() { return cityId; }
    public void setCityId(Long cityId) { this.cityId = cityId; }
    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
}