package com.firstpage.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.firstpage.dto.request.UpdateUserRequest;
import com.firstpage.dto.response.UserResponse;
import com.firstpage.entity.User;
import com.firstpage.entity.enums.Role;
import com.firstpage.exception.ResourceNotFoundException;
import com.firstpage.mapper.UserMapper;
import com.firstpage.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service handling user registration, profile management, and authentication sync.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    /**
     * Gets or creates a user based on Firebase authentication data.
     * Called after Google Sign-In to sync the user record to the database.
     *
     * @param firebaseUid the Firebase UID
     * @param email       the user's email address
     * @param displayName the user's display name
     * @param photoUrl    the user's photo URL
     * @return the user response DTO
     */
    @Transactional
    public UserResponse getOrCreateUser(String firebaseUid, String email,
                                         String displayName, String photoUrl) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
            .map(existingUser -> {
                existingUser.setLastLoginAt(LocalDateTime.now());
                if (displayName != null) {
                    existingUser.setDisplayName(displayName);
                }
                if (photoUrl != null) {
                    existingUser.setPhotoUrl(photoUrl);
                }
                log.debug("Existing user synced: {}", firebaseUid);
                return userRepository.save(existingUser);
            })
            .orElseGet(() -> {
                User newUser = User.builder()
                    .firebaseUid(firebaseUid)
                    .email(email)
                    .displayName(displayName)
                    .photoUrl(photoUrl)
                    .role(Role.USER)
                    .lastLoginAt(LocalDateTime.now())
                    .build();
                log.info("New user created: {} ({})", email, firebaseUid);
                return userRepository.save(newUser);
            });

        return userMapper.toResponse(user);
    }

    /**
     * Retrieves the current user's profile by Firebase UID.
     *
     * @param firebaseUid the Firebase UID
     * @return the user response DTO
     * @throws ResourceNotFoundException if the user does not exist
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String firebaseUid) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
            .orElseThrow(() -> new ResourceNotFoundException("User", firebaseUid));
        return userMapper.toResponse(user);
    }

    /**
     * Updates the current user's profile.
     *
     * @param firebaseUid the Firebase UID
     * @param request     the update request DTO
     * @return the updated user response DTO
     * @throws ResourceNotFoundException if the user does not exist
     */
    @Transactional
    public UserResponse updateProfile(String firebaseUid, UpdateUserRequest request) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
            .orElseThrow(() -> new ResourceNotFoundException("User", firebaseUid));

        userMapper.updateFromRequest(request, user);
        User saved = userRepository.save(user);

        log.debug("User profile updated: {}", firebaseUid);
        return userMapper.toResponse(saved);
    }
}
