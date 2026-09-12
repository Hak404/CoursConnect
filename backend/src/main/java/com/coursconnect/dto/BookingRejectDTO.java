package com.coursconnect.dto;

import jakarta.validation.constraints.Size;

public class BookingRejectDTO {

    @Size(max = 500, message = "Le motif ne doit pas dépasser 500 caractères")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}