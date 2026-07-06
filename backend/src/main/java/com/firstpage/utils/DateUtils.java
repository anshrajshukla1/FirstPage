package com.firstpage.utils;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Utility class for common date and time operations.
 */
public final class DateUtils {

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private DateUtils() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated.");
    }

    /**
     * Formats a LocalDateTime as a human-readable relative time string.
     * Examples: "just now", "2 minutes ago", "3 hours ago", "5 days ago".
     *
     * @param dateTime the date time to format
     * @return a relative time string
     */
    public static String formatRelativeTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "unknown";
        }

        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long seconds = duration.getSeconds();

        if (seconds < 0) {
            return "in the future";
        }
        if (seconds < 60) {
            return "just now";
        }

        long minutes = seconds / 60;
        if (minutes < 60) {
            return minutes == 1 ? "1 minute ago" : minutes + " minutes ago";
        }

        long hours = minutes / 60;
        if (hours < 24) {
            return hours == 1 ? "1 hour ago" : hours + " hours ago";
        }

        long days = hours / 24;
        if (days < 30) {
            return days == 1 ? "1 day ago" : days + " days ago";
        }

        long months = days / 30;
        if (months < 12) {
            return months == 1 ? "1 month ago" : months + " months ago";
        }

        long years = months / 12;
        return years == 1 ? "1 year ago" : years + " years ago";
    }

    /**
     * Checks if the given date time is in the past.
     *
     * @param dateTime the date time to check
     * @return true if the date time is before now
     */
    public static boolean isExpired(LocalDateTime dateTime) {
        if (dateTime == null) {
            return false;
        }
        return dateTime.isBefore(LocalDateTime.now());
    }

    /**
     * Converts a LocalDateTime to an ISO 8601 formatted string.
     *
     * @param dateTime the date time to format
     * @return the ISO 8601 formatted string, or null if input is null
     */
    public static String toISO(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(ISO_FORMATTER);
    }
}
