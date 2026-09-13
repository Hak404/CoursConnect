package com.coursconnect.dto;

import com.coursconnect.model.enums.BookingStatus;
import com.coursconnect.model.enums.PaymentMethod;
import com.coursconnect.model.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingResponseDTO {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentProfilePhoto;
    private Long professorId;
    private String professorName;
    private Long offerId;
    private String offerTitle;
    private Integer durationMinutes;
    private String locationType;
    private LocalDateTime scheduledAt;
    private BookingStatus status;
    private BigDecimal professorRating;
    private Integer professorReviewCount;
    private String professorProfilePhoto;
    private String subjectLabel;
    private String levelLabel;
    private BigDecimal negotiatedPrice;
    private BigDecimal amount;
    private String currency;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String meetingLocation;
    private String meetingLink;
    private String meetingPlatform;
    private String meetingInstructions;
    private String paymentReference;
    private LocalDateTime paidAt;
    private boolean hasReview;
    private String studentMessage;
    private String professorResponse;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BookingResponseDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getStudentProfilePhoto() { return studentProfilePhoto; }
    public void setStudentProfilePhoto(String studentProfilePhoto) { this.studentProfilePhoto = studentProfilePhoto; }
    public Long getProfessorId() { return professorId; }
    public void setProfessorId(Long professorId) { this.professorId = professorId; }
    public String getProfessorName() { return professorName; }
    public void setProfessorName(String professorName) { this.professorName = professorName; }
    public Long getOfferId() { return offerId; }
    public void setOfferId(Long offerId) { this.offerId = offerId; }
    public String getOfferTitle() { return offerTitle; }
    public void setOfferTitle(String offerTitle) { this.offerTitle = offerTitle; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public String getLocationType() { return locationType; }
    public void setLocationType(String locationType) { this.locationType = locationType; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public BigDecimal getProfessorRating() { return professorRating; }
    public void setProfessorRating(BigDecimal professorRating) { this.professorRating = professorRating; }
    public Integer getProfessorReviewCount() { return professorReviewCount; }
    public void setProfessorReviewCount(Integer professorReviewCount) { this.professorReviewCount = professorReviewCount; }
    public String getProfessorProfilePhoto() { return professorProfilePhoto; }
    public void setProfessorProfilePhoto(String professorProfilePhoto) { this.professorProfilePhoto = professorProfilePhoto; }
    public String getSubjectLabel() { return subjectLabel; }
    public void setSubjectLabel(String subjectLabel) { this.subjectLabel = subjectLabel; }
    public String getLevelLabel() { return levelLabel; }
    public void setLevelLabel(String levelLabel) { this.levelLabel = levelLabel; }
    public BigDecimal getNegotiatedPrice() { return negotiatedPrice; }
    public void setNegotiatedPrice(BigDecimal negotiatedPrice) { this.negotiatedPrice = negotiatedPrice; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getMeetingLocation() { return meetingLocation; }
    public void setMeetingLocation(String meetingLocation) { this.meetingLocation = meetingLocation; }
    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    public String getMeetingPlatform() { return meetingPlatform; }
    public void setMeetingPlatform(String meetingPlatform) { this.meetingPlatform = meetingPlatform; }
    public String getMeetingInstructions() { return meetingInstructions; }
    public void setMeetingInstructions(String meetingInstructions) { this.meetingInstructions = meetingInstructions; }
    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
    public boolean isHasReview() { return hasReview; }
    public void setHasReview(boolean hasReview) { this.hasReview = hasReview; }
    public String getStudentMessage() { return studentMessage; }
    public void setStudentMessage(String studentMessage) { this.studentMessage = studentMessage; }
    public String getProfessorResponse() { return professorResponse; }
    public void setProfessorResponse(String professorResponse) { this.professorResponse = professorResponse; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}