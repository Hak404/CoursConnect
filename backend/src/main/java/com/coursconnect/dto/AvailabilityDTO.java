package com.coursconnect.dto;

import com.coursconnect.model.enums.DayOfWeek;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public class AvailabilityDTO {

    private Long id;
    private Long professorId;

    @NotNull(message = "Le jour de la semaine est requis")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "L'heure de début est requise")
    private LocalTime startTime;

    @NotNull(message = "L'heure de fin est requise")
    private LocalTime endTime;

    private boolean active = true;

    public AvailabilityDTO() {}

    public AvailabilityDTO(Long id, Long professorId, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime, boolean active) {
        this.id = id;
        this.professorId = professorId;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProfessorId() { return professorId; }
    public void setProfessorId(Long professorId) { this.professorId = professorId; }
    public DayOfWeek getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}