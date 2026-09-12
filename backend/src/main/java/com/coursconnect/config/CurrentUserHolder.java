package com.coursconnect.config;

import com.coursconnect.model.User;
import jakarta.enterprise.context.RequestScoped;

@RequestScoped
public class CurrentUserHolder {

    private User user;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}