package com.firstpage.mapper;

import com.firstpage.dto.request.CreateMicrositeRequest;
import com.firstpage.dto.response.MicrositeListResponse;
import com.firstpage.dto.response.MicrositeResponse;
import com.firstpage.entity.Microsite;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct mapper for Microsite entity ↔ DTO conversions.
 * 
 * Why MapStruct over manual mapping?
 * - Compile-time code generation = no reflection overhead at runtime
 * - Type-safe = compilation fails if entity/DTO fields diverge
 * - Reduces boilerplate by 80%+ compared to manual mapping
 */
@Mapper(componentModel = "spring", uses = {SlideMapper.class},
        unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface MicrositeMapper {

    // NOTE: `isXxx` record components need an explicit source. Lombok generates
    // `isAnonymous()` for the field `isAnonymous`, so the JavaBeans property is
    // `anonymous` — without these mappings MapStruct silently emits `false`.
    @Mapping(target = "isAnonymous", source = "anonymous")
    @Mapping(target = "isOneTimeView", source = "oneTimeView")
    @Mapping(target = "isPasswordProtected", source = "passwordProtected")
    @Mapping(target = "slideCount", expression = "java(microsite.getSlideCount())")
    @Mapping(target = "viewCount", constant = "0")
    @Mapping(target = "slides", source = "slides")
    // Derived on read so the column keeps holding just the pasted URL. A
    // YouTube watch URL is unplayable in an <audio> element, so the client has
    // to know which player to build.
    @Mapping(target = "musicProvider",
            expression = "java(com.firstpage.util.MusicUrlParser.providerOf(microsite.getMusicUrl()))")
    @Mapping(target = "musicTrackId",
            expression = "java(com.firstpage.util.MusicUrlParser.trackIdOf(microsite.getMusicUrl()))")
    MicrositeResponse toResponse(Microsite microsite);

    @Mapping(target = "previewImageUrl", ignore = true)
    @Mapping(target = "slideCount", expression = "java(microsite.getSlideCount())")
    @Mapping(target = "viewCount", constant = "0")
    // Both come from visitor_logs, which the entity has no relation to; the
    // service fills them in from one grouped query per page of cards.
    @Mapping(target = "lastViewedAt", ignore = true)
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
