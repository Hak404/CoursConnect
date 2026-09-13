package com.coursconnect.dto;

import jakarta.validation.constraints.Size;

/**
 * Optional payload for booking acceptance. Only used to override the physical
 * meeting location for PROFESSOR_HOME offers; online bookings accept without
 * a meeting link (it is attached afterwards through /meeting).
 */
public class BookingAcceptDTO {

    @Size(max = 500, message = "Le lieu de rendez-vous ne doit pas dépasser 500 caractères")
    private String meetingLocation;

    public String getMeetingLocation() { return meetingLocation; }
    public void setMeetingLocation(String meetingLocation) { this.meetingLocation = meetingLocation; }
}