package com.firstpage.dto.response;

import com.firstpage.entity.enums.MediaType;

import java.util.UUID;

/**
 * Media response DTO with Cloudinary URL and metadata.
 */
public record MediaResponse(
        UUID id,
        MediaType type,
        String url,
        String caption,
        int orderIndex
) {}
