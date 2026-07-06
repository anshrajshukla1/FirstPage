package com.firstpage.utils;

import java.security.SecureRandom;
import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Utility class for generating URL-safe slugs from text.
 */
public final class SlugUtils {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern MULTIPLE_HYPHENS = Pattern.compile("-{2,}");
    private static final String ALPHANUMERIC = "abcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private SlugUtils() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated.");
    }

    /**
     * Converts text to a URL-safe slug.
     * Handles Unicode normalization, whitespace replacement, and special character removal.
     *
     * @param text the text to convert
     * @return a URL-safe slug string
     */
    public static String generateSlug(String text) {
        if (text == null || text.isBlank()) {
            return generateRandomSlug(8);
        }
        return toSlug(text);
    }

    /**
     * Generates a random alphanumeric slug of the specified length.
     *
     * @param length the desired length of the slug
     * @return a random alphanumeric string
     */
    public static String generateRandomSlug(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
        }
        return sb.toString();
    }

    /**
     * Converts input text to a lowercase, hyphenated slug.
     * Normalizes Unicode, replaces spaces with hyphens, and removes special characters.
     *
     * @param input the input text
     * @return a clean slug string
     */
    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String slug = WHITESPACE.matcher(normalized).replaceAll("-");
        slug = NON_LATIN.matcher(slug).replaceAll("");
        slug = MULTIPLE_HYPHENS.matcher(slug).replaceAll("-");
        slug = slug.toLowerCase(Locale.ENGLISH);
        slug = slug.replaceAll("^-|-$", "");

        // Append random suffix for uniqueness
        return slug + "-" + generateRandomSlug(6);
    }
}
