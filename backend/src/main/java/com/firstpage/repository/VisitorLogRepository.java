package com.firstpage.repository;

import com.firstpage.dto.response.VisitorSummary;
import com.firstpage.entity.VisitorLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
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

    /**
     * Most recent log row for a given visitor session — used to update progress
     * (slide index, time spent) instead of inserting a row per heartbeat.
     */
    Optional<VisitorLog> findFirstByMicrositeIdAndSessionIdOrderByVisitedAtDesc(
            UUID micrositeId, String sessionId);

    /**
     * Visitor count and last-opened time for a batch of microsites.
     *
     * <p>The dashboard renders a page of cards at once, so asking per card is an
     * N+1 — this answers the whole page in one grouped query. Microsites nobody
     * has opened simply have no rows and are absent from the result.
     */
    @Query("""
            SELECT new com.firstpage.dto.response.VisitorSummary(
                v.microsite.id, COUNT(DISTINCT v.sessionId), MAX(v.visitedAt))
            FROM VisitorLog v
            WHERE v.microsite.id IN :micrositeIds
            GROUP BY v.microsite.id
            """)
    List<VisitorSummary> summarizeByMicrositeIds(
            @Param("micrositeIds") Collection<UUID> micrositeIds);
}
