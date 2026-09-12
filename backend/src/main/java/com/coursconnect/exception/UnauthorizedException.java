package com.coursconnect.exception;

import jakarta.ejb.ApplicationException;

@ApplicationException(rollback = false)
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}