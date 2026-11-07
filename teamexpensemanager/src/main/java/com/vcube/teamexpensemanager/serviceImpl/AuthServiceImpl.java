package com.vcube.teamexpensemanager.serviceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vcube.teamexpensemanager.dto.AuthResponse;
import com.vcube.teamexpensemanager.dto.LoginRequest;
import com.vcube.teamexpensemanager.dto.RegisterRequest;
import com.vcube.teamexpensemanager.entity.Role;
import com.vcube.teamexpensemanager.entity.User;
import com.vcube.teamexpensemanager.exceptions.BadRequestException;
import com.vcube.teamexpensemanager.exceptions.ResourceNotFoundException;
import com.vcube.teamexpensemanager.repository.UserRepository;
import com.vcube.teamexpensemanager.security.JwtTokenProvider;
import com.vcube.teamexpensemanager.service.AuthService;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BadRequestException("Email is already registered: " + request.email());
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role() != null ? request.role() : Role.MEMBER);

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());

        return new AuthResponse(
                token,
                "Bearer",
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Backward compatibility for existing users without initialized password
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
            userRepository.save(user);
        } else if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (user.getRole() == null) {
            user.setRole(Role.MEMBER);
            userRepository.save(user);
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());

        return new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    @Override
    public AuthResponse getCurrentUser() {
        User user = getAuthenticatedUser();
        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());

        return new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    @Override
    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResourceNotFoundException("No authenticated user found in session");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }
}
