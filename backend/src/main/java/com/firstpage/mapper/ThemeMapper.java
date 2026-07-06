package com.firstpage.mapper;

import com.firstpage.dto.response.ThemeResponse;
import com.firstpage.entity.Theme;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ThemeMapper {

    ThemeResponse toResponse(Theme theme);
}
