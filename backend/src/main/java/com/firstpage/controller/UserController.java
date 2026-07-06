package com.firstpage.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.firstpage.dto.request.UpdateUserRequest;
import com.firstpage.dto.response.ApiResponse;
import com.firstpage.dto.response.UserResponse;
import com.firstpage.service.UserService;
import com.google.firebase.auth.FirebaseToken;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST controller for user profile management.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management endpoints")
public class UserController {

    private final UserService userService;

    /**
     * Returns the current authenticated user's profile.
     *
     * @param authentication the Spring Security authentication object
     * @return the current user's profile
     */
    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the profile of the currently authenticated user")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        String firebaseUid = (String) authentication.getPrincipal();
        UserResponse user = userService.getCurrentUser(firebaseUid);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /**
     * Updates the current authenticated user's profile.
     *
     * @param authentication the Spring Security authentication object
     * @param request        the update request containing new profile data
     * @return the updated user profile
     */
    @PutMapping("/me")
    @Operation(summary = "Update profile", description = "Updates the current user's profile information")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest request) {
        String firebaseUid = (String) authentication.getPrincipal();
        UserResponse user = userService.updateProfile(firebaseUid, request);
        return ResponseEntity.ok(ApiResponse.success(user, "Profile updated successfully."));
    }

    /**
     * Syncs user data from Firebase to the database after Google Sign-In.
     * Creates the user if they don't exist, or updates their last login time.
     *
     * @param authentication the Spring Security authentication containing Firebase token
     * @return the synced user profile
     */
    @PostMapping("/sync")
    @Operation(summary = "Sync user", description = "Syncs Firebase user data to the database after sign-in")
    public ResponseEntity<ApiResponse<UserResponse>> syncUser(Authentication authentication) {
        String firebaseUid = (String) authentication.getPrincipal();
        FirebaseToken token = (FirebaseToken) authentication.getCredentials();

        UserResponse user = userService.getOrCreateUser(
            firebaseUid,
            token.getEmail(),
            token.getName(),
            token.getPicture()
        );

        return ResponseEntity.ok(ApiResponse.success(user, "User synced successfully."));
    }
}
