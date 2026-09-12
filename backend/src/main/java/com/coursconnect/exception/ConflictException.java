package com.coursconnect.exception;

import jakarta.ejb.ApplicationException;

@ApplicationException(rollback = false)
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}