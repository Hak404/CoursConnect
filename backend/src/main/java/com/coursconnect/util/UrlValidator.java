package com.coursconnect.util;

/**
 * Validates meeting/join links. Only https URLs are accepted for meeting links:
 * javascript:, data:, file:, ftp:, http: and arbitrary strings are rejected.
 */
public final class UrlValidator {

    private UrlValidator() {
    }

    public static boolean isHttpUrl(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        String s = value.trim().toLowerCase();
        return (s.startsWith("http://") || s.startsWith("https://"))
                && s.length() > "https://".length();
    }

    /**
     * Meeting links must be https (never plain http), which is what Zoom,
     * Google Meet, Microsoft Teams and most conferencing tools use.
     */
    public static boolean isHttpsUrl(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        String s = value.trim().toLowerCase();
        return s.startsWith("https://") && s.length() > "https://".length();
    }

    public static String normalizedOrNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}