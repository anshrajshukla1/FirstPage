package com.firstpage.mapper;

import com.firstpage.dto.request.CreateMicrositeRequest;
import com.firstpage.dto.response.MicrositeListResponse;
import com.firstpage.dto.response.MicrositeResponse;
import com.firstpage.entity.Microsite;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for Microsite entity ↔ DTO conversions.
 * 
 * Why MapStruct over manual mapping?
 * - Compile-time code generation = no reflection overhead at runtime
 * - Type-safe = compilation fails if entity/DTO fields diverge
 * - Reduces boilerplate by 80%+ compared to manual mapping
 */
@Mapper(componentModel = "spring", uses = {SlideMapper.class})
public interface MicrositeMapper {

    @Mapping(target = "slideCount", expression = "java(microsite.getSlideCount())")
    @Mapping(target = "viewCount", constant = "0")
    @Mapping(target = "slides", source = "slides")
    MicrositeResponse toResponse(Microsite microsite);

    @Mapping(target = "previewImageUrl", ignore = true)
    @Mapping(target = "slideCount", expression = "java(microsite.getSlideCount())")
    @Mapping(target = "viewCount", constant = "0")
    MicrositeListResponse toListResponse(Microsite microsite);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "hasBeenViewed", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "scheduledAt", ignore = true)
    @Mapping(target = "expiresAt", ignore = true)
    @Mapping(target = "slides", ignore = true)
    @Mapping(target = "mediaItems", ignore = true)
    @Mapping(target = "reactions", ignore = true)
    @Mapping(target = "replies", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Microsite toEntity(CreateMicrositeRequest request);
}
