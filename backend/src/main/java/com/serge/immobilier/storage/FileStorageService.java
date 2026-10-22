package com.serge.immobilier.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Enregistre les photos d'annonces sur le disque du serveur (dossier
 * `storage.upload-dir`), qui est exposé publiquement sous `/uploads/**`.
 */
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private static final long MAX_BYTES = 10L * 1024 * 1024;
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif"
    );

    @Value("${storage.upload-dir:./uploads}")
    private String uploadDir;

    public Path root() {
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public void init() {
        try {
            Files.createDirectories(root());
        } catch (IOException e) {
            throw new IllegalStateException("Impossible de créer le dossier d'upload : " + root(), e);
        }
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aucun fichier reçu.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Photo trop lourde (10 Mo maximum).");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        String extension = EXTENSIONS.get(contentType);
        if (extension == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Format non supporté. Utilisez une image JPEG, PNG, WEBP ou GIF.");
        }

        init();
        String filename = UUID.randomUUID().toString().replace("-", "") + extension;
        Path target = root().resolve(filename);
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "La photo n'a pas pu être enregistrée.");
        }
        return "/uploads/" + filename;
    }
}
