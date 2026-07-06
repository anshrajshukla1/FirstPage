package com.firstpage.repository;

import com.firstpage.entity.Reply;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReplyRepository extends JpaRepository<Reply, UUID> {

    Page<Reply> findByMicrositeIdOrderByCreatedAtDesc(UUID micrositeId, Pageable pageable);

    long countByMicrositeId(UUID micrositeId);

    long countByMicrositeIdAndIsReadFalse(UUID micrositeId);
}
