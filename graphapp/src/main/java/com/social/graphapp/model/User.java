package com.social.graphapp.model;

public record User(
        long userId,
        String name,
        Integer gender,
        Integer age,
        String region,
        String source
) {
}