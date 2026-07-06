package com.firstpage.mapper;

import com.firstpage.dto.request.CreateSlideRequest;
import com.firstpage.dto.response.SlideResponse;
import com.firstpage.entity.Slide;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {MediaMapper.class})
public interface SlideMapper {

    @Mapping(target = "media", source = "mediaItems")
    SlideResponse toResponse(Slide slide);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "microsite", ignore = true)
    @Mapping(target = "orderIndex", ignore = true)
    @Mapping(target = "mediaItems", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Slide toEntity(CreateSlideRequest request);
}
