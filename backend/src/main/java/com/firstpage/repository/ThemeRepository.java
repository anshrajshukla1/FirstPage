package com.firstpage.repository;

import com.firstpage.entity.Theme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ThemeRepository extends JpaRepository<Theme, UUID> {

    List<Theme> findByIsActiveTrue();

    List<Theme> findByCategory(String category);

    Optional<Theme> findBySlug(String slug);

    List<Theme> findByIsPremiumFalseAndIsActiveTrue();
}
