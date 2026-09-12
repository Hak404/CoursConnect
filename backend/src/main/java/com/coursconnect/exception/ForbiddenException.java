package com.coursconnect.exception;

import jakarta.ejb.ApplicationException;

@ApplicationException(rollback = false)
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}