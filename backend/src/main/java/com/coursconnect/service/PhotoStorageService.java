package com.coursconnect.service;

import com.coursconnect.exception.BadRequestException;
import com.coursconnect.util.PhotoValidator;
import jakarta.ejb.Stateless;
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Stores professor profile photos as files on disk (never binaries in MySQL)
 * under {jboss.server.data.dir}/uploads/profiles. The database column
 * professor.profile_photo only stores the public web path of the image.
 * File names are always "prof-<id>.<ext>" so replacement/removal are stable.
 */
@Stateless
public class PhotoStorageService {

    public static final String URL_PREFIX = "/api/uploads/profiles/";

    private static final String SAFE_FILE_PATTERN = "prof-\\d+\\.(jpg|png|webp)";

    public String saveProfessorPhoto(Long professorId, byte[] data, String declaredContentType) {
        String type = PhotoValidator.resolveType(data, declaredContentType);
        String ext = PhotoValidator.extensionFor(type);
        if (ext == null) {
            throw new BadRequestException(
                    "Le fichier n'est pas une image valide. Formats acceptés : JPG, PNG, WEBP");
        }
        Path dir = profilesDir();
        createDir(dir);
        deleteProfessorPhotos(professorId);
        Path file = dir.resolve("prof-" + professorId + "." + ext).normalize();
        try {
            Files.write(file, data);
        } catch (IOException e) {
            throw new IllegalStateException("Impossible d'enregistrer la photo", e);
        }
        return URL_PREFIX + file.getFileName();
    }

    /**
     * Deletes every stored file for the professor ("prof-<id>.*").
     */
    public void deleteProfessorPhotos(Long professorId) {
        Path dir = profilesDir();
        if (!Files.isDirectory(dir)) {
            return;
        }
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(dir, "prof-" + professorId + ".*")) {
            for (Path path : stream) {
                Files.deleteIfExists(path);
            }
        } catch (IOException ignored) {
            // best effort: an orphan file is harmless
        }
    }

    /**
     * Reads a public photo byte array only when the file name is a safe generated
     * name (no separators, no .., no user input). Returns null when invalid/missing.
     */
    public byte[] readPublic(String fileName) {
        if (fileName == null || !fileName.matches(SAFE_FILE_PATTERN)) {
            return null;
        }
        Path dir = profilesDir();
        Path file = dir.resolve(fileName).normalize();
        if (!file.startsWith(dir)) {
            return null;
        }
        try {
            if (!Files.isRegularFile(file)) {
                return null;
            }
            return Files.readAllBytes(file);
        } catch (IOException e) {
            return null;
        }
    }

    public String mediaTypeOf(String fileName) {
        if (fileName == null) {
            return "image/jpeg";
        }
        if (fileName.endsWith(".png")) {
            return "image/png";
        }
        if (fileName.endsWith(".webp")) {
            return "image/webp";
        }
        return "image/jpeg";
    }

    private void createDir(Path dir) {
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            throw new IllegalStateException("Impossible de préparer le dossier des photos", e);
        }
    }

    private Path profilesDir() {
        String base = System.getProperty("jboss.server.data.dir");
        String root = (base != null && !base.isBlank())
                ? base
                : System.getProperty("java.io.tmpdir", ".");
        return Paths.get(root, "uploads", "profiles").toAbsolutePath().normalize();
    }
}