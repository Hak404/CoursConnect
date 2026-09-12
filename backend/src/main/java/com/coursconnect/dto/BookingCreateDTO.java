package com.coursconnect.dto;

import com.coursconnect.model.enums.PaymentMethod;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class BookingCreateDTO {

    @NotNull(message = "L'offre est requise")
    private Long offerId;

    @NotNull(message = "La date du cours est requise")
    @Future(message = "La date doit être dans le futur")
    private LocalDateTime scheduledAt;

    @NotNull(message = "Le mode de paiement est requis")
    private PaymentMethod paymentMethod;

    @Size(max = 500, message = "Le lieu de rendez-vous ne doit pas dépasser 500 caractères")
    private String meetingLocation;

    @Size(max = 1000, message = "Le message ne doit pas dépasser 1000 caractères")
    private String studentMessage;

    private Long proposalId;

    public Long getOfferId() { return offerId; }
    public void setOfferId(Long offerId) { this.offerId = offerId; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getMeetingLocation() { return meetingLocation; }
    public void setMeetingLocation(String meetingLocation) { this.meetingLocation = meetingLocation; }
    public String getStudentMessage() { return studentMessage; }
    public void setStudentMessage(String studentMessage) { this.studentMessage = studentMessage; }
    public Long getProposalId() { return proposalId; }
    public void setProposalId(Long proposalId) { this.proposalId = proposalId; }
}