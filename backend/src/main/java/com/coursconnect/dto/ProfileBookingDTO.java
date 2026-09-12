package com.coursconnect.dto;

import com.coursconnect.model.Booking;
import com.coursconnect.model.enums.BookingStatus;

import java.time.LocalDateTime;

public class ProfileBookingDTO {

    private Long id;
    private Long studentId;
    private String studentName;
    private Long professorId;
    private String professorName;
    private Long offerId;
    private String offerTitle;
    private LocalDateTime scheduledAt;
    private BookingStatus status;

    public ProfileBookingDTO() {}

    public static ProfileBookingDTO fromEntity(Booking b) {
        ProfileBookingDTO dto = new ProfileBookingDTO();
        dto.setId(b.getId());
        dto.setStudentId(b.getStudent().getId());
        dto.setStudentName(b.getStudent().getUser().getFirstName() + " " + b.getStudent().getUser().getLastName());
        dto.setProfessorId(b.getProfessor().getId());
        dto.setProfessorName(b.getProfessor().getUser().getFirstName() + " " + b.getProfessor().getUser().getLastName());
        dto.setOfferId(b.getOffer().getId());
        dto.setOfferTitle(b.getOffer().getTitle());
        dto.setScheduledAt(b.getScheduledAt());
        dto.setStatus(b.getStatus());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public Long getProfessorId() { return professorId; }
    public void setProfessorId(Long professorId) { this.professorId = professorId; }
    public String getProfessorName() { return professorName; }
    public void setProfessorName(String professorName) { this.professorName = professorName; }
    public Long getOfferId() { return offerId; }
    public void setOfferId(Long offerId) { this.offerId = offerId; }
    public String getOfferTitle() { return offerTitle; }
    public void setOfferTitle(String offerTitle) { this.offerTitle = offerTitle; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
}