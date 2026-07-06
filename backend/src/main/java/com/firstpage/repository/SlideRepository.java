package com.firstpage.repository;

import com.firstpage.entity.Slide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SlideRepository extends JpaRepository<Slide, UUID> {

    List<Slide> findByMicrositeIdOrderByOrderIndexAsc(UUID micrositeId);

    List<Slide> findByMicrositeId(UUID micrositeId);

    long countByMicrositeId(UUID micrositeId);

    void deleteAllByMicrositeId(UUID micrositeId);
}
