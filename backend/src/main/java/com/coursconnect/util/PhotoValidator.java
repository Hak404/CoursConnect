package com.coursconnect.util;

import com.coursconnect.exception.BadRequestException;
import java.util.Set;

/**
 * Validates profile photo uploads: allowed image types (JPG, PNG, WEBP) detected
 * from magic bytes, and a hard size limit. The declared Content-Type is only a hint;
 * the magic bytes are authoritative to avoid uploading dangerous files.
 */
public final class PhotoValidator {

    public static final long MAX_BYTES = 5L * 1024 * 1024;

    public static final Set<String> ALLOWED_DECLARED_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "application/octet-stream"
    );

    private PhotoValidator() {
    }

    /**
     * Resolves the effective MIME type of the uploaded bytes.
     *
     * @throws IllegalArgumentException with a French message when the file is
     *                                  empty, too large, or not a supported image.
     */
    public static String resolveType(byte[] data, String declaredContentType) {
        if (data == null || data.length == 0) {
            throw new BadRequestException("Le fichier est vide");
        }
        if (data.length > MAX_BYTES) {
            throw new BadRequestException("L'image ne doit pas dépasser 5 Mo");
        }
        String detected = detectType(data);
        if (detected == null) {
            throw new BadRequestException(
                    "Le fichier n'est pas une image valide. Formats acceptés : JPG, PNG, WEBP");
        }
        if (declaredContentType != null
                && !declaredContentType.trim().isEmpty()
                && !ALLOWED_DECLARED_TYPES.contains(declaredContentType.trim().toLowerCase())) {
            throw new BadRequestException(
                    "Type de fichier non autorisé. Formats acceptés : JPG, PNG, WEBP");
        }
        return detected;
    }

    public static String detectType(byte[] data) {
        if (data == null || data.length < 12) {
            return null;
        }
        if ((data[0] & 0xFF) == 0xFF && (data[1] & 0xFF) == 0xD8 && (data[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        if ((data[0] & 0xFF) == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47) {
            return "image/png";
        }
        if (data[0] == 'R' && data[1] == 'I' && data[2] == 'F' && data[3] == 'F'
                && data[8] == 'W' && data[9] == 'E' && data[10] == 'B' && data[11] == 'P') {
            return "image/webp";
        }
        return null;
    }

    public static String extensionFor(String mimeType) {
        if (mimeType == null) {
            return null;
        }
        return switch (mimeType.toLowerCase()) {
            case "image/jpeg", "image/jpg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> null;
        };
    }
}