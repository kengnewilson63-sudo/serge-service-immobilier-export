package com.serge.immobilier.config;

import com.serge.immobilier.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Crée le dossier d'upload au démarrage et l'expose sous `/uploads/**` : les
 * photos enregistrées par {@link FileStorageService} sont ainsi accessibles
 * publiquement (elles sont référencées par les annonces, pas confidentielles).
 * <p>
 * Sert aussi le frontend React compilé (`frontend.dir`, par défaut `./frontend`,
 * où l'on copie le contenu de `dist/`). Ouvrir /admin ou /biens/mon-bien renvoie
 * alors index.html et c'est le routeur React qui affiche la bonne page — sans ce
 * mécanisme, ces adresses renvoient un 404 en production.
 */
@Configuration
@RequiredArgsConstructor
public class StorageConfig implements WebMvcConfigurer {

    private final FileStorageService fileStorageService;

    @Value("${frontend.dir:./frontend}")
    private String frontendDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploads = fileStorageService.root().toUri().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploads.endsWith("/") ? uploads : uploads + "/")
                .setCachePeriod(3600);

        String frontend = Paths.get(frontendDir).toAbsolutePath().normalize().toUri().toString();
        if (!frontend.endsWith("/")) frontend = frontend + "/";

        // index.html et les fichiers racine du site compilé (manifest.json, favicon…).
        // `/images/**` : photos du dossier public/images/. Une seule déclaration :
        // deux déclarations pour la même route faisaient renvoyer 403 par la sécurité.
        registry.addResourceHandler("/*.html", "/manifest.json", "/favicon.ico",
                        "/logo192.png", "/logo512.png")
                .addResourceLocations(frontend)
                .setCachePeriod(0);

        // Assets versionnés par Vite (nom avec hash) : cache long.
        registry.addResourceHandler("/assets/**")
                .addResourceLocations(frontend + "assets/")
                .setCachePeriod(31536000);

        // Images stables (URL sans hash) : cache d'un jour, remplacées sans rebuild.
        registry.addResourceHandler("/images/**")
                .addResourceLocations(frontend + "images/")
                .setCachePeriod(86400);
    }

    /** Routes de l'application React : renvoie index.html (routeur côté client). */
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        for (String route : new String[]{
                "/", "/biens", "/biens/**", "/services", "/a-propos", "/contact",
                "/admin", "/login", "/register", "/forgot-password", "/reset-password"}) {
            registry.addViewController(route).setViewName("forward:/index.html");
        }
    }

    @Bean
    CommandLineRunner initStorage() {
        return args -> fileStorageService.init();
    }
}
