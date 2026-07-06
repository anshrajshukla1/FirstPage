package com.firstpage.repository;

import com.firstpage.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MediaRepository extends JpaRepository<Media, UUID> {

    List<Media> findByMicrositeIdOrderByOrderIndexAsc(UUID micrositeId);

    List<Media> findBySlideIdOrderByOrderIndexAsc(UUID slideId);

    List<Media> findByMicrositeId(UUID micrositeId);

    void deleteAllByMicrositeId(UUID micrositeId);
}
