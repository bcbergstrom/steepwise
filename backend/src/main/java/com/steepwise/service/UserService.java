package com.steepwise.service;

import com.steepwise.dto.UserRequest;
import com.steepwise.dto.UserResponse;
import com.steepwise.model.User;
import com.steepwise.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
            .stream()
            .map(UserResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        return UserResponse.from(findUser(id));
    }

    @Transactional
    public UserResponse createUser(UserRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email already registered"
            );
        }

        User user = new User(
            request.email(),
            request.displayName()
        );

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUser(UUID id, UserRequest request) {

        User user = findUser(id);

        user.setEmail(request.email());
        user.setDisplayName(request.displayName());

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(UUID id) {
        User user = findUser(id);
        userRepository.delete(user);
    }

    private User findUser(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "User not found"
            ));
    }
}