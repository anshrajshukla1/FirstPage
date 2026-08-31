package com.firstpage.mapper;

import com.firstpage.dto.response.ThemeResponse;
import com.firstpage.entity.Theme;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface ThemeMapper {

    @Mapping(target = "isPremium", source = "premium")
    ThemeResponse toResponse(Theme theme);
}
