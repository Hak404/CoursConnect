package com.coursconnect.config;

public final class CorsConfig {

    private CorsConfig() {
    }

    public static String getAllowedOrigins() {
        return System.getenv().getOrDefault("CORS_ALLOWED_ORIGINS", "http://localhost:5173");
    }

    /**
     * Resolves the Access-Control-Allow-Origin value for a request.
     * Returns the exact request origin when it is explicitly allowed, "*" when
     * explicitly configured, or null (no CORS header) when the origin is not allowed.
     */
    public static String resolveOrigin(String requestOrigin) {
        if (requestOrigin == null || requestOrigin.isEmpty()) {
            return null;
        }
        String allowed = getAllowedOrigins();
        for (String candidate : allowed.split(",")) {
            String value = candidate.trim();
            if (value.isEmpty()) {
                continue;
            }
            if ("*".equals(value) || value.equals(requestOrigin)) {
                return value.equals("*") ? "*" : requestOrigin;
            }
        }
        return null;
    }
}