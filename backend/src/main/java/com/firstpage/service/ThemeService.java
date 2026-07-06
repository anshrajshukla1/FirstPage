package com.firstpage.service;

import com.firstpage.dto.response.ThemeResponse;
import com.firstpage.entity.Theme;
import com.firstpage.exception.ResourceNotFoundException;
import com.firstpage.mapper.ThemeMapper;
import com.firstpage.repository.ThemeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for theme management. Themes define the visual
 * look-and-feel of microsites via CSS variables.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ThemeService {

    private final ThemeRepository themeRepository;
    private final ThemeMapper themeMapper;

    @Transactional(readOnly = true)
    public List<ThemeResponse> getActiveThemes() {
        return themeRepository.findByIsActiveTrue()
                .stream()
                .map(themeMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ThemeResponse> getFreeThemes() {
        return themeRepository.findByIsPremiumFalseAndIsActiveTrue()
                .stream()
                .map(themeMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ThemeResponse> getThemesByCategory(String category) {
        return themeRepository.findByCategory(category)
                .stream()
                .map(themeMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ThemeResponse getById(UUID id) {
        Theme theme = themeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theme", id));
        return themeMapper.toResponse(theme);
    }

    @Transactional(readOnly = true)
    public ThemeResponse getBySlug(String slug) {
        Theme theme = themeRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Theme", slug));
        return themeMapper.toResponse(theme);
    }
}
