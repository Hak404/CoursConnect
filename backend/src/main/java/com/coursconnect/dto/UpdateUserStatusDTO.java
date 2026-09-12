package com.coursconnect.dto;

import jakarta.validation.constraints.NotNull;

public class UpdateUserStatusDTO {

    @NotNull(message = "L'état (enabled) est requis")
    private Boolean enabled;

    public Boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
}