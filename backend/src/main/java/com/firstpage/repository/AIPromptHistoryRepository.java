package com.firstpage.repository;

import com.firstpage.entity.AIPromptHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AIPromptHistoryRepository extends JpaRepository<AIPromptHistory, UUID> {

    Page<AIPromptHistory> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    long countByUserId(UUID userId);
}
