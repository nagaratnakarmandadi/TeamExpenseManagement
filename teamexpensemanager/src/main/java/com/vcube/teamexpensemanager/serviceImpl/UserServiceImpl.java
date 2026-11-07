package com.vcube.teamexpensemanager.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.vcube.teamexpensemanager.dto.UserRequest;
import com.vcube.teamexpensemanager.entity.Role;
import com.vcube.teamexpensemanager.entity.User;
import com.vcube.teamexpensemanager.exceptions.BadRequestException;
import com.vcube.teamexpensemanager.exceptions.ResourceNotFoundException;
import com.vcube.teamexpensemanager.repository.UserRepository;
import com.vcube.teamexpensemanager.service.UserService;

@Service
public class UserServiceImpl implements UserService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Override
	public User createUser(UserRequest request) {
		if (userRepository.findByEmail(request.email()).isPresent()) {
			throw new BadRequestException("Email already Exist : " + request.email());
		}

		User user = new User();
		user.setEmail(request.email().trim().toLowerCase());
		user.setName(request.name().trim());
		user.setPassword(passwordEncoder.encode("password123"));
		user.setRole(Role.MEMBER);

		return userRepository.save(user);
	}

	@Override
	public List<User> getAllUsers() {
		return userRepository.findAll();
	}

	@Override
	public User getUserById(Long id) {
		return userRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("user with ID : " + id + "Not found"));
	}

	@Override
	public void deleteUser(Long id) {
		User user = getUserById(id);
		userRepository.delete(user);
	}

}
