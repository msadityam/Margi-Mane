package com.margimane.service;

public class AdminPasswordRequiredException extends RuntimeException {
    public AdminPasswordRequiredException(String message) {
        super(message);
    }
}
