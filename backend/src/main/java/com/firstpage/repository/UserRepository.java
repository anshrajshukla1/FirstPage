package com.firstpage.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.firstpage.entity.User;

/**
 * Repository for User entity persistence operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Finds a user by their Firebase UID.
     */
    Optional<User> findByFirebaseUid(String firebaseUid);

    /**
     * Finds a user by their email address.
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks if a user exists with the given Firebase UID.
     */
    boolean existsByFirebaseUid(String firebaseUid);

    /**
     * Checks if a user exists with the given email address.
     */
    boolean existsByEmail(String email);
}
