package com.firstpage.mapper;

import com.firstpage.dto.response.MediaResponse;
import com.firstpage.entity.Media;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MediaMapper {

    MediaResponse toResponse(Media media);
}
