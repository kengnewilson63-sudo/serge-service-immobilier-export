package com.serge.immobilier.controller;

import com.serge.immobilier.model.PropertyEntity;
import com.serge.immobilier.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Fichiers SEO servis par le serveur (le frontend est une SPA : ces fichiers
 * doivent être accessibles à la racine du domaine, pas dans le navigateur).
 */
@RestController
@RequiredArgsConstructor
public class SeoController {

    private static final List<String> STATIC_PAGES = List.of("/", "/biens", "/services", "/a-propos", "/contact");

    private final PropertyRepository propertyRepository;

    @Value("${app.public-url:http://localhost:8080}")
    private String publicUrl;

    @Value("${frontend.dir:./frontend}")
    private String frontendDir;

    /** Code de vérification Google Search Console (meta), facultatif. */
    @Value("${app.seo.google-site-verification:}")
    private String googleSiteVerification;

    private String origin() {
        return publicUrl.replaceAll("/+$", "");
    }

    /**
     * Page d'accueil servie avec le canonical et les images déjà remplis côté serveur.
     * Sans ceci, un robot qui n'exécute pas JavaScript ne voit que « %SITE_URL% » à la
     * place de l'adresse du site (Open Graph cassé, images non indexées).
     */
    @GetMapping(value = {"/", "/index.html"}, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> homePage() throws java.io.IOException {
        java.nio.file.Path indexPath = java.nio.file.Paths.get(frontendDir, "index.html");
        if (!java.nio.file.Files.isRegularFile(indexPath)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND,
                    "Le site n'est pas encore compilé : lancez `npm run build` puis copiez dist/ dans backend/frontend.");
        }
        String html = java.nio.file.Files.readString(indexPath, java.nio.charset.StandardCharsets.UTF_8);
        if (googleSiteVerification != null && !googleSiteVerification.isBlank()) {
            html = html.replace("%GOOGLE_SITE_VERIFICATION%", googleSiteVerification);
        }
        html = html.replace("%SITE_URL%", origin()).replace("%VITE_SITE_URL%", origin());
        return ResponseEntity.ok()
                .contentType(new MediaType(MediaType.TEXT_HTML, java.nio.charset.StandardCharsets.UTF_8))
                .header("Cache-Control", "no-cache")
                .body(html);
    }

    /** Sitemap : pages fixes + une entrée par annonce disponible. */
    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemap() {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\""
                + " xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\">\n");
        for (String page : STATIC_PAGES) {
            xml.append("  <url><loc>").append(origin()).append(page).append("</loc></url>\n");
        }
        propertyRepository.findAll(
                        // Les annonces vendues/prises sont en noindex : inutile de les soumettre.
                        (root, query, cb) -> cb.equal(root.get("status"), "disponible"),
                        PageRequest.of(0, 5000, Sort.by(Sort.Direction.ASC, "id")))
                .forEach(p -> {
                    xml.append("  <url><loc>").append(origin()).append("/biens/").append(escape(p)).append("</loc>");
                    if (!p.getImages().isEmpty()) {
                        String first = p.getImages().get(0);
                        xml.append("<image:image><image:loc>").append(origin())
                                .append(first.startsWith("/") ? "" : "/").append(first)
                                .append("</image:loc></image:image>");
                    }
                    xml.append("</url>\n");
                });
        xml.append("</urlset>\n");
        return ResponseEntity.ok(xml.toString());
    }

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> robots() {
        String body = """
                User-agent: *
                Allow: /
                Disallow: /admin
                Disallow: /login
                Disallow: /register
                Disallow: /forgot-password
                Disallow: /reset-password
                Disallow: /api/

                Sitemap: %s/sitemap.xml
                """.formatted(origin());
        return ResponseEntity.ok(body);
    }

    private String escape(PropertyEntity p) {
        return p.getSlug() == null ? String.valueOf(p.getId()) : p.getSlug();
    }
}
