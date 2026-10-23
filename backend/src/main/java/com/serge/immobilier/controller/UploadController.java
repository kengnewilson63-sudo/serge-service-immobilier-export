package com.serge.immobilier.controller;

import com.serge.immobilier.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final FileStorageService fileStorageService;

    /** Renvoie { "file_url": "/uploads/xxx.jpg" } — même contrat que l'ancien upload client. */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        return Map.of("file_url", fileStorageService.store(file));
    }
}
