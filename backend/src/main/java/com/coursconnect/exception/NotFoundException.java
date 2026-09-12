package com.coursconnect.exception;

import jakarta.ejb.ApplicationException;

@ApplicationException(rollback = false)
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}