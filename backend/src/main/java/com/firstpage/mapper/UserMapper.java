package com.firstpage.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.firstpage.dto.request.UpdateUserRequest;
import com.firstpage.dto.response.UserResponse;
import com.firstpage.entity.User;

/**
 * MapStruct mapper for User entity to/from DTOs.
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Maps a User entity to a UserResponse DTO.
     */
    UserResponse toResponse(User user);

    /**
     * Updates an existing User entity from an UpdateUserRequest DTO.
     * Ignores the id field to prevent accidental overwrites.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "firebaseUid", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateFromRequest(UpdateUserRequest request, @MappingTarget User user);
}
