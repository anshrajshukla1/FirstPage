package com.firstpage.repository;

import com.firstpage.entity.Microsite;
import com.firstpage.entity.enums.MicrositeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MicrositeRepository extends JpaRepository<Microsite, UUID> {

    Page<Microsite> findByUserId(UUID userId, Pageable pageable);

    Page<Microsite> findByUserIdAndStatus(UUID userId, MicrositeStatus status, Pageable pageable);

    Optional<Microsite> findBySlug(String slug);

    boolean existsBySlug(String slug);

    long countByUserId(UUID userId);

    long countByUserIdAndStatus(UUID userId, MicrositeStatus status);
}
