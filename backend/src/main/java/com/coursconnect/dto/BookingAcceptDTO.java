package com.coursconnect.dto;

import jakarta.validation.constraints.Size;

public class BookingAcceptDTO {

    @Size(max = 500, message = "Le lien de réunion ne doit pas dépasser 500 caractères")
    private String meetingLink;

    @Size(max = 500, message = "Le lieu de rendez-vous ne doit pas dépasser 500 caractères")
    private String meetingLocation;

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    public String getMeetingLocation() { return meetingLocation; }
    public void setMeetingLocation(String meetingLocation) { this.meetingLocation = meetingLocation; }
}