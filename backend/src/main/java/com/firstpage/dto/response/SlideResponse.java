package com.firstpage.dto.response;

import com.firstpage.entity.enums.AnimationType;
import com.firstpage.entity.enums.SlideType;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Slide response DTO including associated media items.
 *
 * @param content free prose, used by the narrative slide types
 * @param config  structured per-type settings; shape depends on {@code type}
 */
public record SlideResponse(
        UUID id,
        int orderIndex,
        SlideType type,
        String title,
        String content,
        Map<String, Object> config,
        AnimationType animationType,
        String backgroundType,
        List<MediaResponse> media
) {}
