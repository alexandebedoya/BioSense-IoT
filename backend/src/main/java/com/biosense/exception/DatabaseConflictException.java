package com.biosense.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DatabaseConflictException extends RuntimeException {
    public DatabaseConflictException(String message) {
        super(message);
    }
}
