package com.social.graphapp.model;

public record CreateUserRequest(
        String name,
        Integer gender,
        Integer age,
        String region
) {}
