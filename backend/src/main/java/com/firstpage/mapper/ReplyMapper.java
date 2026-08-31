package com.firstpage.mapper;

import com.firstpage.dto.response.ReplyResponse;
import com.firstpage.entity.Reply;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface ReplyMapper {

    @Mapping(target = "isRead", source = "read")
    ReplyResponse toResponse(Reply reply);
}
