package com.coursconnect.dto;

import jakarta.validation.constraints.Size;

/**
 * Meeting configuration attached to an individual booking by its professor
 * after the reservation is accepted. It never lives on the public offer.
 */
public class MeetingConfigDTO {

    @Size(max = 500, message = "Le lien de la réunion ne doit pas dépasser 500 caractères")
    private String meetingLink;

    @Size(max = 50, message = "La plateforme ne doit pas dépasser 50 caractères")
    private String meetingPlatform;

    @Size(max = 2000, message = "Les instructions ne doivent pas dépasser 2000 caractères")
    private String meetingInstructions;

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    public String getMeetingPlatform() { return meetingPlatform; }
    public void setMeetingPlatform(String meetingPlatform) { this.meetingPlatform = meetingPlatform; }
    public String getMeetingInstructions() { return meetingInstructions; }
    public void setMeetingInstructions(String meetingInstructions) { this.meetingInstructions = meetingInstructions; }
}