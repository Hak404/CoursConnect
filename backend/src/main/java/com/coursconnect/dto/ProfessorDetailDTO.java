package com.coursconnect.dto;

import java.math.BigDecimal;
import java.util.List;

public class ProfessorDetailDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String profilePhoto;
    private Long cityId;
    private String cityName;
    private String bio;
    private Integer experienceYears;
    private boolean verified;
    private BigDecimal averageRating;
    private int totalReviews;
    private List<SubjectDTO> subjects;
    private List<LevelDTO> levels;
    private List<OfferDTO> offers;
    private List<AvailabilityDTO> availabilities;
    private List<ReviewResponseDTO> reviews;
    private int reviewCount;

    public ProfessorDetailDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
    public Long getCityId() { return cityId; }
    public void setCityId(Long cityId) { this.cityId = cityId; }
    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
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
    public List<OfferDTO> getOffers() { return offers; }
    public void setOffers(List<OfferDTO> offers) { this.offers = offers; }
    public List<AvailabilityDTO> getAvailabilities() { return availabilities; }
    public void setAvailabilities(List<AvailabilityDTO> availabilities) { this.availabilities = availabilities; }
    public List<ReviewResponseDTO> getReviews() { return reviews; }
    public void setReviews(List<ReviewResponseDTO> reviews) { this.reviews = reviews; }
    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }
}