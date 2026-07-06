package com.firstpage.dto.response;

import com.firstpage.entity.enums.AnimationType;
import com.firstpage.entity.enums.SlideType;

import java.util.List;
import java.util.UUID;

/**
 * Slide response DTO including associated media items.
 */
public record SlideResponse(
        UUID id,
        int orderIndex,
        SlideType type,
        String title,
        String content,
        AnimationType animationType,
        String backgroundType,
        List<MediaResponse> media
) {}
