package com.firstpage.mapper;

import com.firstpage.dto.response.NotificationResponse;
import com.firstpage.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface NotificationMapper {

    @Mapping(target = "micrositeId", source = "micrositeId")
    @Mapping(target = "isRead", source = "read")
    NotificationResponse toResponse(Notification notification);
}
