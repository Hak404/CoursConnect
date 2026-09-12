package com.coursconnect.dto;

import jakarta.validation.constraints.Size;

public class UpdateProfessorDTO {

    @Size(max = 20, message = "Le téléphone ne doit pas dépasser 20 caractères")
    private String phone;

    private Long cityId;

    @Size(max = 500, message = "L'URL de la photo ne doit pas dépasser 500 caractères")
    private String profilePhoto;

    @Size(max = 2000, message = "La bio ne doit pas dépasser 2000 caractères")
    private String bio;

    @Size(max = 500, message = "L'adresse d'enseignement ne doit pas dépasser 500 caractères")
    private String teachingAddress;

    private Integer experienceYears;

    private java.util.List<Long> subjectIds;
    private java.util.List<Long> levelIds;

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Long getCityId() { return cityId; }
    public void setCityId(Long cityId) { this.cityId = cityId; }
    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getTeachingAddress() { return teachingAddress; }
    public void setTeachingAddress(String teachingAddress) { this.teachingAddress = teachingAddress; }
    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    public java.util.List<Long> getSubjectIds() { return subjectIds; }
    public void setSubjectIds(java.util.List<Long> subjectIds) { this.subjectIds = subjectIds; }
    public java.util.List<Long> getLevelIds() { return levelIds; }
    public void setLevelIds(java.util.List<Long> levelIds) { this.levelIds = levelIds; }
}