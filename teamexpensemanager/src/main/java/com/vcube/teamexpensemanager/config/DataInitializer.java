package com.vcube.teamexpensemanager.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.vcube.teamexpensemanager.entity.Role;
import com.vcube.teamexpensemanager.entity.User;
import com.vcube.teamexpensemanager.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Ensure default system administrator exists
        if (userRepository.findByEmail("admin@team.io").isEmpty()) {
            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@team.io");
            admin.setPassword(passwordEncoder.encode("password123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }

        // Initialize passwords and roles for existing users if missing
        userRepository.findAll().forEach(user -> {
            boolean updated = false;
            if (user.getPassword() == null || user.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode("password123"));
                updated = true;
            }
            if (user.getRole() == null) {
                user.setRole(user.getEmail().contains("admin") || user.getId() == 1 ? Role.ADMIN : Role.MEMBER);
                updated = true;
            }
            if (updated) {
                userRepository.save(user);
            }
        });
    }
}
