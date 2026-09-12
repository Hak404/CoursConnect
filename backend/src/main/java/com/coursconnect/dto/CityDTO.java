package com.coursconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CityDTO {

    private Long id;

    @NotBlank(message = "Le nom de la ville est requis")
    @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères")
    private String name;

    @Size(max = 100, message = "La région ne doit pas dépasser 100 caractères")
    private String region;

    private boolean active = true;

    public CityDTO() {}

    public CityDTO(Long id, String name, String region, boolean active) {
        this.id = id;
        this.name = name;
        this.region = region;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}