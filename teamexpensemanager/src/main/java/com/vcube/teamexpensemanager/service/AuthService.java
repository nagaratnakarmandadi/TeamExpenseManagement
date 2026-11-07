package com.vcube.teamexpensemanager.service;

import com.vcube.teamexpensemanager.dto.AuthResponse;
import com.vcube.teamexpensemanager.dto.LoginRequest;
import com.vcube.teamexpensemanager.dto.RegisterRequest;
import com.vcube.teamexpensemanager.entity.User;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse getCurrentUser();
    User getAuthenticatedUser();
}
