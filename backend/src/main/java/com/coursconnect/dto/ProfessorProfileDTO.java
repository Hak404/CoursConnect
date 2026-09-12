package com.coursconnect.dto;

import java.math.BigDecimal;
import java.util.List;

public class ProfessorProfileDTO {

    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Long cityId;
    private String cityName;
    private String profilePhoto;
    private String bio;
    private String teachingAddress;
    private Integer experienceYears;
    private boolean verified;
    private BigDecimal averageRating;
    private int totalReviews;
    private List<SubjectDTO> subjects;
    private List<LevelDTO> levels;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Long getCityId() { return cityId; }
    public void setCityId(Long cityId) { this.cityId = cityId; }
    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }
    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getTeachingAddress() { return teachingAddress; }
    public void setTeachingAddress(String teachingAddress) { this.teachingAddress = teachingAddress; }
    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public BigDecimal getAverageRating() { return averageRating; }
    public void setAverageRating(BigDecimal averageRating) { this.averageRating = averageRating; }
    public int getTotalReviews() { return totalReviews; }
    public void setTotalReviews(int totalReviews) { this.totalReviews = totalReviews; }
    public List<SubjectDTO> getSubjects() { return subjects; }
    public void setSubjects(List<SubjectDTO> subjects) { this.subjects = subjects; }
    public List<LevelDTO> getLevels() { return levels; }
    public void setLevels(List<LevelDTO> levels) { this.levels = levels; }
}