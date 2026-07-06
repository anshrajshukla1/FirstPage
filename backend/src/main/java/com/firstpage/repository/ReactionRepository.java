package com.firstpage.repository;

import com.firstpage.entity.Reaction;
import com.firstpage.entity.enums.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, UUID> {

    List<Reaction> findByMicrositeId(UUID micrositeId);

    long countByMicrositeId(UUID micrositeId);

    long countByMicrositeIdAndType(UUID micrositeId, ReactionType type);
}
