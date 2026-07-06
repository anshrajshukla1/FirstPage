package com.firstpage.mapper;

import com.firstpage.dto.response.ReplyResponse;
import com.firstpage.entity.Reply;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReplyMapper {

    ReplyResponse toResponse(Reply reply);
}
