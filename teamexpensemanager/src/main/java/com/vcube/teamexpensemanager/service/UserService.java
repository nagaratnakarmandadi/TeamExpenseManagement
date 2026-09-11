package com.vcube.teamexpensemanager.service;

import java.util.List;

import com.vcube.teamexpensemanager.dto.UserRequest;
import com.vcube.teamexpensemanager.entity.User;


public interface UserService {

	User createUser(UserRequest request);

	List<User> getAllUsers();

	User getUserById(Long id);

	void deleteUser(Long id);

}
