package com.firstpage.repository;

import com.firstpage.entity.VisitorLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface VisitorLogRepository extends JpaRepository<VisitorLog, UUID> {

    Page<VisitorLog> findByMicrositeId(UUID micrositeId, Pageable pageable);

    long countByMicrositeId(UUID micrositeId);

    @Query("SELECT COUNT(DISTINCT v.sessionId) FROM VisitorLog v WHERE v.microsite.id = :micrositeId")
    long countDistinctSessionsByMicrositeId(@Param("micrositeId") UUID micrositeId);

    @Query("SELECT AVG(v.timeSpentSeconds) FROM VisitorLog v WHERE v.microsite.id = :micrositeId")
    Double avgTimeSpentByMicrositeId(@Param("micrositeId") UUID micrositeId);

    @Query("SELECT SUM(v.replayCount) FROM VisitorLog v WHERE v.microsite.id = :micrositeId")
    Long totalReplaysByMicrositeId(@Param("micrositeId") UUID micrositeId);
}
