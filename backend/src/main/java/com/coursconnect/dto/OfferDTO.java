package com.coursconnect.dto;

import com.coursconnect.model.enums.CourseType;
import com.coursconnect.model.enums.LocationType;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * The offer exposes the preferred meeting <em>platform</em> (public, e.g. Zoom)
 * but never a meeting link: the link is attached to each booking and revealed
 * only to its participants after acceptance.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OfferDTO {

    private Long id;
    private Long professorId;

    @NotBlank(message = "Le titre est requis")
    @Size(max = 200, message = "Le titre ne doit pas dépasser 200 caractères")
    private String title;

    @Size(max = 2000, message = "La description ne doit pas dépasser 2000 caractères")
    private String description;

    @NotNull(message = "Le prix est requis")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit être supérieur à 0")
    private BigDecimal price;

    @NotNull(message = "La durée est requise")
    @Min(value = 15, message = "La durée minimum est de 15 minutes")
    @Max(value = 600, message = "La durée maximum est de 600 minutes")
    private Integer durationMinutes;

    @NotNull(message = "Le type de cours est requis")
    private CourseType courseType;

    @NotNull(message = "Le type de lieu est requis")
    private LocationType locationType;

    @Size(max = 50, message = "La plateforme ne doit pas dépasser 50 caractères")
    private String meetingPlatform;

    private boolean active = true;
    private LocalDateTime createdAt;

    public OfferDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProfessorId() { return professorId; }
    public void setProfessorId(Long professorId) { this.professorId = professorId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public CourseType getCourseType() { return courseType; }
    public void setCourseType(CourseType courseType) { this.courseType = courseType; }
    public LocationType getLocationType() { return locationType; }
    public void setLocationType(LocationType locationType) { this.locationType = locationType; }
    public String getMeetingPlatform() { return meetingPlatform; }
    public void setMeetingPlatform(String meetingPlatform) { this.meetingPlatform = meetingPlatform; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}