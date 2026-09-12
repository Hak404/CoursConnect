package com.coursconnect.dto;

import java.math.BigDecimal;

public class SearchCriteriaDTO {

    private Long cityId;
    private String cityName;
    private Long subjectId;
    private Long levelId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal minRating;
    private String courseType;
    private Boolean verifiedOnly;
    private String sortBy = "rating";
    private int page = 0;
    private int size = 12;

    public SearchCriteriaDTO() {}

    public Long getCityId() { return cityId; }
    public void setCityId(Long cityId) { this.cityId = cityId; }
    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }
    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    public Long getLevelId() { return levelId; }
    public void setLevelId(Long levelId) { this.levelId = levelId; }
    public BigDecimal getMinPrice() { return minPrice; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }
    public BigDecimal getMaxPrice() { return maxPrice; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }
    public BigDecimal getMinRating() { return minRating; }
    public void setMinRating(BigDecimal minRating) { this.minRating = minRating; }
    public String getCourseType() { return courseType; }
    public void setCourseType(String courseType) { this.courseType = courseType; }
    public Boolean getVerifiedOnly() { return verifiedOnly; }
    public void setVerifiedOnly(Boolean verifiedOnly) { this.verifiedOnly = verifiedOnly; }
    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
}