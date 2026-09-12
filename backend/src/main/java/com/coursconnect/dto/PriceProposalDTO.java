package com.coursconnect.dto;

import com.coursconnect.model.enums.PriceProposalStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PriceProposalDTO {

    private Long id;
    private Long offerId;
    private String offerTitle;
    private BigDecimal initialPrice;
    private BigDecimal proposedPrice;
    private Long professorId;
    private String professorName;
    private Long studentId;
    private String studentName;
    private String message;
    private PriceProposalStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
    private Long bookingId;

    public PriceProposalDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOfferId() { return offerId; }
    public void setOfferId(Long offerId) { this.offerId = offerId; }
    public String getOfferTitle() { return offerTitle; }
    public void setOfferTitle(String offerTitle) { this.offerTitle = offerTitle; }
    public BigDecimal getInitialPrice() { return initialPrice; }
    public void setInitialPrice(BigDecimal initialPrice) { this.initialPrice = initialPrice; }
    public BigDecimal getProposedPrice() { return proposedPrice; }
    public void setProposedPrice(BigDecimal proposedPrice) { this.proposedPrice = proposedPrice; }
    public Long getProfessorId() { return professorId; }
    public void setProfessorId(Long professorId) { this.professorId = professorId; }
    public String getProfessorName() { return professorName; }
    public void setProfessorName(String professorName) { this.professorName = professorName; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public PriceProposalStatus getStatus() { return status; }
    public void setStatus(PriceProposalStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
}