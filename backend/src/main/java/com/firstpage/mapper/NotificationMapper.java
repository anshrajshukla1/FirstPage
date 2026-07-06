package com.firstpage.mapper;

import com.firstpage.dto.response.NotificationResponse;
import com.firstpage.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "micrositeId", source = "micrositeId")
    NotificationResponse toResponse(Notification notification);
}
