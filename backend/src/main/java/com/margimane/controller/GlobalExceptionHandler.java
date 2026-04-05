package com.margimane.controller;

import jakarta.persistence.EntityNotFoundException;
import java.util.Map;
import com.margimane.service.AdminPasswordRequiredException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> onValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream().findFirst().map(fe -> fe.getField() + " " + fe.getDefaultMessage()).orElse("Validation error");
        return Map.of("error", msg);
    }

    @ExceptionHandler({EntityNotFoundException.class, java.util.NoSuchElementException.class})
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> onNotFound(Exception ex) { return Map.of("error", ex.getMessage()); }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> onBadRequest(IllegalArgumentException ex) { return Map.of("error", ex.getMessage()); }

    @ExceptionHandler(AdminPasswordRequiredException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public Map<String, String> onAdminPasswordRequired(AdminPasswordRequiredException ex) {
        return Map.of("error", ex.getMessage(), "code", "ADMIN_PASSWORD_REQUIRED");
    }
}
