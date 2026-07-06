package com.firstpage.mapper;

import com.firstpage.dto.response.ReactionResponse;
import com.firstpage.entity.Reaction;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReactionMapper {

    ReactionResponse toResponse(Reaction reaction);
}
