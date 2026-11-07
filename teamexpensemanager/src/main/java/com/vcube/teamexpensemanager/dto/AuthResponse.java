package com.vcube.teamexpensemanager.dto;

import com.vcube.teamexpensemanager.entity.Role;

public record AuthResponse(
    String token,
    String type,
    Long id,
    String name,
    String email,
    Role role
) {}
