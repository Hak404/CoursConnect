package com.coursconnect.exception;

import jakarta.ejb.ApplicationException;

/**
 * Propagates as-is through the EJB container (no EJBException wrapper) and is
 * mapped to HTTP 400 by {@code GlobalExceptionMapper}. Use for validation errors
 * raised inside @Stateless services.
 */
@ApplicationException(rollback = false)
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}